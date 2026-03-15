// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReceivePage } from "./ReceivePage";
import { encode } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

// fetch をモック
vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);

const mockMeishi: MeishiData = {
  id: "test-id",
  name: "はなこ",
  prefecture: "大阪府",
  createdAt: "2026-03-14T00:00:00.000Z",
};

const renderWithParams = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/receive${search}`]}>
      <ReceivePage />
    </MemoryRouter>
  );

describe("ReceivePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("クエリパラメータがない場合はエラーメッセージを表示する", () => {
    renderWithParams("");
    expect(screen.getByText("エラー")).toBeDefined();
    expect(screen.getByText("共有データが見つかりません")).toBeDefined();
  });

  it("不正なデータの場合はエラーメッセージを表示する", () => {
    renderWithParams("?d=invalid-data!!!");
    expect(screen.getByText("エラー")).toBeDefined();
    expect(
      screen.getByText("カードデータの読み取りに失敗しました")
    ).toBeDefined();
  });

  it("正しいデータの場合は送信者のカードを表示する", () => {
    const encoded = encode(mockMeishi);
    renderWithParams(`?d=${encoded}`);
    expect(screen.getByText("カードが届きました！")).toBeDefined();
    expect(screen.getAllByText(/大阪府/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/はなこ/).length).toBeGreaterThan(0);
  });

  it("自分の名刺がない場合は「自分の名刺も作る」ボタンを表示する", () => {
    const encoded = encode(mockMeishi);
    renderWithParams(`?d=${encoded}`);
    expect(screen.getByText("自分のカードも作る")).toBeDefined();
  });

  it("自分の名刺がある場合は「話のタネを見る」ボタンを表示する", () => {
    window.localStorage.setItem(
      "jimoto:myMeishi",
      JSON.stringify({ id: "my-1", name: "たろう", prefecture: "東京都", createdAt: "2026-03-14T00:00:00.000Z" })
    );
    const encoded = encode(mockMeishi);
    renderWithParams(`?d=${encoded}`);
    expect(screen.getByText("話のタネを見る")).toBeDefined();
  });

  it("エラー時に「自分の名刺を作る」ボタンが表示される", () => {
    renderWithParams("");
    expect(screen.getByText("自分のカードを作る")).toBeDefined();
  });
});
