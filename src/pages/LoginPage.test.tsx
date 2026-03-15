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
});
