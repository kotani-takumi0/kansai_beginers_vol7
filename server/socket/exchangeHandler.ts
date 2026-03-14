import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import type { MeishiData } from "../../src/types/index";

/** bump イベントで保持するセッションデータ（イミュータブル） */
interface BumpSession {
  readonly socketId: string;
  readonly timestamp: number;
  readonly meishi: MeishiData;
}

/** マッチング判定のタイムスタンプ許容差（ミリ秒） */
const MATCH_WINDOW_MS = 3000;

/** 交換ルーム名 */
const EXCHANGE_ROOM = "exchange-room";

/**
 * 新しい bump に対してマッチング相手を探す。
 * タイムスタンプ差が MATCH_WINDOW_MS 以内の最初の相手を返す。
 */
const findMatch = (
  pendingBumps: Map<string, BumpSession>,
  incomingSession: BumpSession,
): BumpSession | undefined => {
  for (const [socketId, session] of pendingBumps) {
    if (socketId === incomingSession.socketId) {
      continue;
    }
    const diff = Math.abs(session.timestamp - incomingSession.timestamp);
    if (diff <= MATCH_WINDOW_MS) {
      return session;
    }
  }
  return undefined;
};

/**
 * bump イベントのペイロードを検証する。
 * meishi と timestamp が必須。
 */
const validateBumpPayload = (
  data: unknown,
): data is { timestamp: number; meishi: MeishiData } => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const payload = data as Record<string, unknown>;
  return (
    typeof payload.timestamp === "number" &&
    typeof payload.meishi === "object" &&
    payload.meishi !== null
  );
};

/**
 * Socket.IO サーバーを既存の HTTP サーバーにアタッチする。
 * server/index.ts からは `setupExchangeSocket(httpServer)` で呼び出す。
 *
 * 待機中の bump セッションはインスタンスごとの Map で管理する。
 */
export const setupExchangeSocket = (httpServer: HttpServer): SocketIOServer => {
  const pendingBumps: Map<string, BumpSession> = new Map();

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    /** ルーム参加 */
    socket.on("join-exchange", (_data: unknown, callback?: (res: { status: string }) => void) => {
      socket.join(EXCHANGE_ROOM);
      if (typeof callback === "function") {
        callback({ status: "joined" });
      }
    });

    /** ルーム退出 */
    socket.on("leave-exchange", (_data: unknown, callback?: (res: { status: string }) => void) => {
      socket.leave(EXCHANGE_ROOM);
      pendingBumps.delete(socket.id);
      if (typeof callback === "function") {
        callback({ status: "left" });
      }
    });

    /** bump イベント処理 */
    socket.on("bump", (data: unknown) => {
      if (!validateBumpPayload(data)) {
        socket.emit("error", {
          message: "bump イベントには timestamp と meishi が必要です",
        });
        return;
      }

      const incomingSession: BumpSession = {
        socketId: socket.id,
        timestamp: data.timestamp,
        meishi: data.meishi,
      };

      const partner = findMatch(pendingBumps, incomingSession);

      if (partner !== undefined) {
        // マッチング成立 — 両者に相手の名刺データを送信
        pendingBumps.delete(partner.socketId);
        pendingBumps.delete(socket.id);

        io.to(partner.socketId).emit("matched", {
          partnerMeishi: incomingSession.meishi,
        });
        socket.emit("matched", {
          partnerMeishi: partner.meishi,
        });
      } else {
        // マッチング相手なし — 待機リストに追加
        pendingBumps.set(socket.id, incomingSession);
      }
    });

    /** 切断時のクリーンアップ */
    socket.on("disconnect", () => {
      pendingBumps.delete(socket.id);
    });
  });

  return io;
};
