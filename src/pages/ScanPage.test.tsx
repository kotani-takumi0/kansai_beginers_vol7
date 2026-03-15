// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ScanPage } from "./ScanPage";

const startMock = vi.fn();
const stopMock = vi.fn();

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: class {
    start = startMock;
    stop = stopMock;
  },
}));

describe("ScanPage", () => {
  afterEach(() => {
    cleanup();
    startMock.mockReset();
    stopMock.mockReset();
  });

  it("初期表示で案内文と起動ボタンを表示する", () => {
    render(
      <MemoryRouter>
        <ScanPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("QRコード読み取り")).toBeDefined();
    expect(screen.getByText("相手の名刺を受け取る")).toBeDefined();
    expect(screen.getByText("カメラを起動する")).toBeDefined();
    expect(screen.getByText("読み取りのコツ")).toBeDefined();
  });

  it("カメラ起動に失敗した場合はエラーメッセージと再試行ボタンを表示する", async () => {
    startMock.mockRejectedValueOnce(new Error("camera error"));

    render(
      <MemoryRouter>
        <ScanPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("カメラを起動する"));

    await waitFor(() => {
      expect(
        screen.getByText("カメラを起動できませんでした。カメラの許可を確認してください。"),
      ).toBeDefined();
    });

    expect(screen.getByText("もう一度スキャンする")).toBeDefined();
  });
});
