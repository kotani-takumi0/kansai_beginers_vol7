// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SharePage } from "./SharePage";
import type { MeishiData } from "../types";

const mockMeishi: MeishiData = {
  id: "test-id",
  prefecture: "大阪府",
  topics: [
    {
      topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
      isNormal: true,
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

  it("名刺データがない場合はエラーメッセージを表示する", () => {
    renderWithRouter();
    expect(screen.getByText("名刺データがありません")).toBeDefined();
    expect(screen.getByText("名刺を作る")).toBeDefined();
  });

  it("名刺データがある場合はQRコードを表示する", () => {
    renderWithRouter({ meishi: mockMeishi });
    expect(screen.getByText("名刺を共有")).toBeDefined();
    expect(screen.getByText("QRコードを相手に見せてね")).toBeDefined();
    const svg = document.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("名刺に戻るボタンが表示される", () => {
    renderWithRouter({ meishi: mockMeishi });
    expect(screen.getByText("名刺に戻る")).toBeDefined();
  });
});
