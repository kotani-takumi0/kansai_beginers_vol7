import { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { compareMeishi } from "../utils/comparison";
import { calculateRarity, getRarityInfo } from "../utils/rarity";
import type { Rarity } from "../utils/rarity";
import type { MeishiData } from "../types";

type Phase = "idle" | "pulling" | "building" | "reveal" | "done";

/** レアリティに応じたパーティクル数 */
const PARTICLE_COUNTS: Record<Rarity, number> = {
  N: 6,
  R: 10,
  SR: 16,
  SSR: 24,
  UR: 32,
};

/** レバーを引く前の待機時間(ms) */
const BUILD_DURATION: Record<Rarity, number> = {
  N: 800,
  R: 1200,
  SR: 1800,
  SSR: 2400,
  UR: 3000,
};

function Particles({
  count,
  color,
  glowColor,
}: {
  readonly count: number;
  readonly color: string;
  readonly glowColor: string;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (360 / count) * i + Math.random() * 20,
        distance: 80 + Math.random() * 120,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.3,
      })),
    [count],
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 2}px ${glowColor}`,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

function RarityBadge({
  rarity,
  info,
}: {
  readonly rarity: Rarity;
  readonly info: ReturnType<typeof getRarityInfo>;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <motion.div
        className="rounded-2xl px-6 py-3 text-center"
        style={{
          backgroundColor: info.bgColor,
          boxShadow: `0 0 40px ${info.glowColor}, 0 0 80px ${info.glowColor}`,
        }}
        animate={{
          boxShadow: [
            `0 0 40px ${info.glowColor}, 0 0 80px ${info.glowColor}`,
            `0 0 60px ${info.glowColor}, 0 0 120px ${info.glowColor}`,
            `0 0 40px ${info.glowColor}, 0 0 80px ${info.glowColor}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-xs font-bold tracking-widest" style={{ color: info.color }}>
          {info.label}
        </p>
        <p className="text-4xl font-black tracking-wider" style={{ color: info.color }}>
          {rarity}
        </p>
      </motion.div>
    </motion.div>
  );
}

function MeishiResultCard({
  meishi,
  rarityInfo,
}: {
  readonly meishi: MeishiData;
  readonly rarityInfo: ReturnType<typeof getRarityInfo>;
}) {
  return (
    <motion.div
      className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl shadow-2xl"
      style={{
        boxShadow: `0 8px 32px rgba(0,0,0,0.18), 0 0 20px ${rarityInfo.glowColor}`,
      }}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
    >
      <div
        className="relative bg-gradient-to-br from-[#2d2d3a] via-[#3a3a4a] to-[#2d2d3a] p-5"
        style={{ aspectRatio: "1.586 / 1" }}
      >
        {/* レアリティバッジ */}
        <span
          className="absolute top-3 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-black"
          style={{
            backgroundColor: rarityInfo.bgColor,
            color: rarityInfo.color,
          }}
        >
          {rarityInfo.rarity}
        </span>

        <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50">
          JIMOTO MEISHI
        </span>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
          {meishi.prefecture}
        </h2>

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
    </motion.div>
  );
}

function BuildUpOverlay({ rarity }: { readonly rarity: Rarity }) {
  const intensityMap: Record<Rarity, { shakeAmount: number; flashCount: number }> = {
    N: { shakeAmount: 1, flashCount: 1 },
    R: { shakeAmount: 2, flashCount: 2 },
    SR: { shakeAmount: 3, flashCount: 3 },
    SSR: { shakeAmount: 5, flashCount: 4 },
    UR: { shakeAmount: 8, flashCount: 6 },
  };

  const { shakeAmount, flashCount } = intensityMap[rarity];

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      animate={{
        x: Array.from({ length: flashCount * 4 }, () =>
          (Math.random() - 0.5) * shakeAmount * 2,
        ),
      }}
      transition={{ duration: BUILD_DURATION[rarity] / 1000, ease: "linear" }}
    >
      {/* 中心の光 */}
      <motion.div
        className="h-32 w-32 rounded-full"
        style={{
          background: `radial-gradient(circle, white 0%, transparent 70%)`,
        }}
        initial={{ scale: 0.2, opacity: 0.3 }}
        animate={{ scale: [0.2, 2, 0.5, 3], opacity: [0.3, 0.8, 0.4, 1] }}
        transition={{ duration: BUILD_DURATION[rarity] / 1000, ease: "easeIn" }}
      />
    </motion.div>
  );
}

