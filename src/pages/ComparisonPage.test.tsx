// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ComparisonPage } from "./ComparisonPage";
import type { MeishiData } from "../types";

const createMeishi = (
  prefecture: string,
  stances: { text: string; category: string; isNormal: boolean }[]
): MeishiData => ({
  id: `test-${prefecture}`,
  prefecture,
  topics: stances.map((s, i) => ({
    topic: { id: String(i + 1), text: s.text, category: s.category },
    isNormal: s.isNormal,
  })),
  createdAt: "2026-03-14T00:00:00.000Z",
});

const myMeishi = createMeishi("大阪府", [
  { text: "お好み焼き定食", category: "食文化", isNormal: true },
  { text: "エスカレーター右", category: "習慣", isNormal: true },
  { text: "551の紙袋", category: "地元あるある", isNormal: false },
]);

const partnerMeishi = createMeishi("東京都", [
  { text: "電車で1万歩", category: "くらし", isNormal: true },
  { text: "有名観光地に行かない", category: "習慣", isNormal: true },
  { text: "方言コンプレックス", category: "ことば", isNormal: false },
]);

const renderWithState = (state?: Record<string, unknown>) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/comparison", state }]}>
      <ComparisonPage />
    </MemoryRouter>
  );

describe("ComparisonPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-03-14T01:23:45.000Z");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("比較データがない場合はエラーメッセージを表示する", () => {
    renderWithState();
    expect(screen.getByText("比較データがありません")).toBeDefined();
    expect(screen.getByText("名刺を作る")).toBeDefined();
  });

  it("相手の「普通」トピックのみが表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    // isNormal=true のもの
    expect(screen.getByText("電車で1万歩")).toBeDefined();
    expect(screen.getByText("有名観光地に行かない")).toBeDefined();
    // isNormal=false のものは表示されない
    expect(screen.queryByText("方言コンプレックス")).toBeNull();
  });

  it("ショック/知ってたボタンが表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    const shockButtons = screen.getAllByText("ショック！");
    const knewItButtons = screen.getAllByText("知ってた");
    expect(shockButtons.length).toBe(2); // 2 normal topics
    expect(knewItButtons.length).toBe(2);
  });

  it("全てリアクション後に結果ボタンが有効になる", () => {
    renderWithState({ myMeishi, partnerMeishi });
    const shockButtons = screen.getAllByText("ショック！");
    fireEvent.click(shockButtons[0]);
    fireEvent.click(shockButtons[1]);
    const submitButton = screen.getByText("ショック度を見る！");
    expect(submitButton).toBeDefined();
  });

  it("出身地が表示される", () => {
    renderWithState({ myMeishi, partnerMeishi });
    expect(screen.getAllByText(/東京都/).length).toBeGreaterThan(0);
  });
});
