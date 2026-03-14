import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  saveSelectedPrefecture,
  loadMyMeishi,
  loadSelectedName,
  saveSelectedName,
} from "../utils/appStorage";

const PREFECTURE_GROUPS = [
  {
    region: "北海道・東北",
    prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    region: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    region: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  {
    region: "近畿",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    region: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    region: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    region: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

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
    <div className="mx-auto flex h-full max-w-[420px] flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-5 pb-1 text-center">
        <h2 className="text-[17px] font-semibold text-[#1a1a1a]">出身地はどこ？</h2>
      </div>
      <p className="mb-5 text-center text-sm font-medium text-[#888]">
        あなたの地元の話題で盛り上がりましょう
      </p>

      <div className="px-5 pb-3">
        <div className="rounded-2xl border border-[#ececea] bg-white p-4">
          <label htmlFor="selected-name" className="mb-2 block text-sm font-bold text-[#1a1a1a]">
            まずは名前を教えてください
          </label>
          <input
            id="selected-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例: たろう"
            className="w-full rounded-xl border border-[#e0e0dc] bg-[#f8f8f6] px-4 py-3 text-[15px] text-[#1a1a1a] outline-none transition focus:border-[#e85d3a]"
            maxLength={20}
          />
        </div>
      </div>

      {/* Prefecture groups */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 scrollbar-hide">
        {PREFECTURE_GROUPS.map((group) => (
          <div key={group.region} className="rounded-2xl border border-[#ececea] bg-white p-4">
            <h3 className="mb-3 border-b border-[#f0f0ee] pb-2 text-sm font-bold text-[#e85d3a]">
              {group.region}
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {group.prefectures.map((pref) => {
                const isSelected = selectedPrefecture === pref;
                return (
                  <button
                    key={pref}
                    onClick={() => setSelectedPrefecture(pref)}
                    className={`min-h-[44px] rounded-xl px-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-[#e85d3a] text-white shadow-md"
                        : "border border-[#e0e0dc] bg-[#f8f8f6] text-[#555] active:bg-[#e8e8e4]"
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating action button */}
      <div
        className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f8f8f6] via-[#f8f8f6] to-transparent p-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <div className="mx-auto max-w-[420px]">
          <button
            onClick={handleNext}
            disabled={!selectedPrefecture || !name.trim()}
            className={`flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold shadow-lg transition-all duration-200 ${
              selectedPrefecture && name.trim()
                ? "bg-[#e85d3a] text-white active:scale-[0.98]"
                : "bg-[#e0e0dc] text-[#aaa] cursor-not-allowed"
            }`}
          >
            {selectedPrefecture
              ? `${selectedPrefecture}で決定！`
              : "名前と出身地を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
