import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { saveSelectedPrefecture, loadMyMeishi } from "../utils/appStorage";

// 地方ごとに都道府県をグループ化
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
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const savedMeishi = loadMyMeishi();

  // 名刺が保存済みなら自動的にプレビューへリダイレクト
  if (savedMeishi) {
    return <Navigate to="/preview" replace />;
  }

  const handleNext = () => {
    if (selectedPrefecture) {
      saveSelectedPrefecture(selectedPrefecture);
      navigate("/topics");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative pb-20">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">出身地はどこ？</h2>
        <p className="text-sm text-gray-500">あなたの地元の話題で盛り上がりましょう</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
        {PREFECTURE_GROUPS.map((group) => (
          <div key={group.region} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-md font-semibold text-pink-500 mb-3 border-b border-pink-100 pb-2">
              {group.region}
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {group.prefectures.map((pref) => {
                const isSelected = selectedPrefecture === pref;
                return (
                  <button
                    key={pref}
                    onClick={() => setSelectedPrefecture(pref)}
                    className={`
                      min-h-[44px] py-2.5 px-1 text-sm rounded-lg transition-all duration-200 ease-in-out font-medium
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md transform scale-105"
                          : "bg-gray-50 text-gray-700 hover:bg-orange-50 active:bg-orange-100 border border-transparent shadow-sm"
                      }
                    `}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* フローティングアクションボタンエリア */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}>
        <div className="max-w-md mx-auto">
          <button
            onClick={handleNext}
            disabled={!selectedPrefecture}
            className={`
              w-full py-4 rounded-full font-bold text-lg shadow-lg flex items-center justify-center
              transition-all duration-300 ease-out
              ${
                selectedPrefecture
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {selectedPrefecture ? `${selectedPrefecture}で決定！` : "出身地を選択してください"}
            {selectedPrefecture && (
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
