// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MeishiPreviewPage } from "./MeishiPreviewPage";

const renderPreviewPage = () =>
  render(
    <MemoryRouter initialEntries={["/preview"]}>
      <Routes>
        <Route path="/preview" element={<MeishiPreviewPage />} />
        <Route path="/topics" element={<div>topics page</div>} />
        <Route path="/share" element={<div>share page</div>} />
        <Route path="/scan" element={<div>scan page</div>} />
        <Route path="/" element={<div>home page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("MeishiPreviewPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-03-14T00:00:00.000Z");
  });

  it("保存済みデータがない場合は案内を表示する", () => {
    renderPreviewPage();

    expect(screen.getByText("名刺データがありません")).toBeDefined();
    expect(screen.getByText("最初からつくる")).toBeDefined();
  });

  it("保存済みデータがある場合は名刺プレビューを表示する", () => {
    window.sessionStorage.setItem("jimoto:selectedPrefecture", "大阪府");
    window.sessionStorage.setItem(
      "jimoto:selectedTopics",
      JSON.stringify([
        {
          topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
          agrees: true,
        },
        {
          topic: { id: "2", text: "エスカレーターは右に立つ", category: "習慣" },
          agrees: false,
        },
      ])
    );

    renderPreviewPage();

    expect(screen.getAllByText("大阪府").length).toBeGreaterThan(0);
    expect(screen.getAllByText("たこ焼きは主食").length).toBeGreaterThan(0);
    expect(screen.getByText("QRコードを読み取る")).toBeDefined();
  });

  it("QR読み取りボタンでスキャン画面へ進める", () => {
    window.sessionStorage.setItem("jimoto:selectedPrefecture", "大阪府");
    window.sessionStorage.setItem(
      "jimoto:selectedTopics",
      JSON.stringify([
        {
          topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
          agrees: true,
        },
      ])
    );

    renderPreviewPage();
    fireEvent.click(screen.getByText("QRコードを読み取る"));

    expect(screen.getByText("scan page")).toBeDefined();
  });

  it("交換履歴がある場合は一覧を表示する", () => {
    window.localStorage.setItem(
      "jimoto:myMeishi",
      JSON.stringify({
        id: "my-1",
        prefecture: "大阪府",
        topics: [
          {
            topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
            agrees: true,
          },
        ],
        createdAt: "2026-03-14T00:00:00.000Z",
      })
    );
    window.localStorage.setItem(
      "jimoto:exchangeHistory",
      JSON.stringify([
        {
          id: "my-1:partner-1",
          exchangedAt: "2026-03-14T01:23:45.000Z",
          myMeishi: {
            id: "my-1",
            prefecture: "大阪府",
            topics: [
              {
                topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
                agrees: true,
              },
            ],
            createdAt: "2026-03-14T00:00:00.000Z",
          },
          partnerMeishi: {
            id: "partner-1",
            prefecture: "東京都",
            topics: [
              {
                topic: { id: "1", text: "おでんはおかず", category: "食文化" },
                agrees: false,
              },
            ],
            createdAt: "2026-03-14T00:10:00.000Z",
          },
          matchCount: 2,
          mismatchCount: 1,
        },
      ])
    );

    renderPreviewPage();

    const historyButton = screen.getByRole("button", { name: /交換履歴/ });
    expect(historyButton).toBeDefined();

    // ボタン押下前は履歴カードが非表示
    expect(screen.queryByText("東京都の人と交換")).toBeNull();

    // ボタンを押して履歴を表示
    fireEvent.click(historyButton);
    expect(screen.getByText("東京都の人と交換")).toBeDefined();
    expect(screen.getByText("2一致 / 1不一致")).toBeDefined();
  });
});
