import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  loadMyMeishi,
  loadSelectedName,
  saveSelectedName,
  saveSelectedPrefecture,
} from "../utils/appStorage";

type Sticker = {
  readonly id: string;
  readonly prefecture: string;
  readonly label: string;
  readonly accent: string;
  readonly position: string;
};

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

const SPECIALTY_STICKERS: ReadonlyArray<Sticker> = [
  {
    id: "hokkaido-melon",
    prefecture: "北海道",
    label: "メロン",
    accent: "#ff9f1c",
    position: "top-12 left-[-18px] rotate-[-12deg]",
  },
  {
    id: "tokyo-taiyaki",
    prefecture: "東京都",
    label: "たい焼き",
    accent: "#ff7b54",
    position: "top-28 right-[-10px] rotate-[9deg]",
  },
  {
    id: "kyoto-temple",
    prefecture: "京都府",
    label: "お寺",
    accent: "#d94841",
    position: "top-[340px] left-[-22px] rotate-[-8deg]",
  },
  {
    id: "osaka-takoyaki",
    prefecture: "大阪府",
    label: "たこ焼き",
    accent: "#ef476f",
    position: "top-[430px] right-[-14px] rotate-[12deg]",
  },
  {
    id: "aichi-shachihoko",
    prefecture: "愛知県",
    label: "しゃちほこ",
    accent: "#355070",
    position: "bottom-[280px] left-[-16px] rotate-[-10deg]",
  },
  {
    id: "kagawa-udon",
    prefecture: "香川県",
    label: "うどん",
    accent: "#f4a261",
    position: "bottom-[220px] right-[-16px] rotate-[10deg]",
  },
  {
    id: "fukuoka-ramen",
    prefecture: "福岡県",
    label: "ラーメン",
    accent: "#118ab2",
    position: "bottom-28 left-[-10px] rotate-[8deg]",
  },
  {
    id: "okinawa-shisa",
    prefecture: "沖縄県",
    label: "シーサー",
    accent: "#06d6a0",
    position: "bottom-16 right-[-8px] rotate-[-8deg]",
  },
];

type StickerIllustrationProps = {
  readonly id: string;
  readonly accent: string;
};

