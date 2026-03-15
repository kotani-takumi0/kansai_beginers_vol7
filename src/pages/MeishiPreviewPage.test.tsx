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
  });

  it("保存済みデータがない場合は案内を表示する", () => {
    renderPreviewPage();
    expect(screen.getByText("カードがありません")).toBeDefined();
    expect(screen.getByText("カードをつくる")).toBeDefined();
  });

  it("保存済みデータがある場合はカードプレビューを表示する", () => {
    window.localStorage.setItem(
      "jimoto:myMeishi",
      JSON.stringify({
        id: "my-1",
        name: "たろう",
        prefecture: "大阪府",
        createdAt: "2026-03-14T00:00:00.000Z",
      })
    );

    renderPreviewPage();
    expect(screen.getAllByText("大阪府").length).toBeGreaterThan(0);
    expect(screen.getAllByText("たろう").length).toBeGreaterThan(0);
  });

  it("交換履歴がある場合は一覧を表示する", () => {
    window.localStorage.setItem(
      "jimoto:myMeishi",
      JSON.stringify({
        id: "my-1",
        name: "たろう",
        prefecture: "大阪府",
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
            name: "たろう",
            prefecture: "大阪府",
            createdAt: "2026-03-14T00:00:00.000Z",
          },
          partnerMeishi: {
            id: "partner-1",
            name: "はなこ",
            prefecture: "東京都",
            createdAt: "2026-03-14T00:10:00.000Z",
          },
          topics: [
            { id: "topic-0", text: "お好み焼き vs もんじゃ", emoji: "🍳" },
          ],
        },
      ])
    );

    renderPreviewPage();

    const historyButton = screen.getByRole("button", { name: /交換履歴/ });
    expect(historyButton).toBeDefined();

    fireEvent.click(historyButton);
    expect(screen.getByText(/はなこ/)).toBeDefined();
  });
});
