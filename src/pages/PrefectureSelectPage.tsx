import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  loadMyMeishi,
  loadSelectedName,
  saveSelectedName,
  saveSelectedPrefecture,
} from "../utils/appStorage";
import { getSupportedPrefectures } from "../data/prefectureTopics";

type PrefectureStyle = {
  readonly label: string;
  readonly accent: string;
  readonly emoji: string;
};

const PREFECTURE_STYLES: Record<string, PrefectureStyle> = {
  大阪府: { label: "たこ焼き", accent: "#ef476f", emoji: "🐙" },
  北海道: { label: "メロン", accent: "#ff9f1c", emoji: "🍈" },
  東京都: { label: "たい焼き", accent: "#ff7b54", emoji: "🐟" },
  福岡県: { label: "ラーメン", accent: "#118ab2", emoji: "🍜" },
  沖縄県: { label: "シーサー", accent: "#06d6a0", emoji: "🦁" },
};

const SUPPORTED_PREFECTURES = getSupportedPrefectures();

export function PrefectureSelectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadSelectedName());
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const savedMeishi = loadMyMeishi();

  if (savedMeishi) {
    return <Navigate to="/preview" replace />;
  }

  const handleNext = () => {
    if (selectedPrefecture && name.trim()) {
      saveSelectedName(name.trim());
      saveSelectedPrefecture(selectedPrefecture);
      navigate("/topics");
    }
  };

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] pb-24 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute top-[-120px] left-[-90px] h-64 w-64 rounded-full bg-[#ffd879]" />
        <div className="absolute top-40 right-[-100px] h-72 w-72 rounded-full bg-[#ffd4b2]" />
        <div className="absolute bottom-16 left-[-110px] h-72 w-72 rounded-full bg-[#c8e6c9]" />
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">JIMOTO SHOCK</p>
            <h1 className="mt-1 text-[28px] font-black leading-none">じもとショック名刺</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              あなたの「普通」が、誰かの「衝撃」になる。地元のあたりまえを名刺にしよう。
            </p>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="rounded-[24px] border-2 border-dashed border-[#744b2e] bg-[#fff0c7] px-4 py-4">
              <p className="text-xs font-black tracking-[0.22em] text-[#a54f23]">HOW IT WORKS</p>
              <div className="mt-2 space-y-2 text-sm font-bold text-[#7c5a39]">
                <p>① 出身地を選んで「地元あるある」に答える</p>
                <p>② あなたの「普通」が名刺になる</p>
                <p>③ 交換して、相手の「普通」にショックを受ける！</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-5 shadow-[0_8px_0_#d2b17e]">
          <label
            htmlFor="selected-name"
            className="text-sm font-black tracking-[0.14em] text-[#a54f23]"
          >
            まずは名前を教えてください
          </label>
          <div className="mt-3 rounded-[20px] border-2 border-[#744b2e] bg-[#fff3d1] p-1">
            <input
              id="selected-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例: たろう"
              className="w-full rounded-[16px] bg-white px-4 py-3 text-[16px] font-bold text-[#3d2718] outline-none placeholder:text-[#b59777]"
              maxLength={20}
            />
          </div>
        </section>

        <section className="rounded-[28px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-4 shadow-[0_8px_0_#d2b17e]">
          <div className="mb-4 flex items-center justify-between rounded-[20px] bg-[#f9e2ad] px-4 py-3">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">SELECT</p>
              <h2 className="text-lg font-black">出身地をえらぶ</h2>
            </div>
            <div className="rounded-full border-2 border-[#744b2e] bg-white px-3 py-1 text-xs font-black">
              {SUPPORTED_PREFECTURES.length}地域
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SUPPORTED_PREFECTURES.map((pref) => {
              const style = PREFECTURE_STYLES[pref];
              const isSelected = selectedPrefecture === pref;

              return (
                <button
                  key={pref}
                  onClick={() => setSelectedPrefecture(pref)}
                  className={`flex items-center gap-3 rounded-[20px] border-[3px] px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-[#744b2e] bg-[#d94841] text-white shadow-[0_4px_0_#8e2a24]"
                      : "border-[#d5b98b] bg-white text-[#5a402d] shadow-[0_3px_0_#ead3ac] active:translate-y-[1px]"
                  }`}
                >
                  <span className="text-2xl">{style?.emoji}</span>
                  <div>
                    <p className="text-base font-black">{pref}</p>
                    <p className={`text-xs font-bold ${isSelected ? "text-white/70" : "text-[#8a6847]"}`}>
                      {style?.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div
        className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f7edd6] via-[#f7edd6] to-transparent px-4 pt-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <div className="mx-auto max-w-[440px]">
          <button
            onClick={handleNext}
            disabled={!selectedPrefecture || !name.trim()}
            className={`w-full rounded-[24px] border-[3px] px-5 py-4 text-[16px] font-black transition ${
              selectedPrefecture && name.trim()
                ? "border-[#744b2e] bg-[#1f8f5f] text-white shadow-[0_6px_0_#166647] active:translate-y-[2px] active:shadow-[0_3px_0_#166647]"
                : "border-[#b8a282] bg-[#e7dcc8] text-[#9f8d76]"
            }`}
          >
            {selectedPrefecture
              ? `${selectedPrefecture}の診断をはじめる`
              : "名前と出身地を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
