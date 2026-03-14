import { useState, useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import type { MeishiData } from "../types";

export interface ExchangeSocketState {
  readonly isConnected: boolean;
  readonly isWaiting: boolean;
  readonly isMatched: boolean;
  readonly partnerMeishi: MeishiData | null;
}

export type UseExchangeSocket = (myMeishi: MeishiData) => ExchangeSocketState & {
  readonly joinRoom: () => void;
  readonly sendBump: () => void;
  readonly leaveRoom: () => void;
};

const INITIAL_STATE: ExchangeSocketState = {
  isConnected: false,
  isWaiting: false,
  isMatched: false,
  partnerMeishi: null,
};

export const useExchangeSocket: UseExchangeSocket = (myMeishi: MeishiData) => {
  const [state, setState] = useState<ExchangeSocketState>(INITIAL_STATE);
  const socketRef = useRef<Socket | null>(null);
  const meishiRef = useRef<MeishiData>(myMeishi);

  // myMeishi が変わったら ref を更新（再接続はしない）
  meishiRef.current = myMeishi;

  useEffect(() => {
    const serverUrl =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    });

    socket.on("disconnect", () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on("matched", (partnerMeishi: MeishiData) => {
      setState((prev) => ({
        ...prev,
        isMatched: true,
        isWaiting: false,
        partnerMeishi,
      }));
    });

    socket.on("timeout", () => {
      setState((prev) => ({
        ...prev,
        isWaiting: false,
        isMatched: false,
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("join-exchange", meishiRef.current);
    setState((prev) => ({ ...prev, isWaiting: true }));
  }, []);

  const sendBump = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("bump", {
      meishi: meishiRef.current,
      timestamp: Date.now(),
    });
  }, []);

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("leave-exchange");
    socket.disconnect();
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    joinRoom,
    sendBump,
    leaveRoom,
  };
};
