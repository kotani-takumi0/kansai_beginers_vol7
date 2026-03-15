import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import type { ExchangeHistoryEntry, MeishiData } from "../types";
import {
  loadExchangeHistory,
  loadSelectedName,
  loadSelectedPrefecture,
  loadSelectedTopics,
  loadPartnerMeishi,
  clearPartnerMeishi,
  saveMyMeishi,
  loadMyMeishi,
  clearMyMeishi,
} from "../utils/appStorage";

type PreviewIllustration = {
  readonly id: string;
  readonly label: string;
  readonly accent: string;
  readonly mood: string;
};

const PREVIEW_ILLUSTRATIONS: Record<string, PreviewIllustration> = {
  北海道: { id: "melon", label: "メロン", accent: "#ff9f1c", mood: "北の甘さ" },
  青森県: { id: "apple", label: "りんご", accent: "#e63946", mood: "しゃきっと" },
  岩手県: { id: "wanko", label: "わんこそば", accent: "#8d6e63", mood: "椀が止まらない" },
  宮城県: { id: "gyutan", label: "牛たん", accent: "#2a9d8f", mood: "香ばしい" },
  秋田県: { id: "kiritanpo", label: "きりたんぽ", accent: "#a66a3f", mood: "あつあつ" },
  山形県: { id: "cherry", label: "さくらんぼ", accent: "#ef476f", mood: "つやつや" },
  福島県: { id: "peach", label: "もも", accent: "#ff8fab", mood: "みずみずしい" },
  茨城県: { id: "natto", label: "納豆", accent: "#7f5539", mood: "ねばり強い" },
  栃木県: { id: "strawberry", label: "いちご", accent: "#ff4d6d", mood: "とちおとめ" },
  群馬県: { id: "daruma", label: "だるま", accent: "#d62828", mood: "必勝" },
  埼玉県: { id: "sweetpotato", label: "さつまいも", accent: "#9c6644", mood: "ほくほく" },
  千葉県: { id: "peanut", label: "落花生", accent: "#b08968", mood: "香ばしい" },
  東京都: { id: "taiyaki", label: "たい焼き", accent: "#ff7b54", mood: "下町の熱" },
  神奈川県: { id: "ship", label: "港", accent: "#457b9d", mood: "潮風" },
  新潟県: { id: "rice", label: "お米", accent: "#dda15e", mood: "つやつや" },
  富山県: { id: "fish", label: "白えび", accent: "#4ea8de", mood: "海の幸" },
  石川県: { id: "goldleaf", label: "金箔", accent: "#d4a017", mood: "きらり" },
  福井県: { id: "dinosaur", label: "恐竜", accent: "#588157", mood: "どーんと" },
  山梨県: { id: "grape", label: "ぶどう", accent: "#7b2cbf", mood: "実り" },
  長野県: { id: "apple", label: "りんご", accent: "#e76f51", mood: "高原の香り" },
  岐阜県: { id: "ayu", label: "鮎", accent: "#2a9d8f", mood: "清流" },
  静岡県: { id: "tea", label: "お茶", accent: "#5f8f3f", mood: "一服" },
  愛知県: { id: "shachihoko", label: "しゃちほこ", accent: "#355070", mood: "きらり" },
  三重県: { id: "lobster", label: "伊勢えび", accent: "#c1121f", mood: "豪華" },
  滋賀県: { id: "lake", label: "琵琶湖", accent: "#3a86ff", mood: "でっかい" },
  京都府: { id: "temple", label: "お寺", accent: "#d94841", mood: "雅" },
  大阪府: { id: "takoyaki", label: "たこ焼き", accent: "#ef476f", mood: "粉もん魂" },
  兵庫県: { id: "cow", label: "神戸牛", accent: "#9c6644", mood: "上品" },
  奈良県: { id: "deer", label: "鹿", accent: "#8d6e63", mood: "のんびり" },
  和歌山県: { id: "mikan", label: "みかん", accent: "#ff9f1c", mood: "太陽" },
  鳥取県: { id: "dune", label: "砂丘", accent: "#c49a6c", mood: "風紋" },
  島根県: { id: "shimenawa", label: "しめ縄", accent: "#8c6a43", mood: "ご縁" },
  岡山県: { id: "peach", label: "白桃", accent: "#f4a6b8", mood: "やさしい甘さ" },
  広島県: { id: "okonomiyaki", label: "お好み焼き", accent: "#c8553d", mood: "重ね焼き" },
  山口県: { id: "puffer", label: "ふぐ", accent: "#277da1", mood: "ぴりっと" },
  徳島県: { id: "sudachi", label: "すだち", accent: "#70e000", mood: "さわやか" },
  香川県: { id: "udon", label: "うどん", accent: "#f4a261", mood: "コシ強め" },
  愛媛県: { id: "mikan", label: "みかん", accent: "#ff9f1c", mood: "みずみずしい" },
  高知県: { id: "bonito", label: "かつお", accent: "#577590", mood: "豪快" },
  福岡県: { id: "ramen", label: "ラーメン", accent: "#118ab2", mood: "湯気" },
  佐賀県: { id: "pottery", label: "焼き物", accent: "#6d597a", mood: "手仕事" },
  長崎県: { id: "ship", label: "異国の港", accent: "#457b9d", mood: "ロマン" },
  熊本県: { id: "bear", label: "くまモチーフ", accent: "#264653", mood: "どっしり" },
  大分県: { id: "onsen", label: "温泉", accent: "#f28482", mood: "ほかほか" },
  宮崎県: { id: "mango", label: "マンゴー", accent: "#ffb703", mood: "南国" },
  鹿児島県: { id: "volcano", label: "火山", accent: "#e76f51", mood: "力強い" },
  沖縄県: { id: "shisa", label: "シーサー", accent: "#06d6a0", mood: "守り神" },
};

