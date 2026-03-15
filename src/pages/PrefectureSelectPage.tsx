import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loadMyMeishi, loadSelectedName, saveMyMeishi, saveSelectedName } from "../utils/appStorage";

const PREFECTURE_REGIONS = [
  { name: "北海道", prefectures: ["北海道"] },
  {
    name: "東北",
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    name: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    name: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  { name: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"] },
  { name: "四国", prefectures: ["徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
] as const;

function createMeishiId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `meishi-${Date.now()}`;
}

export function PrefectureSelectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadSelectedName());
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const savedMeishi = loadMyMeishi();

  if (savedMeishi) {
    return <Navigate to="/preview" replace />;
  }

  const normalizedFilter = filterText.trim();
  const filteredRegions = PREFECTURE_REGIONS.map((region) => ({
    ...region,
    prefectures: normalizedFilter
      ? region.prefectures.filter((prefecture) => prefecture.includes(normalizedFilter))
      : [...region.prefectures],
  })).filter((region) => region.prefectures.length > 0);

  const handleNext = () => {
    if (selectedPrefecture && name.trim()) {
      saveSelectedName(name.trim());
      const meishi = {
        id: createMeishiId(),
        name: name.trim(),
        prefecture: selectedPrefecture,
        createdAt: new Date().toISOString(),
      };
      saveMyMeishi(meishi);
      navigate("/");
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
              名刺を交換すると、AIが2人の地元をもとに「話のタネ」を生成。初対面の会話が盛り上がる！
            </p>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="rounded-[24px] border-2 border-dashed border-[#744b2e] bg-[#fff0c7] px-4 py-4">
              <p className="text-xs font-black tracking-[0.22em] text-[#a54f23]">HOW IT WORKS</p>
              <div className="mt-2 space-y-2 text-sm font-bold text-[#7c5a39]">
                <p>① 名前と出身地を入力して名刺をつくる</p>
                <p>② QRコードで名刺を交換する</p>
                <p>③ AIが2人の地元から「話のタネ」を生成！</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-5 shadow-[0_8px_0_#d2b17e]">
          <label
            htmlFor="selected-name"
            className="text-sm font-black tracking-[0.14em] text-[#a54f23]"
          >
            あなたの名前
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
          <div className="mb-3 flex items-center justify-between rounded-[20px] bg-[#f9e2ad] px-4 py-3">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">SELECT</p>
              <h2 className="text-lg font-black">出身地をえらぶ</h2>
            </div>
            <div className="rounded-full border-2 border-[#744b2e] bg-white px-3 py-1 text-xs font-black">
              8地区 / 47都道府県
            </div>
          </div>

          <div className="mb-3 rounded-[16px] border-2 border-[#d5b98b] bg-white px-3 py-2">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="都道府県名で検索..."
              className="w-full text-[14px] text-[#3d2718] outline-none placeholder:text-[#b59777]"
            />
          </div>

          <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
            {filteredRegions.length > 0 ? (
              filteredRegions.map((region) => (
                <section key={region.name} aria-label={`${region.name}地方`} className="space-y-2">
                  <div className="sticky top-0 z-[1] flex items-center justify-between rounded-[14px] bg-[#f7edd6] px-3 py-2">
                    <h3 className="text-sm font-black tracking-[0.08em] text-[#744b2e]">{region.name}</h3>
                    <span className="text-[11px] font-black text-[#a54f23]">
                      {region.prefectures.length}件
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {region.prefectures.map((prefecture) => {
                      const isSelected = selectedPrefecture === prefecture;
                      return (
                        <button
                          key={prefecture}
                          type="button"
                          onClick={() => setSelectedPrefecture(prefecture)}
                          className={`rounded-[14px] border-[2px] px-2 py-2.5 text-center text-[13px] font-bold transition ${
                            isSelected
                              ? "border-[#744b2e] bg-[#d94841] text-white shadow-[0_3px_0_#8e2a24]"
                              : "border-[#d5b98b] bg-white text-[#5a402d] shadow-[0_2px_0_#ead3ac] active:translate-y-[1px]"
                          }`}
                        >
                          {prefecture}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-[18px] border-2 border-dashed border-[#d5b98b] bg-[#fffaf0] px-4 py-6 text-center text-sm font-bold text-[#8a6847]">
                該当する都道府県が見つかりません
              </div>
            )}
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
              ? "この内容で名刺をつくる"
              : "名前と出身地を入力してください"}
          </button>
        </div>
      </div>
    </div>
  );
}
