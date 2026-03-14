import { useMemo, useEffect } from "react";
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

function formatHistoryDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  const meishi = useMemo<MeishiData | null>(() => {
    if (prefecture && topics.length > 0) {
      return {
        id: createMeishiId(),
        prefecture,
        topics,
        createdAt: new Date().toISOString(),
      };
    }

    return loadMyMeishi();
  }, [prefecture, topics]);

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
      {/* ── Header ── */}
      <div className="relative flex items-center justify-center px-6 pt-5 pb-1">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">じもと名刺</span>
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[#888]">
        {meishi.prefecture}
      </p>

      {/* ── Card Visual ── */}
      <div className="flex justify-center px-8 pb-6">
        <div className="relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] shadow-[0_8px_32px_rgba(0,0,0,.18)]"
          style={{ aspectRatio: "1.586 / 1" }}
        >
          {/* JIMOTO MEISHI label */}
          <span className="absolute top-4 left-5 text-[10px] font-semibold tracking-[0.2em] text-white/50">
            JIMOTO MEISHI
          </span>

          {/* Prefecture */}
          <h2 className="absolute top-10 left-5 text-2xl font-bold tracking-tight text-white">
            {meishi.prefecture}
          </h2>

          {/* Topic count */}
          <div className="absolute top-4 right-5 text-right">
            <p className="text-[9px] tracking-[0.15em] text-white/40">TOPICS</p>
            <p className="text-xl font-bold text-white/80">{meishi.topics.length}</p>
          </div>

          {/* Decorative accent */}
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
      </div>

      {/* ── Action Buttons ── */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        {partnerMeishi ? (
          <button
            type="button"
            onClick={() => {
              clearPartnerMeishi();
              navigate("/comparison", {
                state: { myMeishi: meishi, partnerMeishi },
              });
            }}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-5 text-[15px] font-semibold text-white"
          >
            <CompareIcon />
            名刺を比較
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/share", { state: { meishi } })}
            className="flex flex-col items-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-5 text-[15px] font-semibold text-white"
          >
            <ShareIcon />
            この名刺を共有する
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            clearMyMeishi();
            navigate("/");
          }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#e0e0dc] bg-white px-4 py-5 text-[15px] font-semibold text-[#e85d3a]"
        >
          <RefreshIcon />
          作り直す
        </button>
      </div>

      {/* ── Topics Section ── */}
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
        <div className="mx-5 mt-4 rounded-2xl border border-[#ececea] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#1a1a1a]">交換履歴</h3>
            <span className="text-xs font-medium text-[#888]">{exchangeHistory.length}件</span>
          </div>
          <div className="mt-4 space-y-3">
            {exchangeHistory.map((entry) => (
              <ExchangeHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
