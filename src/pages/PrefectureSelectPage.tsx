import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  loadMyMeishi,
  loadSelectedName,
  saveSelectedName,
  saveSelectedPrefecture,
} from "../utils/appStorage";

const PREFECTURE_GROUPS = [
  {
    region: "北海道・東北",
    badgeColor: "bg-[#2d8fcb]",
    prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    region: "関東",
    badgeColor: "bg-[#f07f29]",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    region: "中部",
    badgeColor: "bg-[#4d9955]",
    prefectures: [
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
    ],
  },
  {
    region: "近畿",
    badgeColor: "bg-[#c85050]",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    region: "中国",
    badgeColor: "bg-[#6f63c6]",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    region: "四国",
    badgeColor: "bg-[#ffb000]",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    region: "九州・沖縄",
    badgeColor: "bg-[#009688]",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

const SPECIALTY_SHOWCASE = [
  { name: "夕張メロン", region: "北海道", color: "#ff9f1c", angle: "-rotate-3" },
  { name: "牛たん", region: "宮城", color: "#2a9d8f", angle: "rotate-2" },
  { name: "もんじゃ焼き", region: "東京", color: "#f4a261", angle: "-rotate-2" },
  { name: "ひつまぶし", region: "愛知", color: "#e76f51", angle: "rotate-3" },
  { name: "たこ焼き", region: "大阪", color: "#ef476f", angle: "-rotate-1" },
  { name: "讃岐うどん", region: "香川", color: "#ffd166", angle: "rotate-1" },
  { name: "明太子", region: "福岡", color: "#118ab2", angle: "-rotate-2" },
  { name: "ちんすこう", region: "沖縄", color: "#06d6a0", angle: "rotate-2" },
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
    <div
      className="relative min-h-full overflow-hidden bg-[#f5edd7] pb-28 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-[-80px] left-[-40px] h-52 w-52 rounded-full bg-[#ffdf8d]" />
        <div className="absolute top-40 right-[-70px] h-56 w-56 rounded-full bg-[#ffd1b2]" />
        <div className="absolute bottom-32 left-[-80px] h-64 w-64 rounded-full bg-[#b7e4c7]" />
      </div>

      <div className="relative mx-auto flex max-w-[440px] flex-col gap-5 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">JIMOTO EXPRESS</p>
            <h1 className="mt-1 text-[28px] font-black leading-none">全国うまいもん発見マップ</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              名産品みたいにキャラが立つ、あなたの地元トークを集めよう
            </p>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTY_SHOWCASE.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-[22px] border-2 border-[#744b2e] bg-[#fffdf4] px-3 py-3 shadow-[0_4px_0_#e7c58b] ${item.angle}`}
                >
                  <div
                    className="inline-flex rounded-full px-2 py-1 text-[10px] font-black tracking-[0.16em] text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.region}
                  </div>
                  <p className="mt-2 text-base font-black">{item.name}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a6847]">ご当地トークの熱量で勝負</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border-2 border-dashed border-[#744b2e] bg-[#fff0c7] px-4 py-4">
              <p className="text-xs font-black tracking-[0.22em] text-[#a54f23]">START STATION</p>
              <h2 className="mt-1 text-xl font-black">まずは名前と出身地を登録</h2>
              <p className="mt-1 text-sm font-bold text-[#7c5a39]">
                最初の駅で切符を作るイメージで、あなたの名刺づくりを始めます。
              </p>
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
              <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">ROUTE SELECT</p>
              <h2 className="text-lg font-black">出身地の駅をえらぶ</h2>
            </div>
            <div className="rounded-full border-2 border-[#744b2e] bg-white px-3 py-1 text-xs font-black">
              全47都道府県
            </div>
          </div>

          <div className="space-y-4">
            {PREFECTURE_GROUPS.map((group) => (
              <div
                key={group.region}
                className="rounded-[24px] border-2 border-[#744b2e] bg-[#fff9ea] p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black tracking-[0.14em] text-white ${group.badgeColor}`}
                  >
                    {group.region}
                  </span>
                  <div className="h-[2px] flex-1 bg-[repeating-linear-gradient(90deg,#744b2e_0_10px,transparent_10px_18px)]" />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {group.prefectures.map((pref) => {
                    const isSelected = selectedPrefecture === pref;

                    return (
                      <button
                        key={pref}
                        onClick={() => setSelectedPrefecture(pref)}
                        className={`min-h-[52px] rounded-[18px] border-2 px-1 py-2 text-sm font-black transition ${
                          isSelected
                            ? "border-[#744b2e] bg-[#d94841] text-white shadow-[0_4px_0_#8e2a24]"
                            : "border-[#d5b98b] bg-white text-[#5a402d] shadow-[0_3px_0_#ead3ac] active:translate-y-[1px]"
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
        </section>
      </div>

      <div
        className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f5edd7] via-[#f5edd7] to-transparent px-4 pt-6"
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
              ? `${selectedPrefecture}の切符で出発する`
              : "名前と出身地を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
