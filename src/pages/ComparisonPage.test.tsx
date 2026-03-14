// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ComparisonPage } from "./ComparisonPage";
import type { MeishiData } from "../types";

const createMeishi = (
  prefecture: string,
  stances: { text: string; category: string; agrees: boolean }[]
): MeishiData => ({
  id: `test-${prefecture}`,
  prefecture,
  topics: stances.map((s, i) => ({
    topic: { id: String(i + 1), text: s.text, category: s.category },
    agrees: s.agrees,
  })),
  createdAt: "2026-03-14T00:00:00.000Z",
});

const myMeishi = createMeishi("大阪府", [
  { text: "たこ焼きは主食", category: "食文化", agrees: true },
  { text: "エスカレーターは右に立つ", category: "習慣", agrees: true },
  { text: "〜やねん は標準語", category: "方言", agrees: false },
]);

const partnerMeishi = createMeishi("東京都", [
  { text: "たこ焼きは主食", category: "食文化", agrees: true },
  { text: "エスカレーターは右に立つ", category: "習慣", agrees: false },
  { text: "〜やねん は標準語", category: "方言", agrees: false },
]);

const renderWithState = (state?: Record<string, unknown>) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/comparison", state }]}>
      <ComparisonPage />
    </MemoryRouter>
  );

describe("ComparisonPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("比較データがない場合はエラーメッセージを表示する", () => {
    renderWithState();
    expect(screen.getByText("比較データがありません")).toBeDefined();
    expect(screen.getByText("名刺を作る")).toBeDefined();
  });

  it("サマリーに一致数・不一致数が表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    // サマリー部分のみ検証（カード内にも「一致」「不一致」が出るためDOM検索）
    const summary = document.querySelector(".flex.gap-4.mb-8");
    expect(summary).not.toBeNull();
    expect(summary!.textContent).toContain("2");
    expect(summary!.textContent).toContain("1");
    expect(summary!.textContent).toContain("一致");
    expect(summary!.textContent).toContain("不一致");
  });

  it("出身地が両方表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    expect(screen.getByText("大阪府")).toBeDefined();
    expect(screen.getByText("東京都")).toBeDefined();
  });

  it("各ネタが表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    expect(screen.getByText("たこ焼きは主食")).toBeDefined();
    expect(screen.getByText("エスカレーターは右に立つ")).toBeDefined();
    expect(screen.getByText("〜やねん は標準語")).toBeDefined();
  });

  it("一致/不一致のハイライトが正しい", () => {
    renderWithState({ myMeishi, partnerMeishi });
    const cards = document.querySelectorAll(".border-green-300, .border-red-300");
    const greenCards = document.querySelectorAll(".border-green-300");
    const redCards = document.querySelectorAll(".border-red-300");
    expect(cards.length).toBe(3);
    expect(greenCards.length).toBe(2);
    expect(redCards.length).toBe(1);
  });

  it("会話を促すメッセージが表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    const messages = document.querySelectorAll('[data-testid="match-message"]');
    expect(messages.length).toBe(3);
    // 各メッセージが空でないことを確認
    messages.forEach((msg) => {
      expect(msg.textContent?.length).toBeGreaterThan(0);
    });
  });

  it("「もう一度名刺を作る」ボタンが表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    expect(screen.getByText("もう一度名刺を作る")).toBeDefined();
  });
});
