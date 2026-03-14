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

    expect(screen.getByText("大阪府")).toBeDefined();
    expect(screen.getByText("たこ焼きは主食")).toBeDefined();
    expect(screen.getAllByText(/派/)).toHaveLength(2);
    expect(screen.getByText("この名刺を共有する")).toBeDefined();
  });

  it("共有ボタンで共有画面へ進める", () => {
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
    fireEvent.click(screen.getByText("この名刺を共有する"));

    expect(screen.getByText("share page")).toBeDefined();
  });
});
