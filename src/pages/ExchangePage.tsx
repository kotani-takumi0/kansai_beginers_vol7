import { useEffect, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBumpDetection } from "../hooks/useBumpDetection";
import { useExchangeSocket } from "../hooks/useExchangeSocket";
import { loadMyMeishi, savePartnerMeishi } from "../utils/appStorage";
import { ExchangeAnimation } from "../components/ExchangeAnimation";
import type { MeishiData } from "../types";

type ExchangePhase =
  | "permission"    // DeviceMotion許可取得前
  | "waiting"       // ぶつけ待機中
  | "bumped"        // bump検知→マッチング待ち
  | "matched"       // マッチング成功→演出中
  | "timeout"       // マッチング失敗
  | "fallback";     // DeviceMotion非対応 or 許可denied

const BUMP_THRESHOLD = 15;
const BUMP_DEBOUNCE_MS = 500;

function PulseRing() {
  return (
    <div className="relative flex items-center justify-center">
      {/* パルス波紋アニメーション */}
      <div className="absolute h-40 w-40 animate-ping rounded-full bg-[#e85d3a]/10" />
      <div
        className="absolute h-32 w-32 animate-ping rounded-full bg-[#e85d3a]/15"
        style={{ animationDelay: "0.5s" }}
      />
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#e85d3a] to-[#ff8a65] shadow-lg">
        <span className="text-4xl">📱</span>
      </div>
    </div>
  );
}

function MiniCard({ meishi }: { readonly meishi: MeishiData }) {
  return (
    <div className="mx-auto w-48 rounded-xl bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] p-3 shadow-md">
      <p className="text-[9px] tracking-[0.15em] text-white/50">JIMOTO MEISHI</p>
      {meishi.name && (
        <p className="mt-0.5 text-xs font-medium text-white/70">{meishi.name}</p>
      )}
      <p className="mt-0.5 text-sm font-bold text-white">{meishi.prefecture}</p>
      <div className="mt-1 flex gap-0.5">
        {meishi.topics.map(({ isNormal }, i) => (
          <span
            key={i}
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isNormal ? "bg-emerald-400/60" : "bg-orange-400/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PermissionView({
  onRequest,
}: {
  readonly onRequest: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">🎯</div>
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a]">
          名刺交換の準備をしよう！
        </h2>
        <p className="mt-2 text-sm text-[#888]">
          スマホの動きを検知して、ぶつけた相手と名刺交換できます
        </p>
      </div>
      <button
        type="button"
        onClick={onRequest}
        className="rounded-2xl bg-[#e85d3a] px-8 py-4 text-base font-bold text-white shadow-lg transition active:scale-95"
      >
        センサーをONにする
      </button>
    </div>
  );
}

function WaitingView({ meishi }: { readonly meishi: MeishiData }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <MiniCard meishi={meishi} />
      <PulseRing />
      <div>
        <h2 className="text-lg font-bold text-[#e85d3a]">
          ぶつけて名刺交換！
        </h2>
        <p className="mt-2 text-sm text-[#888]">
          相手のスマホと軽くぶつけてください
        </p>
      </div>
    </div>
  );
}

function BumpedView() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-[#e85d3a] to-[#ff8a65]">
        <span className="text-3xl">✨</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#e85d3a]">つながっています...</h2>
        <p className="mt-2 text-sm text-[#888]">
          相手を探しています
        </p>
      </div>
    </div>
  );
}

function TimeoutView({
  onRetry,
}: {
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">😅</div>
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a]">
          あれ、すれ違っちゃった？
        </h2>
        <p className="mt-2 text-sm text-[#888]">
          相手と同時にぶつけてみてください
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-2xl bg-[#e85d3a] px-8 py-4 text-base font-bold text-white shadow-lg transition active:scale-95"
      >
        もう一度ぶつける
      </button>
    </div>
  );
}

function FallbackView() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">📲</div>
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a]">
          ぶつけ交換が使えません
        </h2>
        <p className="mt-2 text-sm text-[#888]">
          この端末では動きセンサーが利用できないため、
          <br />
          URLで名刺を交換しましょう
        </p>
      </div>
    </div>
  );
}

