// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";
import { LoginPage } from "./LoginPage";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    fetchMock.mockReset();
    window.localStorage.clear();
  });

  it("ログインフォームを表示する", () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText("ログイン")).toBeDefined();
    expect(screen.getByText("ログインする")).toBeDefined();
  });

  it("ログイン失敗時にエラーメッセージを表示する", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "メールアドレスまたはパスワードが正しくありません。" }),
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("8文字以上"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("ログインする"));

    await waitFor(() => {
      expect(screen.getByText("メールアドレスまたはパスワードが正しくありません。")).toBeDefined();
    });
  });

  it("ログイン成功時に前回ユーザーの入力状態をクリアする", async () => {
    window.localStorage.setItem("jimoto:selectedName", "前のユーザー");
    window.localStorage.setItem(
      "jimoto:myMeishi",
      JSON.stringify({
        id: "meishi-1",
        name: "前のユーザー",
        prefecture: "大阪府",
        createdAt: "2026-03-15T00:00:00.000Z",
      }),
    );
    window.localStorage.setItem(
      "jimoto:exchangeHistory",
      JSON.stringify([{ id: "history-1" }]),
    );
    window.sessionStorage.setItem(
      "jimoto:partnerMeishi",
      JSON.stringify({ id: "partner-1" }),
    );

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "token-1",
        user: {
          id: "user-1",
          email: "user@example.com",
          displayName: "新しいユーザー",
          createdAt: "2026-03-15T00:00:00.000Z",
        },
      }),
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>home</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("8文字以上"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("ログインする"));

    await waitFor(() => {
      expect(window.localStorage.getItem("jimoto:selectedName")).toBeNull();
    });

    expect(window.localStorage.getItem("jimoto:myMeishi")).toBeNull();
    expect(window.localStorage.getItem("jimoto:exchangeHistory")).toBeNull();
    expect(window.sessionStorage.getItem("jimoto:partnerMeishi")).toBeNull();
  });
});
