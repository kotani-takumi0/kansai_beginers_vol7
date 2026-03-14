// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExchangeSocket } from "./useExchangeSocket";
import type { MeishiData } from "../types";

// --- socket.io-client mock ---
const mockOn = vi.fn();
const mockEmit = vi.fn();
const mockDisconnect = vi.fn();
const mockConnect = vi.fn();
const mockOff = vi.fn();

let connectHandler: (() => void) | undefined;
let disconnectHandler: (() => void) | undefined;
let matchedHandler: ((data: MeishiData) => void) | undefined;
let timeoutHandler: (() => void) | undefined;

mockOn.mockImplementation((event: string, handler: (...args: unknown[]) => void) => {
  if (event === "connect") connectHandler = handler;
  if (event === "disconnect") disconnectHandler = handler;
  if (event === "matched") matchedHandler = handler as (data: MeishiData) => void;
  if (event === "timeout") timeoutHandler = handler as () => void;
  return mockSocket;
});

const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
  connect: mockConnect,
  off: mockOff,
  connected: false,
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

// --- test data ---
const myMeishi: MeishiData = {
  id: "my-123",
  prefecture: "大阪府",
  topics: [
    {
      topic: { id: "t1", text: "たこ焼きは毎日食べる", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00+09:00",
};

const partnerMeishi: MeishiData = {
  id: "partner-456",
  prefecture: "京都府",
  topics: [
    {
      topic: { id: "t2", text: "おばんざいは家庭料理", category: "食文化" },
      agrees: false,
    },
  ],
  createdAt: "2026-03-14T01:00:00+09:00",
};

describe("useExchangeSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectHandler = undefined;
    disconnectHandler = undefined;
    matchedHandler = undefined;
    timeoutHandler = undefined;
    mockSocket.connected = false;
  });

  it("初期状態はすべて false/null である", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isWaiting).toBe(false);
    expect(result.current.isMatched).toBe(false);
    expect(result.current.partnerMeishi).toBeNull();
  });

  it("Socket接続時に isConnected が true になる", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("Socket切断時に isConnected が false になる", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      disconnectHandler?.();
    });
    expect(result.current.isConnected).toBe(false);
  });

  it("joinRoom で join-exchange を emit し isWaiting が true になる", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
    });

    act(() => {
      result.current.joinRoom();
    });

    expect(mockEmit).toHaveBeenCalledWith("join-exchange", myMeishi);
    expect(result.current.isWaiting).toBe(true);
  });

  it("sendBump で bump イベントをタイムスタンプ付きで emit する", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
      result.current.joinRoom();
    });

    act(() => {
      result.current.sendBump();
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "bump",
      expect.objectContaining({
        meishi: myMeishi,
        timestamp: expect.any(Number),
      })
    );
  });

  it("matched イベントで partnerMeishi と isMatched が更新される", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
      result.current.joinRoom();
    });

    act(() => {
      matchedHandler?.(partnerMeishi);
    });

    expect(result.current.isMatched).toBe(true);
    expect(result.current.partnerMeishi).toEqual(partnerMeishi);
    expect(result.current.isWaiting).toBe(false);
  });

  it("timeout イベントで isWaiting が false にリセットされる", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
      result.current.joinRoom();
    });
    expect(result.current.isWaiting).toBe(true);

    act(() => {
      timeoutHandler?.();
    });

    expect(result.current.isWaiting).toBe(false);
    expect(result.current.isMatched).toBe(false);
  });

  it("leaveRoom で leave-exchange を emit し状態がリセットされる", () => {
    const { result } = renderHook(() => useExchangeSocket(myMeishi));

    act(() => {
      connectHandler?.();
      result.current.joinRoom();
    });

    act(() => {
      matchedHandler?.(partnerMeishi);
    });
    expect(result.current.isMatched).toBe(true);

    act(() => {
      result.current.leaveRoom();
    });

    expect(mockEmit).toHaveBeenCalledWith("leave-exchange");
    expect(mockDisconnect).toHaveBeenCalled();
    expect(result.current.isWaiting).toBe(false);
    expect(result.current.isMatched).toBe(false);
    expect(result.current.partnerMeishi).toBeNull();
  });

  it("アンマウント時にソケットが切断される", () => {
    const { unmount } = renderHook(() => useExchangeSocket(myMeishi));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
