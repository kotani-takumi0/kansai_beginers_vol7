// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PrefectureSelectPage } from "./PrefectureSelectPage";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<PrefectureSelectPage />} />
        <Route path="/preview" element={<div>preview page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("PrefectureSelectPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("名前入力欄が表示される", () => {
    renderPage();
    expect(screen.getByLabelText("あなたの名前")).toBeDefined();
  });

  it("じもとショック名刺の案内が表示される", () => {
    renderPage();
    expect(screen.getByText("じもとショック名刺")).toBeDefined();
    expect(screen.getByText("大阪府")).toBeDefined();
    expect(screen.getByText("沖縄県")).toBeDefined();
  });

  it("名前と都道府県が揃うまで進めない", () => {
    renderPage();
    const button = screen.getByText("名前と出身地を入力してください") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("名前を入力して都道府県を選ぶと名刺が作成されプレビューへ遷移する", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("あなたの名前"), {
      target: { value: "みぞじり" },
    });
    fireEvent.click(screen.getByRole("button", { name: "大阪府" }));
    fireEvent.click(screen.getByRole("button", { name: "この内容で名刺をつくる" }));

    expect(screen.getByText("preview page")).toBeDefined();
    expect(window.localStorage.getItem("jimoto:selectedName")).toBe("みぞじり");
    const saved = JSON.parse(window.localStorage.getItem("jimoto:myMeishi") ?? "{}");
    expect(saved.prefecture).toBe("大阪府");
    expect(saved.name).toBe("みぞじり");
  });
});
