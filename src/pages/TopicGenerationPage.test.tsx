// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TopicGenerationPage } from "./TopicGenerationPage";

const mockTopics = [
  { id: "topic-0", text: "お好み焼き vs もんじゃ", emoji: "🍳" },
  { id: "topic-1", text: "エスカレーター右左論争", emoji: "🚶" },
];

const renderWithState = (state: Record<string, unknown>) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/topics", state }]}>
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route path="/topics" element={<TopicGenerationPage />} />
        <Route path="/preview" element={<div>preview page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("TopicGenerationPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("キャッシュされた話題がある場合はそのまま表示する", () => {
    renderWithState({
      myMeishi: { id: "my-1", name: "たろう", prefecture: "大阪府", createdAt: "2026-03-14T00:00:00.000Z" },
      partnerMeishi: { id: "p-1", name: "はなこ", prefecture: "東京都", createdAt: "2026-03-14T00:00:00.000Z" },
      topics: mockTopics,
    });

    expect(screen.getByText("大阪府 × 東京都")).toBeDefined();
    expect(screen.getByText("お好み焼き vs もんじゃ")).toBeDefined();
    expect(screen.getByText("エスカレーター右左論争")).toBeDefined();
  });

  it("名刺データがない場合はホームにリダイレクトする", () => {
    renderWithState({});
    expect(screen.getByText("home page")).toBeDefined();
  });

  it("APIからの話題取得中はローディングを表示する", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    renderWithState({
      myMeishi: { id: "my-1", name: "たろう", prefecture: "大阪府", createdAt: "2026-03-14T00:00:00.000Z" },
      partnerMeishi: { id: "p-1", name: "はなこ", prefecture: "東京都", createdAt: "2026-03-14T00:00:00.000Z" },
    });

    expect(screen.getByText("AIが話のタネを考え中...")).toBeDefined();
  });

  it("API成功時に話題を表示する", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ topics: mockTopics }),
    } as Response);

    renderWithState({
      myMeishi: { id: "my-1", name: "たろう", prefecture: "大阪府", createdAt: "2026-03-14T00:00:00.000Z" },
      partnerMeishi: { id: "p-1", name: "はなこ", prefecture: "東京都", createdAt: "2026-03-14T00:00:00.000Z" },
    });

    await waitFor(() => {
      expect(screen.getByText("お好み焼き vs もんじゃ")).toBeDefined();
    });
  });

  it("APIエラー時にエラーメッセージを表示する", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    renderWithState({
      myMeishi: { id: "my-1", name: "たろう", prefecture: "大阪府", createdAt: "2026-03-14T00:00:00.000Z" },
      partnerMeishi: { id: "p-1", name: "はなこ", prefecture: "東京都", createdAt: "2026-03-14T00:00:00.000Z" },
    });

    await waitFor(() => {
      expect(screen.getByText("エラー")).toBeDefined();
      expect(screen.getByText("話題の生成に失敗しました。もう一度お試しください。")).toBeDefined();
    });
  });
});
