import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { io as ioClient } from "socket.io-client";
import type { Socket as ClientSocket } from "socket.io-client";
import type { Server as SocketIOServer } from "socket.io";
import type { MeishiData } from "../../src/types/index";
import { setupExchangeSocket } from "./exchangeHandler";

const createMeishi = (id: string, prefecture: string): MeishiData => ({
  id,
  prefecture,
  topics: [
    {
      topic: { id: "t1", text: "たこ焼きは主食", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: new Date().toISOString(),
});

/** イベントを待機する。タイムアウト時は reject する */
const waitForEvent = <T>(
  socket: ClientSocket,
  event: string,
  timeoutMs = 5000,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout waiting for "${event}"`)),
      timeoutMs,
    );
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

/**
 * 指定時間内にイベントが届かないことを確認する。
 * イベントが届けば true、届かなければ false を返す。
 */
const didReceiveEvent = (
  socket: ClientSocket,
  event: string,
  waitMs = 300,
): Promise<boolean> =>
  new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      resolve(false);
    }, waitMs);
    const handler = () => {
      clearTimeout(timer);
      resolve(true);
    };
    socket.once(event, handler);
  });

const connectClient = (port: number): ClientSocket =>
  ioClient(`http://localhost:${port}`, {
    transports: ["websocket"],
    forceNew: true,
  });

const waitForConnect = (socket: ClientSocket): Promise<void> =>
  new Promise((resolve) => {
    if (socket.connected) {
      resolve();
      return;
    }
    socket.on("connect", () => resolve());
  });

const joinRoom = (client: ClientSocket): Promise<void> =>
  new Promise((resolve) => {
    client.emit("join-exchange", undefined, () => resolve());
  });

describe("ExchangeSocketServer", () => {
  let httpServer: HttpServer;
  let ioServer: SocketIOServer;
  let port: number;
  const clients: ClientSocket[] = [];

  const createAndTrackClient = async (): Promise<ClientSocket> => {
    const client = connectClient(port);
    clients.push(client);
    await waitForConnect(client);
    return client;
  };

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        httpServer = createServer();
        ioServer = setupExchangeSocket(httpServer);
        httpServer.listen(0, () => {
          const addr = httpServer.address();
          port = typeof addr === "object" && addr !== null ? addr.port : 0;
          resolve();
        });
      }),
  );

  afterEach(() => {
    for (const client of clients) {
      client.disconnect();
    }
    clients.length = 0;
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        ioServer.close();
        httpServer.close(() => resolve());
      }),
  );

  // --- ルーム参加・退出 ---

  it("join-exchange でルームに参加できる", async () => {
    const client = await createAndTrackClient();

    const result = await new Promise<{ status: string }>((resolve) => {
      client.emit("join-exchange", undefined, (res: { status: string }) => {
        resolve(res);
      });
    });

    expect(result.status).toBe("joined");
  });

  it("leave-exchange でルームから退出できる", async () => {
    const client = await createAndTrackClient();
    await joinRoom(client);

    const result = await new Promise<{ status: string }>((resolve) => {
      client.emit("leave-exchange", undefined, (res: { status: string }) => {
        resolve(res);
      });
    });

    expect(result.status).toBe("left");
  });

  // --- マッチング成功 ---

  it("2クライアントが3秒以内にbumpすると matched イベントが両方に届く", async () => {
    const clientA = await createAndTrackClient();
    const clientB = await createAndTrackClient();
    const meishiA = createMeishi("a1", "大阪府");
    const meishiB = createMeishi("b1", "東京都");

    await joinRoom(clientA);
    await joinRoom(clientB);

    const now = Date.now();

    const matchedA = waitForEvent<{ partnerMeishi: MeishiData }>(clientA, "matched");
    const matchedB = waitForEvent<{ partnerMeishi: MeishiData }>(clientB, "matched");

    clientA.emit("bump", { timestamp: now, meishi: meishiA });
    clientB.emit("bump", { timestamp: now + 500, meishi: meishiB });

    const [resultA, resultB] = await Promise.all([matchedA, matchedB]);

    expect(resultA.partnerMeishi.id).toBe("b1");
    expect(resultA.partnerMeishi.prefecture).toBe("東京都");
    expect(resultB.partnerMeishi.id).toBe("a1");
    expect(resultB.partnerMeishi.prefecture).toBe("大阪府");
  });

  // --- マッチング不成立 ---

  it("単独の bump ではマッチングが成立しない", async () => {
    const client = await createAndTrackClient();
    const meishi = createMeishi("solo1", "北海道");

    await joinRoom(client);

    client.emit("bump", { timestamp: Date.now(), meishi });

    const received = await didReceiveEvent(client, "matched");
    expect(received).toBe(false);
  });

  it("タイムスタンプ差が3秒超の場合はマッチングしない", async () => {
    const clientA = await createAndTrackClient();
    const clientB = await createAndTrackClient();
    const meishiA = createMeishi("a2", "大阪府");
    const meishiB = createMeishi("b2", "東京都");

    await joinRoom(clientA);
    await joinRoom(clientB);

    const now = Date.now();

    clientA.emit("bump", { timestamp: now, meishi: meishiA });
    // 4秒差 — マッチングウィンドウ外
    clientB.emit("bump", { timestamp: now + 4000, meishi: meishiB });

    const receivedA = await didReceiveEvent(clientA, "matched");
    const receivedB = await didReceiveEvent(clientB, "matched");

    expect(receivedA).toBe(false);
    expect(receivedB).toBe(false);
  });

  // --- データクリア ---

  it("マッチング後は bump データがクリアされる（再利用されない）", async () => {
    const clientA = await createAndTrackClient();
    const clientB = await createAndTrackClient();
    const clientC = await createAndTrackClient();
    const meishiA = createMeishi("a3", "大阪府");
    const meishiB = createMeishi("b3", "東京都");
    const meishiC = createMeishi("c3", "福岡県");

    await joinRoom(clientA);
    await joinRoom(clientB);
    await joinRoom(clientC);

    const now = Date.now();

    // A と B がマッチング
    const matchedA = waitForEvent<{ partnerMeishi: MeishiData }>(clientA, "matched");
    const matchedB = waitForEvent<{ partnerMeishi: MeishiData }>(clientB, "matched");

    clientA.emit("bump", { timestamp: now, meishi: meishiA });
    clientB.emit("bump", { timestamp: now + 100, meishi: meishiB });

    await Promise.all([matchedA, matchedB]);

    // C が bump — A のデータはクリア済みなのでマッチングしない
    clientC.emit("bump", { timestamp: now + 200, meishi: meishiC });

    const receivedC = await didReceiveEvent(clientC, "matched");
    expect(receivedC).toBe(false);
  });

  // --- バリデーション ---

  it("bump に meishi が含まれない場合はエラーが返る", async () => {
    const client = await createAndTrackClient();
    await joinRoom(client);

    const error = waitForEvent<{ message: string }>(client, "error");

    client.emit("bump", { timestamp: Date.now() });

    const result = await error;
    expect(result.message).toBeDefined();
  });
});
