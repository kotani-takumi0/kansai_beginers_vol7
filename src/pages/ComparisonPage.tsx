import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveExchangeHistoryEntry } from "../utils/appStorage";
import type { MeishiData, ShockReaction, Topic } from "../types";

type ReactionState = Record<string, boolean | null>;

function ShockButton({
  isSelected,
  onClick,
  children,
}: {
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[18px] border-[3px] px-4 py-3 text-center transition active:scale-95 ${
        isSelected
          ? "border-[#744b2e] bg-[#d94841] text-white shadow-[0_4px_0_#8e2a24]"
          : "border-[#d5b98b] bg-white text-[#5a402d] shadow-[0_3px_0_#ead3ac]"
      }`}
    >
      {children}
    </button>
  );
}

function ReactionCard({
  topic,
  index,
  reaction,
  onReact,
}: {
  readonly topic: Topic;
  readonly index: number;
  readonly reaction: boolean | null;
  readonly onReact: (isShocked: boolean) => void;
}) {
  return (
    <article className="rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-4 shadow-[0_6px_0_#d2b17e]">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f3dfb0] text-[11px] font-black text-[#744b2e]">
          {index + 1}
        </span>
        <span className="text-[11px] font-black text-[#8a6847]">{topic.category}</span>
      </div>

      <p className="text-[15px] font-semibold leading-relaxed text-[#1a1a1a] mb-1">
        {topic.text}
      </p>
      <p className="text-xs text-[#8a6847] mb-4">↑ 相手にとっては「普通」らしい</p>

      <div className="grid grid-cols-2 gap-2">
        <ShockButton isSelected={reaction === true} onClick={() => onReact(true)}>
          <span className="text-xl">😲</span>
          <p className="mt-1 text-sm font-black">ショック！</p>
        </ShockButton>
        <ShockButton isSelected={reaction === false} onClick={() => onReact(false)}>
          <span className="text-xl">🤔</span>
          <p className="mt-1 text-sm font-black">知ってた</p>
        </ShockButton>
      </div>
    </article>
  );
}

function ResultView({
  myMeishi,
  partnerMeishi,
  reactions,
}: {
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly reactions: ReadonlyArray<ShockReaction>;
}) {
  const navigate = useNavigate();
  const shockCount = reactions.filter((r) => r.isShocked).length;
  const knewItCount = reactions.length - shockCount;
  const shockPercent = reactions.length > 0 ? Math.round((shockCount / reactions.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] p-5 shadow-[0_8px_0_#c77b30]">
        <p className="text-xs font-black tracking-[0.22em] text-[#a54f23]">SHOCK RESULT</p>
        <h2 className="mt-2 text-center text-[28px] font-black text-[#3d2718]">
          カルチャーショック度
        </h2>
        <p className="mt-1 text-center text-[48px] font-black text-[#d94841]">{shockPercent}%</p>
        <div className="mt-3 flex justify-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2">
            <span className="text-lg">😲</span>
            <span className="text-lg font-black text-[#d94841]">{shockCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2">
            <span className="text-lg">🤔</span>
            <span className="text-lg font-black text-[#1f8f5f]">{knewItCount}</span>
          </div>
        </div>
        <p className="mt-3 text-center text-sm font-bold text-[#7c5a39]">
          {myMeishi.name ?? myMeishi.prefecture}（{myMeishi.prefecture}）×{" "}
          {partnerMeishi.name ?? partnerMeishi.prefecture}（{partnerMeishi.prefecture}）
        </p>
      </section>

      <section className="space-y-3">
        {reactions.filter((r) => r.isShocked).length > 0 && (
          <div className="rounded-[24px] border-[3px] border-[#d94841] bg-[#fff0ed] p-4">
            <p className="text-sm font-black text-[#d94841] mb-3">😲 ショックだったもの</p>
            {reactions
              .filter((r) => r.isShocked)
              .map((r) => (
                <div key={r.topic.id} className="mb-2 last:mb-0">
                  <p className="text-[15px] font-semibold text-[#1a1a1a]">{r.topic.text}</p>
                </div>
              ))}
          </div>
        )}

        {reactions.filter((r) => !r.isShocked).length > 0 && (
          <div className="rounded-[24px] border-[3px] border-[#1f8f5f] bg-[#edf7f0] p-4">
            <p className="text-sm font-black text-[#1f8f5f] mb-3">🤔 知ってたもの</p>
            {reactions
              .filter((r) => !r.isShocked)
              .map((r) => (
                <div key={r.topic.id} className="mb-2 last:mb-0">
                  <p className="text-[15px] font-semibold text-[#1a1a1a]">{r.topic.text}</p>
                </div>
              ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate("/preview")}
        className="w-full rounded-[24px] border-[3px] border-[#744b2e] bg-[#1f8f5f] px-5 py-4 text-[16px] font-black text-white shadow-[0_6px_0_#166647] transition active:translate-y-[2px] active:shadow-[0_3px_0_#166647]"
      >
        名刺に戻る
      </button>
    </div>
  );
}

export function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const myMeishi = location.state?.myMeishi as MeishiData | undefined;
  const partnerMeishi = location.state?.partnerMeishi as MeishiData | undefined;

  const partnerNormalTopics = useMemo(() => {
    if (!partnerMeishi) return [];
    return partnerMeishi.topics.filter((t) => t.isNormal).map((t) => t.topic);
  }, [partnerMeishi]);

  const [reactionState, setReactionState] = useState<ReactionState>(
    () => Object.fromEntries(partnerNormalTopics.map((t) => [t.id, null])),
  );
  const [isComplete, setIsComplete] = useState(false);

  const allAnswered = partnerNormalTopics.every((t) => reactionState[t.id] !== null);

  const reactions: ReadonlyArray<ShockReaction> = useMemo(
    () =>
      partnerNormalTopics
        .filter((t) => reactionState[t.id] !== null)
        .map((t) => ({
          topic: t,
          isShocked: reactionState[t.id] === true,
        })),
    [partnerNormalTopics, reactionState],
  );

  const handleReact = (topicId: string, isShocked: boolean) => {
    setReactionState((prev) => ({ ...prev, [topicId]: isShocked }));
  };

  const handleSubmit = () => {
    if (!myMeishi || !partnerMeishi || !allAnswered) return;

    const shockCount = reactions.filter((r) => r.isShocked).length;
    saveExchangeHistoryEntry({
      id: `${myMeishi.id}:${partnerMeishi.id}`,
      exchangedAt: new Date().toISOString(),
      myMeishi,
      partnerMeishi,
      shockCount,
      knewItCount: reactions.length - shockCount,
    });

    setIsComplete(true);
  };

  if (!myMeishi || !partnerMeishi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <p className="text-gray-600 text-lg mb-4">比較データがありません</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 min-h-[44px] bg-[#e85d3a] text-white rounded-xl font-bold"
        >
          名刺を作る
        </button>
      </div>
    );
  }

  if (partnerNormalTopics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <p className="text-gray-600 text-lg mb-4">相手の「普通」が見つかりません</p>
        <button
          onClick={() => navigate("/preview")}
          className="px-6 py-3 min-h-[44px] bg-[#e85d3a] text-white rounded-xl font-bold"
        >
          名刺に戻る
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] pb-24 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-[-110px] left-[-70px] h-60 w-60 rounded-full bg-[#ffe09a]" />
        <div className="absolute top-44 right-[-90px] h-64 w-64 rounded-full bg-[#ffd7b5]" />
        <div className="absolute bottom-20 left-[-100px] h-72 w-72 rounded-full bg-[#bde0c5]" />
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        {!isComplete ? (
          <>
            <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
              <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
                <p className="text-[11px] font-black tracking-[0.28em]">SHOCK REACTION</p>
                <h1 className="mt-1 text-[27px] font-black leading-tight">
                  {partnerMeishi.name ?? partnerMeishi.prefecture}の「普通」
                </h1>
                <p className="mt-2 text-sm font-bold text-[#fff4dc]">
                  {partnerMeishi.prefecture}出身の相手にとって、これが「普通」らしい。あなたはどう思う？
                </p>
              </div>
            </section>

            <section className="space-y-3">
              {partnerNormalTopics.map((topic, index) => (
                <ReactionCard
                  key={topic.id}
                  topic={topic}
                  index={index}
                  reaction={reactionState[topic.id]}
                  onReact={(isShocked) => handleReact(topic.id, isShocked)}
                />
              ))}
            </section>
          </>
        ) : (
          <ResultView
            myMeishi={myMeishi}
            partnerMeishi={partnerMeishi}
            reactions={reactions}
          />
        )}
      </div>

      {!isComplete && (
        <div
          className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f7edd6] via-[#f7edd6] to-transparent px-4 pt-6"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <div className="mx-auto max-w-[420px]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`w-full rounded-[24px] border-[3px] px-5 py-4 text-[16px] font-black transition ${
                allAnswered
                  ? "border-[#744b2e] bg-[#d94841] text-white shadow-[0_6px_0_#8e2a24] active:translate-y-[2px] active:shadow-[0_3px_0_#8e2a24]"
                  : "border-[#b8a282] bg-[#e7dcc8] text-[#9f8d76]"
              }`}
            >
              {allAnswered
                ? "ショック度を見る！"
                : `あと${partnerNormalTopics.length - reactions.length}個にリアクションしてね`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