function StickerIllustration({ id, accent }: StickerIllustrationProps) {
  if (id.includes("melon")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <circle cx="40" cy="43" r="22" fill="#f6d365" />
        <path d="M30 25c2-7 9-11 17-11 2 0 4 0 6 1" fill="none" stroke="#4f7c2b" strokeWidth="5" strokeLinecap="round" />
        <path d="M20 43h40M24 32c10 4 22 4 32 0M24 54c10-4 22-4 32 0M31 24c-4 11-4 25 0 38M49 24c4 11 4 25 0 38" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }

  if (id.includes("taiyaki")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <path d="M16 42c10-18 35-21 49 0-14 21-39 18-49 0Z" fill={accent} />
        <path d="M25 34l11 6M25 44l11 2M43 31l8 6M43 45l8-1" stroke="#ffe8c2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="34" cy="38" r="2.5" fill="#3d2718" />
        <path d="M15 41l-7-7 2 11 5-4Z" fill="#ffd166" />
      </svg>
    );
  }

  if (id.includes("temple")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <path d="M17 29h46L40 16 17 29Z" fill={accent} />
        <path d="M21 36h38l-3-7H24l-3 7Z" fill="#ffd166" />
        <path d="M25 37h8v20h-8zm22 0h8v20h-8zM20 58h40" fill="#fff6dd" stroke="#744b2e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (id.includes("takoyaki")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <circle cx="28" cy="43" r="11" fill="#d97b2d" />
        <circle cx="40" cy="34" r="11" fill="#c96d23" />
        <circle cx="52" cy="45" r="11" fill="#d97b2d" />
        <path d="M18 44h42" stroke="#5b2d12" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 37c4 4 8 4 12 0m6-7c4 4 8 4 12 0m0 20c4 4 8 4 12 0" stroke="#fff3d1" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (id.includes("shachihoko")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <path d="M19 50c11-22 27-23 41-21-2 8-8 15-17 21 3 3 5 7 5 12-9-2-15-8-18-15-3 4-7 7-11 8 0-2 0-3 0-5Z" fill={accent} />
        <circle cx="47" cy="34" r="3" fill="#fff8df" />
        <path d="M35 31c4-8 10-12 19-15M26 51c7-2 13-1 19 2" fill="none" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (id.includes("udon")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <path d="M16 40h48c0 14-11 24-24 24S16 54 16 40Z" fill={accent} />
        <path d="M23 39c0-9 8-16 17-16s17 7 17 16" fill="#fff7e6" />
        <path d="M26 35c5 4 10 6 14 6s9-2 14-6" fill="none" stroke="#f6d365" strokeWidth="4" strokeLinecap="round" />
        <path d="M52 24l8-9" stroke="#744b2e" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (id.includes("ramen")) {
    return (
      <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
        <path d="M16 41h48c-1 14-11 23-24 23S17 55 16 41Z" fill={accent} />
        <path d="M23 41c1-8 8-14 17-14s16 6 17 14" fill="#fff8df" />
        <path d="M26 32c5 4 8 8 14 8 5 0 9-3 14-8" fill="none" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" />
        <path d="M49 23l8-8M54 28l8-8" stroke="#744b2e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
      <path d="M20 56V34l20-13 20 13v22" fill={accent} />
      <path d="M26 56V40l14-9 14 9v16" fill="#ffd166" />
      <circle cx="31" cy="38" r="4" fill="#3d2718" />
      <circle cx="49" cy="38" r="4" fill="#3d2718" />
      <path d="M32 51c4-4 12-4 16 0" fill="none" stroke="#3d2718" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-24 mx-auto max-w-[460px]">
        {SPECIALTY_STICKERS.map((sticker) => (
          <div
            key={sticker.id}
            className={`absolute hidden rounded-[28px] border-2 border-[#744b2e] bg-[#fff9ea] p-2 shadow-[0_6px_0_#d6b98e] sm:block ${sticker.position}`}
            aria-hidden="true"
          >
            <StickerIllustration id={sticker.id} accent={sticker.accent} />
            <div className="mt-1 rounded-full bg-white px-2 py-1 text-center text-[10px] font-black tracking-[0.08em] text-[#744b2e]">
              {sticker.prefecture}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">JIMOTO EXPRESS</p>
            <h1 className="mt-1 text-[28px] font-black leading-none">ご当地イラスト名刺</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              日本各地のモチーフに囲まれながら、あなたの地元トークを名刺にしよう
            </p>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              {SPECIALTY_STICKERS.map((sticker) => (
                <div
                  key={sticker.id}
                  className="rounded-[22px] border-2 border-[#744b2e] bg-[#fffdf4] px-3 py-3 shadow-[0_4px_0_#e7c58b]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="inline-flex rounded-full px-2 py-1 text-[10px] font-black tracking-[0.16em] text-white"
                      style={{ backgroundColor: sticker.accent }}
                    >
                      {sticker.prefecture}
                    </div>
                    <StickerIllustration id={sticker.id} accent={sticker.accent} />
                  </div>
                  <p className="mt-2 text-base font-black">{sticker.label}</p>
                  <p className="mt-1 text-xs font-bold text-[#8a6847]">
                    ご当地っぽさ全開で会話のきっかけを作る
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border-2 border-dashed border-[#744b2e] bg-[#fff0c7] px-4 py-4">
              <p className="text-xs font-black tracking-[0.22em] text-[#a54f23]">START STATION</p>
              <h2 className="mt-1 text-xl font-black">まずは名前と出身地を登録</h2>
              <p className="mt-1 text-sm font-bold text-[#7c5a39]">
                イラストに埋もれるくらい地元感のある名刺づくりを、ここから始めます。
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
              ? `${selectedPrefecture}の切符で出発する`
              : "名前と出身地を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
