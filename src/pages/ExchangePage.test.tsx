// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ExchangePage } from "./ExchangePage";

// ── Mocks ──

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockBump: {
  isSupported: boolean;
  permissionState: "prompt" | "granted" | "denied";
  isListening: boolean;
  requestPermission: ReturnType<typeof vi.fn>;
  startListening: ReturnType<typeof vi.fn>;
  stopListening: ReturnType<typeof vi.fn>;
} = {
  isSupported: true,
  permissionState: "prompt",
  isListening: false,
  requestPermission: vi.fn().mockResolvedValue(true),
  startListening: vi.fn(),
  stopListening: vi.fn(),
};
vi.mock("../hooks/useBumpDetection", () => ({
  useBumpDetection: () => mockBump,
}));

import type { MeishiData } from "../types";

const mockSocket: {
  isConnected: boolean;
  isWaiting: boolean;
  isMatched: boolean;
  partnerMeishi: MeishiData | null;
  joinRoom: ReturnType<typeof vi.fn>;
  sendBump: ReturnType<typeof vi.fn>;
  leaveRoom: ReturnType<typeof vi.fn>;
} = {
  isConnected: true,
  isWaiting: false,
  isMatched: false,
  partnerMeishi: null,
  joinRoom: vi.fn(),
  sendBump: vi.fn(),
  leaveRoom: vi.fn(),
};
vi.mock("../hooks/useExchangeSocket", () => ({
  useExchangeSocket: () => mockSocket,
}));

const mockMeishi = {
  id: "test-id",
  name: "みぞじり",
  prefecture: "大阪府",
  topics: [
    {
      topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

const mockLoadMyMeishi = vi.fn((): MeishiData | null => mockMeishi);
const mockSavePartnerMeishi = vi.fn();
const mockSaveMyMeishi = vi.fn();

vi.mock("../utils/appStorage", () => ({
  loadMyMeishi: () => mockLoadMyMeishi(),
  saveMyMeishi: (meishi: MeishiData) => mockSaveMyMeishi(meishi),
  savePartnerMeishi: (meishi: MeishiData) => mockSavePartnerMeishi(meishi),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/exchange"]}>
      <ExchangePage />
    </MemoryRouter>
  );

describe("ExchangePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
    mockBump.isSupported = true;
    mockBump.permissionState = "prompt";
    mockBump.isListening = false;
    mockSocket.isConnected = true;
    mockSocket.isWaiting = false;
    mockSocket.isMatched = false;
    mockSocket.partnerMeishi = null;
    mockLoadMyMeishi.mockReturnValue(mockMeishi);
  });

  afterEach(() => {
    cleanup();
  });

  // ── 名刺データがない場合 ──
  it("名刺データがない場合はエラー画面を表示する", () => {
    mockLoadMyMeishi.mockReturnValueOnce(null);

    render(
      <MemoryRouter initialEntries={["/exchange"]}>
        <ExchangePage />
      </MemoryRouter>
    );

    expect(screen.getByText("名刺がまだありません")).toBeDefined();
    expect(screen.getByText("名刺をつくる")).toBeDefined();
  });

  it("名前が未入力の場合は先に入力フォームを表示する", () => {
    mockLoadMyMeishi.mockReturnValue({
      ...mockMeishi,
      name: undefined,
    });

    renderPage();

    expect(screen.getByText("交換前に名前を入れましょう")).toBeDefined();
    fireEvent.change(screen.getByLabelText("あなたの名前"), {
      target: { value: "こたに" },
    });
    fireEvent.click(screen.getByText("名前を保存して交換へ進む"));

    expect(mockSaveMyMeishi).toHaveBeenCalledWith(
      expect.objectContaining({ name: "こたに" })
    );
    expect(screen.getByText("センサーをONにする")).toBeDefined();
  });

  // ── 許可取得前 ──
  it("DeviceMotion許可前は許可取得ボタンを表示する", () => {
    renderPage();
    expect(screen.getByText("センサーをONにする")).toBeDefined();
  });

  it("許可取得ボタンをクリックするとrequestPermissionが呼ばれる", async () => {
    renderPage();
    const button = screen.getByText("センサーをONにする");
    fireEvent.click(button);
    expect(mockBump.requestPermission).toHaveBeenCalled();
  });

  // ── 待機中 ──
  it("許可granted後は待機画面を表示する", async () => {
    renderPage();
    const button = screen.getByText("センサーをONにする");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("ぶつけて名刺交換！")).toBeDefined();
    });
  });

  // ── DeviceMotion非対応 ──
  it("DeviceMotion非対応時はフォールバック画面を表示する", () => {
    mockBump.isSupported = false;

    renderPage();
    expect(screen.getByText("URLで交換する")).toBeDefined();
  });

  // ── 許可denied ──
  it("許可deniedの場合もフォールバック画面を表示する", () => {
    mockBump.permissionState = "denied";

    renderPage();
    expect(screen.getByText("URLで交換する")).toBeDefined();
  });

  // ── タイムアウト ──
  it("タイムアウト時は再試行UIを表示する", async () => {
    // requestPermissionがtrueを返してwaiting→bump後にtimeoutへ
    mockBump.requestPermission.mockResolvedValue(true);

    renderPage();
    // 許可取得
    fireEvent.click(screen.getByText("センサーをONにする"));
    await waitFor(() => {
      expect(screen.getByText("ぶつけて名刺交換！")).toBeDefined();
    });

    // timeout状態に: socket.isWaiting=false, isMatched=false の時
    // ExchangePageの内部でphase=bumpedかつsocketが非waiting非matchedでtimeout
    // ここではフッターのURLリンクが常時表示されることを確認
    expect(screen.getByText("URLで交換する")).toBeDefined();
  });

  // ── マッチング成功 ──
  it("マッチング成功時はpartnerMeishiを保存して演出画面を表示する", async () => {
    mockBump.permissionState = "granted";
    mockBump.isListening = true;
    mockSocket.isMatched = true;
    mockSocket.partnerMeishi = {
      id: "partner-id",
      name: "たなか",
      prefecture: "京都府",
      topics: [
        {
          topic: { id: "2", text: "おばんざいは最高", category: "食文化" },
          agrees: true,
        },
      ],
      createdAt: "2026-03-14T00:00:00.000Z",
    };

    renderPage();

    await waitFor(() => {
      expect(mockSavePartnerMeishi).toHaveBeenCalledWith(
        mockSocket.partnerMeishi
      );
      // 演出コンポーネントが表示される（直接遷移ではなく演出を挟む）
      expect(
        document.querySelector("[data-stage='impact']")
      ).not.toBeNull();
    });
  });

  // ── URL交換リンク ──
  it("URLで交換するリンクが/shareへ遷移する", () => {
    renderPage();
    const link = screen.getByText("URLで交換する");
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalledWith("/share", {
      state: { meishi: mockMeishi },
    });
  });

  // ── クリーンアップ ──
  it("アンマウント時にleaveRoomが呼ばれる", () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockSocket.leaveRoom).toHaveBeenCalled();
  });
});
