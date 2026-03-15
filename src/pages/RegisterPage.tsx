import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await register(displayName, email, password);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "新規登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#f7edd6] px-4 py-8 text-[#3d2718]">
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute top-[-120px] left-[-90px] h-64 w-64 rounded-full bg-[#ffd879]" />
        <div className="absolute top-40 right-[-100px] h-72 w-72 rounded-full bg-[#ffd4b2]" />
        <div className="absolute bottom-16 left-[-110px] h-72 w-72 rounded-full bg-[#c8e6c9]" />
      </div>

      <div className="relative mx-auto max-w-[420px]">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">NEW ACCOUNT</p>
            <span className="mt-1 block text-[17px] font-semibold">新規登録</span>
            <h1 className="mt-1 text-[27px] font-black leading-tight">ジモカをはじめる</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              名前とログイン情報を登録して、あなたの地元トークを保存できるようにします。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#6a4a2f]">表示名</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="min-h-[52px] w-full rounded-[18px] border-[3px] border-[#744b2e] bg-white px-4 text-base font-bold text-[#3d2718] outline-none"
                placeholder="たこやき太郎"
                autoComplete="nickname"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#6a4a2f]">メールアドレス</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-[52px] w-full rounded-[18px] border-[3px] border-[#744b2e] bg-white px-4 text-base font-bold text-[#3d2718] outline-none"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#6a4a2f]">パスワード</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-[52px] w-full rounded-[18px] border-[3px] border-[#744b2e] bg-white px-4 text-base font-bold text-[#3d2718] outline-none"
                placeholder="8文字以上"
                autoComplete="new-password"
                required
              />
            </label>

            {errorMessage && (
              <div className="rounded-[20px] border-[3px] border-[#b42318] bg-[#fff1ef] px-4 py-3 text-sm font-black text-[#b42318]">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[54px] w-full items-center justify-center rounded-[20px] border-[3px] border-[#744b2e] bg-[#e85d3a] px-4 text-[15px] font-black text-white shadow-[0_6px_0_#b94a26] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "登録中..." : "新規登録する"}
            </button>
          </form>
        </section>

        <p className="mt-5 text-center text-sm font-bold text-[#6a4a2f]">
          すでに登録済みなら <Link to="/login" className="text-[#a54f23] underline">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
