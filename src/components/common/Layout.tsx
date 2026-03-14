import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div
      className="flex min-h-svh flex-col bg-[#f8f8f6]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
