import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ExchangeHistoryEntry, MeishiData } from "../types";
import {
  loadExchangeHistory,
  loadSelectedPrefecture,
  loadSelectedTopics,
  loadPartnerMeishi,
  clearPartnerMeishi,
  saveMyMeishi,
  loadMyMeishi,
  clearMyMeishi,
} from "../utils/appStorage";

function createMeishiId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `meishi-${Date.now()}`;
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
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
  isFlipped,
  onFlip,
}: {
  readonly meishi: MeishiData;
  readonly isFlipped: boolean;
  readonly onFlip: () => void;
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
              TOPICS
            </span>

            <div className="absolute top-8 right-5 left-5 bottom-3 flex flex-col justify-center gap-1.5 overflow-hidden">
              {meishi.topics.map(({ topic, agrees }, index) => (
                <div key={topic.id} className="flex items-center gap-2">
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/60">
                    {index + 1}
                  </span>
                  <p className="flex-1 truncate text-[12px] leading-tight text-white/85">
                    {topic.text}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      agrees
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-orange-400/20 text-orange-300"
                    }`}
                  >
                    {agrees ? "わかる" : "違う"}
                  </span>
                </div>
              ))}
            </div>
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

  const meishi = useMemo<MeishiData | null>(() => {
    if (prefecture && topics.length > 0) {
      return {
        id: createMeishiId(),
        name: savedMeishi?.name,
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
    <div className="mx-auto max-w-[420px] pb-8">
      <div className="relative flex items-center justify-center px-6 pt-5 pb-1">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">じもと名刺</span>
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[#888]">
        {meishi.prefecture}
      </p>

      <MeishiCard
        meishi={meishi}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((prev) => !prev)}
      />

      <button
        type="button"
        onClick={() => setIsFlipped((prev) => !prev)}
        className="mx-auto mb-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#888] transition active:scale-95"
      >
        <FlipHint />
        タップしてカードを{isFlipped ? "表に" : "裏返す"}
      </button>

      <div className="flex flex-col gap-3 px-5 pb-4">
        {partnerMeishi ? (
          <button
            type="button"
            onClick={() => {
              clearPartnerMeishi();
              navigate("/comparison", {
                state: { myMeishi: meishi, partnerMeishi },
              });
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white"
          >
            <CompareIcon />
            名刺を比較
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/share", { state: { meishi } })}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
          >
            <ShareIcon />
            URLで共有する
          </button>
        )}
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
  );
}
