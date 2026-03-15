// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReceivePage } from "./ReceivePage";
import { encode } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

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
      screen.getByText("名刺データの読み取りに失敗しました")
    ).toBeDefined();
  });

  it("正しいデータの場合は送信者の名刺を表示する", () => {
    const encoded = encode(mockMeishi);
    renderWithParams(`?d=${encoded}`);
    expect(screen.getByText("名刺が届きました！")).toBeDefined();
    expect(screen.getAllByText(/大阪府/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/はなこ/).length).toBeGreaterThan(0);
  });

  it("「自分の名刺も作る」ボタンが表示される", () => {
    const encoded = encode(mockMeishi);
    renderWithParams(`?d=${encoded}`);
    expect(screen.getByText("自分の名刺も作る")).toBeDefined();
  });

  it("エラー時に「自分の名刺を作る」ボタンが表示される", () => {
    renderWithParams("");
    expect(screen.getByText("自分の名刺を作る")).toBeDefined();
  });
});
