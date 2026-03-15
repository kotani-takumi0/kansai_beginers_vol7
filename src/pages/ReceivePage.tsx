import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { decode } from "../utils/meishiEncoder";
import { savePartnerMeishi, loadMyMeishi } from "../utils/appStorage";
import { buildBackendUrl } from "../utils/backendUrl";
import type { MeishiData } from "../types";

function notifyExchange(myMeishi: MeishiData, partnerMeishiId: string) {
  void fetch(buildBackendUrl("/api/exchange"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ myMeishi, partnerMeishiId }),
  });
}

export function ReceivePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const myMeishi = loadMyMeishi();

  const { meishi, error } = useMemo(() => {
    const encoded = searchParams.get("d");
    if (!encoded) {
      return { meishi: null, error: "共有データが見つかりません" };
    }
    try {
      const decoded = decode(encoded);
      return { meishi: decoded as MeishiData, error: null };
    } catch {
      return { meishi: null, error: "名刺データの読み取りに失敗しました" };
    }
  }, [searchParams]);

  if (error || !meishi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <p className="text-red-500 text-lg font-bold mb-2">エラー</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 min-h-[44px] bg-[#e85d3a] text-white rounded-xl font-bold"
        >
          自分の名刺を作る
        </button>
      </div>
    );
  }

  const handleReceiveAndGo = () => {
    savePartnerMeishi(meishi);

    if (myMeishi) {
      // 自分の名刺をサーバーに登録（相手が受け取れるようにする）
      notifyExchange(myMeishi, meishi.id);
      // 直接話題生成へ
      navigate("/topics", {
        state: { myMeishi, partnerMeishi: meishi },
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-[-110px] left-[-70px] h-60 w-60 rounded-full bg-[#ffe09a]" />
        <div className="absolute top-44 right-[-90px] h-64 w-64 rounded-full bg-[#ffd7b5]" />
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 py-8">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">CARD RECEIVED</p>
            <h1 className="mt-1 text-[27px] font-black leading-tight">名刺が届きました！</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              {meishi.prefecture}の{meishi.name}さんから名刺が届いたよ
            </p>
          </div>

          <div className="p-5 flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] px-8 py-6 text-center shadow-lg">
              <p className="text-[9px] tracking-[0.15em] text-white/40">FROM</p>
              <p className="mt-2 text-2xl font-bold text-white">{meishi.prefecture}</p>
              <div className="mt-3 h-px w-12 mx-auto bg-white/20" />
              <p className="mt-3 text-base font-medium text-white/80">{meishi.name}</p>
            </div>
          </div>
        </section>

        <button
          onClick={handleReceiveAndGo}
          className="w-full rounded-[24px] border-[3px] border-[#744b2e] bg-[#1f8f5f] px-5 py-4 text-[16px] font-black text-white shadow-[0_6px_0_#166647] transition active:translate-y-[2px] active:shadow-[0_3px_0_#166647]"
        >
          {myMeishi ? "話のタネを見る" : "自分の名刺も作る"}
        </button>
        <p className="text-[#888] text-xs text-center">
          {myMeishi
            ? "あなたの名刺も相手に届きます"
            : "名刺を作ると、AIが2人の話のタネを生成するよ！"}
        </p>
      </div>
    </div>
  );
}
