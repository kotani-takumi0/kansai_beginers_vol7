import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-svh flex flex-col bg-white" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3">
        <h1 className="text-lg font-bold text-center">じもと名刺</h1>
      </header>
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
