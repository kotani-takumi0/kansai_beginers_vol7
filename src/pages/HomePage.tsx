import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import type { ExchangeHistoryEntry, MeishiData } from "../types";
import { loadExchangeHistory, loadMyMeishi } from "../utils/appStorage";
import { useState } from "react";

function formatHistoryDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MeishiCard({ meishi }: { readonly meishi: MeishiData }) {
  const shareUrl = toShareUrl(meishi);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center px-8 pb-2">
      <div
        className="w-full max-w-[340px] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped((prev) => !prev)}
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

      <p className="mt-2 text-[11px] text-[#aaa]">
        {isFlipped ? "← タップでカードに戻す" : "タップでQRを表示 →"}
      </p>
      {isFlipped && (
        <p className="mt-1 text-[11px] text-[#999]">
          相手のスマホの標準カメラで読み取ってもらってね
        </p>
      )}
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

export function HomePage() {
  const navigate = useNavigate();
  const meishi = loadMyMeishi();
  const exchangeHistory = loadExchangeHistory();

  if (!meishi) {
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

        <div className="relative mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center px-5">
          <p className="text-[10px] font-medium tracking-[0.2em] text-[#b0a08a] mb-2">JIMOTO SHOCK</p>
          <h1 className="text-2xl font-black text-[#3d2718]">じもとの名刺をつくろう</h1>
          <p className="mt-3 text-sm text-[#888] text-center">
            出身地と名前を入力して、あなただけの名刺を作ろう
          </p>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-8 rounded-2xl bg-[#d94841] px-8 py-4 text-[15px] font-black text-white shadow-[0_6px_0_#8e2a24] transition active:translate-y-[2px] active:shadow-[0_3px_0_#8e2a24]"
          >
            名刺をつくる
          </button>
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

      <div className="relative mx-auto max-w-[420px] pt-6 pb-8">
        <MeishiCard meishi={meishi} />

        {exchangeHistory.length > 0 && (
          <div className="mx-5 mt-6">
            <p className="mb-3 text-[12px] font-bold text-[#999] tracking-[0.1em]">交換履歴</p>
            <div className="space-y-3">
              {exchangeHistory.map((entry) => (
                <ExchangeHistoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