function NoMeishiView({
  onNavigate,
}: {
  readonly onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-5xl">🃏</div>
      <h2 className="text-lg font-bold text-[#1a1a1a]">名刺がまだありません</h2>
      <p className="text-sm text-[#888]">
        先に名刺をつくってから交換しましょう
      </p>
      <button
        type="button"
        onClick={onNavigate}
        className="rounded-2xl bg-[#e85d3a] px-8 py-4 text-base font-bold text-white shadow-lg transition active:scale-95"
      >
        名刺をつくる
      </button>
    </div>
  );
}

export function ExchangePage() {
  const navigate = useNavigate();
  const myMeishi = loadMyMeishi();
  const [phase, setPhase] = useState<ExchangePhase>("permission");
  const hasNavigatedRef = useRef(false);

  // ── 名刺がない場合は早期リターン（フックの前には置けないのでダミーで呼ぶ） ──
  const dummyMeishi: MeishiData = myMeishi ?? {
    id: "",
    name: "",
    prefecture: "",
    topics: [],
    createdAt: "",
  };

  const handleBump = useCallback(() => {
    setPhase("bumped");
  }, []);

  const bump = useBumpDetection({
    threshold: BUMP_THRESHOLD,
    debounceMs: BUMP_DEBOUNCE_MS,
    onBump: handleBump,
  });

  const socket = useExchangeSocket(dummyMeishi);

  // bump検知時にsendBumpを呼ぶ
  useEffect(() => {
    if (phase === "bumped") {
      socket.sendBump();
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // timeout イベント受信
  useEffect(() => {
    if (phase === "bumped" && !socket.isWaiting && !socket.isMatched) {
      // socketがwaitingでもmatchedでもない → timeout
      const timer = setTimeout(() => {
        setPhase("timeout");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase, socket.isWaiting, socket.isMatched]);

  // マッチング成功 → 演出フェーズへ
  useEffect(() => {
    if (socket.isMatched && socket.partnerMeishi && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      savePartnerMeishi(socket.partnerMeishi);
    }
  }, [socket.isMatched, socket.partnerMeishi]);

  const handleAnimationComplete = useCallback(() => {
    if (myMeishi && socket.partnerMeishi) {
      navigate("/comparison", {
        state: {
          myMeishi: myMeishi,
          partnerMeishi: socket.partnerMeishi,
        },
      });
    }
  }, [myMeishi, socket.partnerMeishi, navigate]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      socket.leaveRoom();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestPermission = async () => {
    const granted = await bump.requestPermission();
    if (granted) {
      bump.startListening();
      socket.joinRoom();
      setPhase("waiting");
    } else {
      setPhase("fallback");
    }
  };

  const handleRetry = () => {
    socket.joinRoom();
    setPhase("waiting");
  };

  const handleGoToShare = () => {
    navigate("/share", { state: { meishi: myMeishi } });
  };

  const currentPhase: ExchangePhase =
    !bump.isSupported || bump.permissionState === "denied"
      ? "fallback"
      : socket.isMatched && socket.partnerMeishi
        ? "matched"
        : phase;

  // ── 名刺なし ──
  if (!myMeishi) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center px-5">
        <NoMeishiView onNavigate={() => navigate("/")} />
      </div>
    );
  }

  // ── 演出中（フルスクリーン） ──
  if (currentPhase === "matched" && socket.partnerMeishi) {
    return (
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={socket.partnerMeishi}
        onComplete={handleAnimationComplete}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center px-5">
      {/* ── メイン表示エリア ── */}
      <div className="w-full rounded-2xl border border-[#ececea] bg-white p-6 shadow-sm">
        {currentPhase === "permission" && (
          <PermissionView onRequest={handleRequestPermission} />
        )}
        {currentPhase === "waiting" && <WaitingView meishi={myMeishi} />}
        {currentPhase === "bumped" && <BumpedView />}
        {currentPhase === "timeout" && <TimeoutView onRetry={handleRetry} />}
        {currentPhase === "fallback" && <FallbackView />}
      </div>

      {/* ── フッターリンク ── */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleGoToShare}
          className="text-sm font-medium text-[#e85d3a] underline underline-offset-2 transition active:opacity-70"
        >
          URLで交換する
        </button>
        <button
          type="button"
          onClick={() => navigate("/preview")}
          className="text-xs text-[#888] transition active:opacity-70"
        >
          名刺に戻る
        </button>
      </div>
    </div>
  );
}
