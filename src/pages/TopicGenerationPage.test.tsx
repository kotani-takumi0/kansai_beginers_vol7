// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TopicGenerationPage } from "./TopicGenerationPage";

const mockGenerateTopics = vi.fn();

vi.mock("../utils/topicGenerator", () => ({
  generateTopics: (...args: unknown[]) => mockGenerateTopics(...args),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/topics"]}>
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
    window.sessionStorage.setItem("jimoto:selectedPrefecture", "大阪府");
    mockGenerateTopics.mockReset();
    mockGenerateTopics.mockResolvedValue({
      prefecture: "大阪府",
      topics: [
        { id: "1", text: "たこ焼きはおやつではなく主食", category: "食文化" },
        { id: "2", text: "ツッコミ待ちの空気を感じる", category: "ことば" },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("都道府県に対応したご当地イラスト案内を表示する", async () => {
    renderPage();

    expect(screen.getByText("大阪府のご当地トーク")).toBeDefined();
    expect(screen.getByText("たこ焼き")).toBeDefined();
    expect(screen.getByText("粉もん魂")).toBeDefined();

    await screen.findByText("たこ焼きはおやつではなく主食");
  });

  it("すべてのネタで立場を選ぶとプレビューへ進める", async () => {
    renderPage();

    await screen.findByText("たこ焼きはおやつではなく主食");

    fireEvent.click(screen.getAllByRole("button", { name: /それ、わかる/ })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /それは違う/ })[1]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "この内容で名刺をつくる" })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "この内容で名刺をつくる" }));

    expect(screen.getByText("preview page")).toBeDefined();
    expect(window.sessionStorage.getItem("jimoto:selectedTopics")).toContain(
      "たこ焼きはおやつではなく主食"
    );
  });
});
