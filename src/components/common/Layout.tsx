import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div
      className="flex min-h-svh flex-col bg-[#f8f8f6]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <header className="sticky top-0 z-10 border-b border-[#ead9b3] bg-[#fff8df]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[420px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black tracking-[0.24em] text-[#a54f23]">JIMOTO MEISHI</p>
            <p className="truncate text-sm font-black text-[#3d2718]">
              {user ? `${user.displayName} でログイン中` : "地元トーク名刺"}
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border-2 border-[#744b2e] bg-white px-3 py-1.5 text-xs font-black text-[#6a4a2f]"
            >
              ログアウト
            </button>
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
