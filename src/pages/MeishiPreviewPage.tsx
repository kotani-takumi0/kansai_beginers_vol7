import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import { buildBackendUrl } from "../utils/backendUrl";
import type { ExchangeHistoryEntry, MeishiData } from "../types";
import {
  loadExchangeHistory,
  loadMyMeishi,
  loadPartnerMeishi,
  clearPartnerMeishi,
  clearMyMeishi,
  savePartnerMeishi,
} from "../utils/appStorage";

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
}: {
  readonly meishi: MeishiData;
  readonly shareUrl: string;
  readonly isFlipped: boolean;
  readonly onFlip: () => void;
}) {
  return (
    <div className="flex justify-center px-8 pb-2">
      <div
        className="w-full max-w-[340px] cursor-pointer"
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
          {/* 表面 */}
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-[#e8e4de] bg-[#fffdf8] shadow-[0_2px_12px_rgba(0,0,0,.06)]"
            style={{
              aspectRatio: "1.586 / 1",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <p className="text-[10px] font-medium tracking-[0.2em] text-[#b0a08a] mb-3">
                JIMOTO SHOCK
              </p>
              <h2 className="text-3xl font-black tracking-tight text-[#3d2718]">
                {meishi.prefecture}
              </h2>
              <div className="mt-4 h-px w-12 bg-[#d94841]/40" />
              <p className="mt-4 text-lg font-semibold text-[#5a4635]">{meishi.name}</p>
            </div>

            <span className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-medium text-[#c0b8a8]">
              {new Date(meishi.createdAt).toLocaleDateString("ja-JP")}
            </span>
          </div>

          {/* 裏面 - QRコード */}
          <div
            className="absolute inset-0 w-full overflow-hidden rounded-2xl border border-[#e8e4de] bg-[#fffdf8] shadow-[0_2px_12px_rgba(0,0,0,.06)]"
            style={{
              aspectRatio: "1.586 / 1",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="absolute top-4 left-0 right-0 text-center text-[10px] font-medium tracking-[0.2em] text-[#b0a08a]">
              SCAN ME
            </p>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-[#e8e4de] p-3">
                <QRCodeSVG value={shareUrl} size={120} level="M" />
              </div>
            </div>

            <span className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-medium text-[#c0b8a8]">
              {meishi.prefecture} / {meishi.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExchangeHistoryCard({ entry }: { readonly entry: ExchangeHistoryEntry }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate("/topics", {
          state: { myMeishi: entry.myMeishi, partnerMeishi: entry.partnerMeishi, topics: entry.topics },
        })
      }
      className="w-full rounded-2xl border border-[#ececea] bg-[#f8f8f6] p-4 text-left transition active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1a1a1a]">
            {entry.partnerMeishi.name}（{entry.partnerMeishi.prefecture}）
          </p>
          <p className="mt-1 text-xs text-[#888]">{formatHistoryDate(entry.exchangedAt)}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#555]">
          話題{entry.topics.length}件
        </span>
      </div>
    </button>
  );
}

export function MeishiPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showQr = location.state?.showQr === true;
  const justCreated = location.state?.justCreated === true;
  const meishi = loadMyMeishi();
  const [partnerMeishi, setPartnerMeishi] = useState<MeishiData | null>(loadPartnerMeishi());
  const exchangeHistory = loadExchangeHistory();
  const [isFlipped, setIsFlipped] = useState(showQr);
  const [showHistory, setShowHistory] = useState(false);

  // 相手からの名刺をポーリングで確認
  const checkForExchange = useCallback(async () => {
    if (!meishi || partnerMeishi) return;
    try {
      const res = await fetch(buildBackendUrl(`/api/exchange/${meishi.id}`));
      const data = (await res.json()) as { found: boolean; partnerMeishi?: MeishiData };
      if (data.found && data.partnerMeishi) {
        savePartnerMeishi(data.partnerMeishi);
        setPartnerMeishi(data.partnerMeishi);
      }
    } catch {
      // ポーリング失敗は無視
    }
  }, [meishi, partnerMeishi]);

  useEffect(() => {
    if (!meishi || partnerMeishi) return;
    // 初回チェック
    void checkForExchange();
    // 3秒ごとにポーリング
    const interval = setInterval(() => void checkForExchange(), 3000);
    return () => clearInterval(interval);
  }, [meishi, partnerMeishi, checkForExchange]);

  if (!meishi) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col items-center justify-center px-5">
        <div className="w-full rounded-2xl border border-[#ececea] bg-white p-6">
          <h2 className="text-center text-lg font-bold text-[#1a1a1a]">名刺データがありません</h2>
          <p className="mt-2 text-center text-sm text-[#888]">
            先に名前と出身地を入力してください。
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="rounded-xl bg-[#e85d3a] px-5 py-3.5 text-[15px] font-semibold text-white"
            >
              名刺をつくる
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

      {(justCreated || showQr) && (
        <div className="relative mx-auto max-w-[420px] px-4 pt-4">
          <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
            <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
              <p className="text-[11px] font-black tracking-[0.28em]">
                {showQr ? "SHOW YOUR CARD" : "CARD CREATED"}
              </p>
              <h1 className="mt-1 text-[27px] font-black leading-tight">
                {showQr ? "相手にQRを見せよう！" : "名刺が完成しました！"}
              </h1>
              <p className="mt-2 text-sm font-bold text-[#fff4dc]">
                {showQr
                  ? "相手にこのQRコードをスキャンしてもらおう。お互いに同じ話題で盛り上がれるよ！"
                  : "QRコードを見せて名刺を交換しよう。交換するとAIが話のタネを生成するよ！"}
              </p>
            </div>
          </section>
        </div>
      )}

      <div className="relative mx-auto max-w-[420px] mt-4 pb-8">
        <MeishiCard
          meishi={meishi}
          shareUrl={toShareUrl(meishi)}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
        />

        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="mx-auto mb-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[22px] font-medium text-[#888] transition active:scale-95"
        >
          <FlipHint />
          {isFlipped ? "← カードに戻す" : "カードをめくってQRを見せよう →"}
        </button>
        {isFlipped && (
          <p className="mb-4 text-center text-[11px] text-[#999]">
            相手のスマホの標準カメラで読み取ってもらってね
          </p>
        )}

        <div className="flex flex-col gap-3 px-5 pb-4">
          {partnerMeishi && (
            <button
              type="button"
              onClick={() => {
                const partner = partnerMeishi;
                clearPartnerMeishi();
                setPartnerMeishi(null);
                navigate("/topics", {
                  state: { myMeishi: meishi, partnerMeishi: partner },
                });
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#d94841] px-4 py-4 text-[15px] font-black text-white shadow-[0_6px_0_#8e2a24] transition active:translate-y-[2px] active:shadow-[0_3px_0_#8e2a24]"
            >
              <CompareIcon />
              {partnerMeishi.name}さんとの話のタネを見る
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearMyMeishi();
              navigate("/create");
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#e0e0dc] bg-white px-4 py-3.5 text-[14px] font-semibold text-[#e85d3a] transition active:scale-[0.98]"
          >
            <RefreshIcon />
            作り直す
          </button>
        </div>

        {exchangeHistory.length > 0 && (
          <div className="mx-5">
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