export function GachaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const myMeishi = location.state?.myMeishi as MeishiData | undefined;
  const partnerMeishi = location.state?.partnerMeishi as MeishiData | undefined;

  const [phase, setPhase] = useState<Phase>("idle");

  const result = useMemo(() => {
    if (!myMeishi || !partnerMeishi) return null;
    return compareMeishi(myMeishi, partnerMeishi);
  }, [myMeishi, partnerMeishi]);

  const rarity = useMemo(() => (result ? calculateRarity(result) : "N" as Rarity), [result]);
  const rarityInfo = useMemo(() => getRarityInfo(rarity), [rarity]);

  const handlePull = useCallback(() => {
    if (phase !== "idle") return;

    setPhase("pulling");

    // レバーアニメーション後にビルドアップ
    setTimeout(() => {
      setPhase("building");

      // ビルドアップ後にリビール
      setTimeout(() => {
        setPhase("reveal");

        // リビール後にdone
        setTimeout(() => {
          setPhase("done");
        }, 1500);
      }, BUILD_DURATION[rarity]);
    }, 600);
  }, [phase, rarity]);

  const handleContinue = useCallback(() => {
    if (!myMeishi || !partnerMeishi) return;
    navigate("/comparison", {
      state: { myMeishi, partnerMeishi },
    });
  }, [navigate, myMeishi, partnerMeishi]);

  if (!result || !myMeishi || !partnerMeishi) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
        <p className="mb-4 text-lg text-gray-600">データがありません</p>
        <button
          onClick={() => navigate("/")}
          className="min-h-[44px] rounded-xl bg-[#e85d3a] px-6 py-3 font-bold text-white"
        >
          名刺を作る
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-[420px] flex-col items-center justify-center overflow-hidden px-4">
      {/* 背景グラデーション */}
      <AnimatePresence>
        {(phase === "building" || phase === "reveal" || phase === "done") && (
          <motion.div
            className="fixed inset-0 z-30"
            style={{
              background:
                rarity === "UR"
                  ? "radial-gradient(circle at center, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.9) 100%)"
                  : rarity === "SSR"
                    ? "radial-gradient(circle at center, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0.85) 100%)"
                    : "radial-gradient(circle at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ビルドアップオーバーレイ */}
      <AnimatePresence>
        {phase === "building" && <BuildUpOverlay rarity={rarity} />}
      </AnimatePresence>

      {/* メインコンテンツ */}
      <div className="relative z-50 flex flex-col items-center gap-6">
        {/* ガチャマシン - idle & pulling */}
        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "pulling") && (
            <motion.div
              key="gacha-machine"
              className="flex flex-col items-center gap-8"
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1
                className="text-xl font-bold text-[#1a1a1a]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                名刺ガチャ
              </motion.h1>

              <motion.p
                className="text-sm text-[#888]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                レバーを引いて相手の名刺を引こう！
              </motion.p>

              {/* ガチャマシン本体 */}
              <div className="relative flex flex-col items-center">
                {/* カプセル部分 */}
                <motion.div
                  className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-[#e0e0dc] bg-gradient-to-b from-white to-[#f0f0ee]"
                  animate={
                    phase === "pulling"
                      ? { rotate: [0, -5, 5, -3, 3, 0], scale: [1, 0.95, 1.05, 1] }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-6xl">🎰</span>
                </motion.div>

                {/* レバー */}
                <motion.div
                  className="relative -mt-2 flex flex-col items-center"
                  animate={phase === "pulling" ? { y: [0, 20, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="h-8 w-2 rounded-full bg-[#ccc]" />
                  <div className="h-6 w-6 rounded-full bg-[#e85d3a] shadow-lg" />
                </motion.div>
              </div>

              {/* 引くボタン */}
              {phase === "idle" && (
                <motion.button
                  type="button"
                  onClick={handlePull}
                  className="rounded-2xl bg-[#e85d3a] px-10 py-4 text-lg font-bold text-white shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  ガチャを引く！
                </motion.button>
              )}
            </motion.div>
          )}

          {/* リビール & 結果 */}
          {(phase === "reveal" || phase === "done") && (
            <motion.div
              key="result"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* パーティクル */}
              <div className="pointer-events-none absolute inset-0">
                <div className="relative h-full w-full">
                  <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                    <Particles
                      count={PARTICLE_COUNTS[rarity]}
                      color={rarityInfo.color}
                      glowColor={rarityInfo.glowColor}
                    />
                  </div>
                </div>
              </div>

              {/* レアリティ表示 */}
              <RarityBadge rarity={rarity} info={rarityInfo} />

              {/* 説明テキスト */}
              <motion.p
                className="text-center text-sm font-bold"
                style={{ color: rarityInfo.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {rarityInfo.description}
              </motion.p>

              {/* 名刺カード */}
              <MeishiResultCard meishi={partnerMeishi} rarityInfo={rarityInfo} />

              {/* 一致数 */}
              <motion.div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{ backgroundColor: rarityInfo.bgColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="text-sm font-bold" style={{ color: rarityInfo.color }}>
                  {result.matchCount}/{result.matches.length} 一致
                </span>
                {myMeishi.prefecture === partnerMeishi.prefecture && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
                    同県ボーナス！
                  </span>
                )}
              </motion.div>

              {/* 続行ボタン */}
              {phase === "done" && (
                <motion.button
                  type="button"
                  onClick={handleContinue}
                  className="mt-2 rounded-2xl bg-[#e85d3a] px-8 py-4 text-[15px] font-bold text-white shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  くわしく見る
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
