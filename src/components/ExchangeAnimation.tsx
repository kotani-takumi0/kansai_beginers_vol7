import { useState, useEffect, useRef } from "react";
import type { MeishiData } from "../types";

type AnimationStage = "impact" | "connecting" | "arrival";

const IMPACT_DURATION_MS = 500;
const CONNECTING_DURATION_MS = 2000;
const ARRIVAL_DURATION_MS = 1500;

interface ExchangeAnimationProps {
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly onComplete: () => void;
}

function triggerHaptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([100, 50, 100]);
  }
}

function ImpactStage() {
  return (
    <div
      data-stage="impact"
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* 画面フラッシュ */}
      <div className="animate-flash fixed inset-0 z-50 bg-white/90 pointer-events-none" />
      <div className="text-6xl animate-bounce">💥</div>
    </div>
  );
}

function ConnectingStage() {
  return (
    <div
      data-stage="connecting"
      className="flex flex-col items-center justify-center gap-6"
    >
      {/* ドキドキパルス */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-28 w-28 animate-ping rounded-full bg-[#e85d3a]/20" />
        <div
          className="absolute h-20 w-20 animate-ping rounded-full bg-[#e85d3a]/30"
          style={{ animationDelay: "0.3s" }}
        />
        <div className="flex h-16 w-16 animate-heartbeat items-center justify-center rounded-full bg-gradient-to-br from-[#e85d3a] to-[#ff8a65] shadow-xl">
          <span className="text-2xl">💌</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[#e85d3a] animate-pulse">
          つながっています...
        </p>
        <p className="mt-1 text-sm text-[#888]">名刺を届けています</p>
      </div>
    </div>
  );
}

function ArrivalStage({
  partnerMeishi,
}: {
  readonly partnerMeishi: MeishiData;
}) {
  return (
    <div
      data-stage="arrival"
      className="flex flex-col items-center justify-center gap-6"
    >
      {/* 相手の名刺カードが飛んでくるアニメーション */}
      <div className="animate-card-arrive">
        <div className="w-56 rounded-xl bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] p-4 shadow-2xl">
          <p className="text-[9px] tracking-[0.15em] text-white/50">
            JIMOTO MEISHI
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {partnerMeishi.prefecture}
          </p>
          <div className="mt-2 flex gap-1">
            {partnerMeishi.topics.map(({ agrees }, i) => (
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
      <div className="text-center">
        <p className="text-lg font-bold text-[#1a1a1a]">名刺が届きました！</p>
        <p className="mt-1 text-sm text-[#888]">
          {partnerMeishi.prefecture}の名刺です
        </p>
      </div>
    </div>
  );
}

export function ExchangeAnimation({
  myMeishi: _myMeishi,
  partnerMeishi,
  onComplete,
}: ExchangeAnimationProps) {
  const [stage, setStage] = useState<AnimationStage>("impact");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // インパクト時にバイブ
  useEffect(() => {
    triggerHaptic();
  }, []);

  // ステージ遷移タイマー
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // impact → connecting
    timers.push(
      setTimeout(() => {
        setStage("connecting");
      }, IMPACT_DURATION_MS)
    );

    // connecting → arrival
    timers.push(
      setTimeout(() => {
        setStage("arrival");
      }, IMPACT_DURATION_MS + CONNECTING_DURATION_MS)
    );

    // arrival → onComplete
    timers.push(
      setTimeout(() => {
        onCompleteRef.current();
      }, IMPACT_DURATION_MS + CONNECTING_DURATION_MS + ARRIVAL_DURATION_MS)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#faf9f7]">
      <div className="w-full max-w-[420px] px-5">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {stage === "impact" && <ImpactStage />}
          {stage === "connecting" && <ConnectingStage />}
          {stage === "arrival" && <ArrivalStage partnerMeishi={partnerMeishi} />}
        </div>
      </div>
    </div>
  );
}
