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
        <Route path="/topics" element={<div>topics page</div>} />
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
    expect(screen.getByLabelText("まずは名前を教えてください")).toBeDefined();
  });

  it("ご当地イラスト付きの案内が表示される", () => {
    renderPage();
    expect(screen.getByText("ご当地イラスト名刺")).toBeDefined();
    expect(screen.getByText("たこ焼き")).toBeDefined();
    expect(screen.getByText("シーサー")).toBeDefined();
  });

  it("名前と都道府県が揃うまで進めない", () => {
    renderPage();
    const button = screen.getByText("名前と出身地を入力してください") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("名前を入力して都道府県を選ぶと次へ進める", () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("まずは名前を教えてください"), {
      target: { value: "みぞじり" },
    });
    fireEvent.click(screen.getByRole("button", { name: "大阪府" }));
    fireEvent.click(screen.getByRole("button", { name: "大阪府で決定！" }));

    expect(screen.getByText("topics page")).toBeDefined();
    expect(window.localStorage.getItem("jimoto:selectedName")).toBe("みぞじり");
    expect(window.sessionStorage.getItem("jimoto:selectedPrefecture")).toBe("大阪府");
  });
});
