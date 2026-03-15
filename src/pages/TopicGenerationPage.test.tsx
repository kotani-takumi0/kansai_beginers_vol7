// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TopicGenerationPage } from "./TopicGenerationPage";

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
  });

  afterEach(() => {
    cleanup();
  });

  it("都道府県に対応した診断画面を表示する", () => {
    renderPage();

    expect(screen.getByText("大阪府のあるある")).toBeDefined();
    expect(screen.getByText("お好み焼きをおかずにご飯を食べる")).toBeDefined();
  });

  it("すべての質問に答えるとプレビューへ進める", async () => {
    renderPage();

    // 5問全てに回答
    const normalButtons = screen.getAllByRole("button", { name: /普通でしょ？/ });
    const notNormalButtons = screen.getAllByRole("button", { name: /普通じゃない/ });

    fireEvent.click(normalButtons[0]);
    fireEvent.click(notNormalButtons[1]);
    fireEvent.click(normalButtons[2]);
    fireEvent.click(normalButtons[3]);
    fireEvent.click(notNormalButtons[4]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "この内容で名刺をつくる" })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "この内容で名刺をつくる" }));

    expect(screen.getByText("preview page")).toBeDefined();
    expect(window.sessionStorage.getItem("jimoto:selectedTopics")).toContain(
      "お好み焼きをおかずにご飯を食べる"
    );
  });
});
