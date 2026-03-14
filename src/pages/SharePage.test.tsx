// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SharePage } from "./SharePage";
import type { MeishiData } from "../types";

const mockMeishi: MeishiData = {
  id: "test-id",
  prefecture: "大阪府",
  topics: [
    {
      topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

const renderWithRouter = (state?: Record<string, unknown>) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/share", state }]}>
      <SharePage />
    </MemoryRouter>
  );

describe("SharePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("名刺データがない場合はエラーメッセージを表示する", () => {
    renderWithRouter();
    expect(screen.getByText("名刺データがありません")).toBeDefined();
    expect(screen.getByText("名刺を作る")).toBeDefined();
  });

  it("名刺データがある場合はQRコードと共有URLを表示する", () => {
    renderWithRouter({ meishi: mockMeishi });
    expect(screen.getByText("名刺を共有")).toBeDefined();
    expect(screen.getByText("URLをコピー")).toBeDefined();
    // QRコードのSVGが存在する
    const svg = document.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("共有URLに名刺データが含まれている", () => {
    renderWithRouter({ meishi: mockMeishi });
    const urlElement = document.querySelector(".break-all");
    expect(urlElement?.textContent).toContain("/receive?d=");
  });

  it("コピーボタンをクリックするとクリップボードにコピーされる", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    renderWithRouter({ meishi: mockMeishi });
    const copyButton = screen.getByText("URLをコピー");
    fireEvent.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("/receive?d=")
    );
  });

  it("クリップボードAPIが失敗してもフォールバックで例外にならない", () => {
    const writeText = vi.fn().mockRejectedValue(new Error("copy failed"));
    const execCommand = vi.fn().mockReturnValue(false);

    Object.assign(navigator, {
      clipboard: { writeText },
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
    });

    renderWithRouter({ meishi: mockMeishi });
    fireEvent.click(screen.getByText("URLをコピー"));

    return waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(execCommand).toHaveBeenCalledWith("copy");
    });
  });

  it("ネイティブ共有が失敗した場合はコピーにフォールバックする", () => {
    const share = vi.fn().mockRejectedValue(new Error("share failed"));
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.assign(navigator, {
      share,
      clipboard: { writeText },
    });

    renderWithRouter({ meishi: mockMeishi });
    fireEvent.click(screen.getByText("共有メニューで送る"));

    return waitFor(() => {
      expect(share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "地元名刺",
          text: "大阪府の地元名刺を見てね！",
        })
      );
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("/receive?d=")
      );
    });
  });

  it("名刺に戻るボタンが表示される", () => {
    renderWithRouter({ meishi: mockMeishi });
    expect(screen.getByText("名刺に戻る")).toBeDefined();
  });
});