function PreviewIllustrationBadge({
  illustration,
  className = "h-16 w-16",
}: {
  readonly illustration: PreviewIllustration;
  readonly className?: string;
}) {
  const { id, accent } = illustration;

  if (id === "melon" || id === "apple" || id === "peach" || id === "grape" || id === "mango" || id === "mikan" || id === "cherry" || id === "strawberry") {
    return (
      <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <circle cx="48" cy="52" r="26" fill={accent} />
        <path d="M39 29c4-8 12-13 21-13" fill="none" stroke="#4f7c2b" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="61" cy="29" rx="11" ry="6" fill="#77b255" transform="rotate(-18 61 29)" />
        <circle cx="38" cy="46" r="5" fill="#fff" opacity="0.18" />
      </svg>
    );
  }

  if (id === "takoyaki" || id === "okonomiyaki" || id === "gyutan" || id === "ramen" || id === "udon" || id === "wanko" || id === "kiritanpo") {
    return (
      <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <path d="M20 50h56c0 16-13 28-28 28S20 66 20 50Z" fill={accent} />
        <path d="M28 49c0-11 9-20 20-20s20 9 20 20" fill="#fff6df" />
        <path d="M33 41c5 4 10 7 15 7s10-3 15-7" fill="none" stroke="#ffd166" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "temple" || id === "shachihoko" || id === "pottery" || id === "goldleaf" || id === "shimenawa" || id === "dinosaur" || id === "volcano" || id === "onsen") {
    return (
      <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
        <path d="M26 70V46l22-14 22 14v24" fill={accent} />
        <path d="M31 44h34L48 28 31 44Z" fill="#ffd166" />
        <rect x="41" y="52" width="14" height="18" rx="4" fill="#fff9ea" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <circle cx="48" cy="48" r="28" fill={accent} />
      <path d="M33 56c4-6 10-10 15-10 6 0 12 4 15 10" fill="none" stroke="#fff9ea" strokeWidth="6" strokeLinecap="round" />
      <circle cx="39" cy="41" r="4" fill="#fff9ea" />
      <circle cx="57" cy="41" r="4" fill="#fff9ea" />
    </svg>
  );
}

function createMeishiId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `meishi-${Date.now()}`;
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <line x1="21" y1="14" x2="21" y2="17" />
      <line x1="14" y1="21" x2="17" y2="21" />
      <line x1="21" y1="21" x2="21" y2="21" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <path d="M8 21H3v-5" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FlipHint() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
      <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" />
    </svg>
  );
}

function formatHistoryDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MeishiCard({
  meishi,
  shareUrl,
  isFlipped,
  onFlip,
  illustration,
}: {
  readonly meishi: MeishiData;
  readonly shareUrl: string;
  readonly isFlipped: boolean;
  readonly onFlip: () => void;
  readonly illustration: PreviewIllustration;
}) {
  return (
    <div className="flex justify-center px-8 pb-2">
      <div
        className="w-full max-w-[320px] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={onFlip}
      >
        <div
          className="relative transition-transform duration-600 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] shadow-[0_8px_32px_rgba(0,0,0,.18)]"
            style={{
              aspectRatio: "1.586 / 1",
              backfaceVisibility: "hidden",
            }}
          >
            <span className="absolute top-4 left-5 text-[10px] font-semibold tracking-[0.2em] text-white/50">
              JIMOTO MEISHI
            </span>

            <h2 className="absolute top-10 left-5 text-2xl font-bold tracking-tight text-white">
              {meishi.prefecture}
            </h2>

            <div className="absolute right-4 bottom-9 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-[2px]">
              <PreviewIllustrationBadge illustration={illustration} className="h-12 w-12" />
            </div>

            <div className="absolute top-4 right-5 text-right">
              <p className="text-[9px] tracking-[0.15em] text-white/40">TOPICS</p>
              <p className="text-xl font-bold text-white/80">{meishi.topics.length}</p>
            </div>

            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <span className="text-[11px] font-medium text-white/30">
                {new Date(meishi.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <div className="flex gap-1">
                {meishi.topics.map(({ agrees }, i) => (
                  <span
                    key={i}
                    className={`inline-block h-2 w-2 rounded-full ${
                      agrees ? "bg-emerald-400/60" : "bg-orange-400/60"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#3a3a2d] via-[#4a4a3a] to-[#3a3a2d] shadow-[0_8px_32px_rgba(0,0,0,.18)]"
            style={{
              aspectRatio: "1.586 / 1",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="absolute top-3 left-5 text-[10px] font-semibold tracking-[0.2em] text-white/50">
              SCAN ME
            </span>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl bg-white p-2">
                <QRCodeSVG
                  value={shareUrl}
                  size={100}
                  level="M"
                />
              </div>
            </div>

            <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-medium text-white/40">
              {meishi.prefecture}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExchangeHistoryCard({ entry }: { readonly entry: ExchangeHistoryEntry }) {
  return (
    <div className="rounded-2xl border border-[#ececea] bg-[#f8f8f6] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1a1a1a]">
            {entry.partnerMeishi.prefecture}の人と交換
          </p>
          <p className="mt-1 text-xs text-[#888]">{formatHistoryDate(entry.exchangedAt)}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#555]">
          {entry.matchCount}一致 / {entry.mismatchCount}不一致
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {entry.partnerMeishi.topics.slice(0, 3).map(({ topic }) => (
          <span
            key={topic.id}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#666]"
          >
            {topic.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MeishiPreviewPage() {
  const navigate = useNavigate();
  const prefecture = loadSelectedPrefecture();
  const topics = loadSelectedTopics();
  const partnerMeishi = loadPartnerMeishi();
  const exchangeHistory = loadExchangeHistory();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const savedMeishi = loadMyMeishi();
  const illustration =
    PREVIEW_ILLUSTRATIONS[prefecture ?? savedMeishi?.prefecture ?? ""] ?? {
      id: "fallback",
      label: "ご当地",
      accent: "#e85d3a",
      mood: "ローカル感",
    };

  const meishi = useMemo<MeishiData | null>(() => {
    if (prefecture && topics.length > 0) {
      return {
        id: createMeishiId(),
        name: loadSelectedName() || savedMeishi?.name,
        prefecture,
        topics,
        createdAt: new Date().toISOString(),
      };
    }

    return savedMeishi;
  }, [prefecture, savedMeishi, topics]);

  useEffect(() => {
    if (meishi) {
      saveMyMeishi(meishi);
    }
  }, [meishi]);

  if (!meishi) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col items-center justify-center px-5">
        <div className="w-full rounded-2xl border border-[#ececea] bg-white p-6">
          <h2 className="text-center text-lg font-bold text-[#1a1a1a]">名刺データがありません</h2>
          <p className="mt-2 text-center text-sm text-[#888]">
            先に出身地を選んで、ネタの立場を決めてください。
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl bg-[#e85d3a] px-5 py-3.5 text-[15px] font-semibold text-white"
            >
              最初からつくる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] pb-8 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-[-110px] left-[-70px] h-60 w-60 rounded-full bg-[#ffe09a]" />
        <div className="absolute top-44 right-[-90px] h-64 w-64 rounded-full bg-[#ffd7b5]" />
        <div className="absolute bottom-20 left-[-100px] h-72 w-72 rounded-full bg-[#bde0c5]" />
      </div>

      <div className="relative mx-auto max-w-[420px] px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">MEISHI FINISH</p>
            <span className="mt-1 block text-[17px] font-semibold">じもと名刺</span>
            <h1 className="mt-1 text-[27px] font-black leading-tight">{meishi.prefecture}の名刺が完成</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              ご当地モチーフを添えて、あなたの地元トークを1枚のカードにまとめました
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border-2 border-[#744b2e] bg-white shadow-[0_5px_0_#e7c58b]"
              style={{ backgroundColor: `${illustration.accent}20` }}
            >
              <PreviewIllustrationBadge illustration={illustration} className="h-20 w-20" />
            </div>
            <div className="min-w-0">
              <div
                className="inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white"
                style={{ backgroundColor: illustration.accent }}
              >
                {illustration.label}
              </div>
              <p className="mt-2 text-lg font-black text-[#3d2718]">{illustration.mood}</p>
              <p className="mt-1 text-sm font-bold text-[#7c5a39]">
                名刺の表にも地元らしさをのせて、そのまま共有や比較に進めます。
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="relative mx-auto max-w-[420px] pb-8">
        <MeishiCard
          meishi={meishi}
          shareUrl={toShareUrl(meishi)}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
          illustration={illustration}
        />

        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="mx-auto mb-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#888] transition active:scale-95"
        >
          <FlipHint />
          タップして{isFlipped ? "表に戻す" : "QRコードを表示"}
        </button>

        <div className="flex flex-col gap-3 px-5 pb-4">
          {partnerMeishi && (
            <button
              type="button"
              onClick={() => {
                clearPartnerMeishi();
                navigate("/gacha", {
                  state: { myMeishi: meishi, partnerMeishi },
                });
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white"
            >
              <CompareIcon />
              名刺を比較
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
          >
            <QrIcon />
            QRコードを読み取る
          </button>
          <button
            type="button"
            onClick={() => {
              clearMyMeishi();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#e0e0dc] bg-white px-4 py-3.5 text-[14px] font-semibold text-[#e85d3a] transition active:scale-[0.98]"
          >
            <RefreshIcon />
            作り直す
          </button>
        </div>

        <div className="mx-5 rounded-2xl border border-[#ececea] bg-white p-5">
          <h3 className="mb-4 text-base font-bold text-[#1a1a1a]">ネタ一覧</h3>
          <div className="divide-y divide-[#f0f0ee]">
            {meishi.topics.map(({ topic, agrees }, index) => (
              <div key={topic.id} className="flex items-start justify-between gap-3 py-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f0f0ee] text-[11px] font-bold text-[#888]">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-[#888]">
                      {topic.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#1a1a1a]">
                    {topic.text}
                  </p>
                </div>
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    agrees
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {agrees ? "わかる" : "違う"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {exchangeHistory.length > 0 && (
          <div className="mx-5 mt-4">
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ececea] bg-white px-4 py-3.5 text-[14px] font-semibold text-[#888] transition active:scale-[0.98]"
            >
              <HistoryIcon />
              交換履歴（{exchangeHistory.length}件）
              <span
                className="ml-1 text-[10px] transition-transform duration-200"
                style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▼
              </span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-3">
                {exchangeHistory.map((entry) => (
                  <ExchangeHistoryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
