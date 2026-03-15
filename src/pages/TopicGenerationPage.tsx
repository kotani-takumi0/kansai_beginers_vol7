import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Topic, TopicWithStance } from "../types";
import { loadSelectedPrefecture, saveSelectedTopics } from "../utils/appStorage";
import { getTopics } from "../utils/topicGenerator";

type Stance = boolean | null;

const STANCE_COPY = {
  normal: {
    label: "普通でしょ？",
    description: "当たり前すぎて疑問にも思わない",
  },
  notNormal: {
    label: "普通じゃない",
    description: "自分の県でもそれはない",
  },
} as const;

export function TopicGenerationPage() {
  const navigate = useNavigate();
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [topics, setTopics] = useState<ReadonlyArray<Topic>>([]);
  const [stances, setStances] = useState<Record<string, Stance>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedPrefecture = loadSelectedPrefecture();

    if (!savedPrefecture) {
      navigate("/");
      return;
    }

    setPrefecture(savedPrefecture);

    try {
      const prefectureTopics = getTopics(savedPrefecture);
      setTopics(prefectureTopics);
      setStances(
        Object.fromEntries(prefectureTopics.map((topic) => [topic.id, null])),
      );
    } catch {
      setErrorMessage("この都道府県のトピックが見つかりません。");
    }
  }, [navigate]);

  const completedCount = useMemo(
    () => topics.filter((topic) => stances[topic.id] !== null).length,
    [topics, stances],
  );

  const canProceed = topics.length > 0 && completedCount === topics.length;

  const handleSelectStance = (topicId: string, isNormal: boolean) => {
    setStances((current) => ({
      ...current,
      [topicId]: isNormal,
    }));
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    const selectedTopics: ReadonlyArray<TopicWithStance> = topics.map((topic) => ({
      topic,
      isNormal: stances[topic.id] === true,
    }));

    saveSelectedTopics(selectedTopics);
    navigate("/preview");
  };

  if (!prefecture) {
    return null;
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
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">JIMOTO CHECK</p>
            <span className="mt-1 block text-[17px] font-semibold">じもと診断</span>
            <h1 className="mt-1 text-[27px] font-black leading-tight">{prefecture}のあるある</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              これ、あなたにとっては「普通」ですか？
            </p>
          </div>
        </section>

        <div className="flex items-center justify-between rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] px-4 py-3 shadow-[0_8px_0_#d2b17e]">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">回答状況</p>
            <p className="text-sm font-black text-[#3d2718]">
              {completedCount} / {topics.length} 問
            </p>
          </div>
          <div className="flex gap-1">
            {topics.map((topic) => (
              <span
                key={topic.id}
                className={`inline-block h-3 w-3 rounded-full border-2 ${
                  stances[topic.id] === null
                    ? "border-[#d5b98b] bg-white"
                    : stances[topic.id]
                      ? "border-[#1f8f5f] bg-[#1f8f5f]"
                      : "border-[#e85d3a] bg-[#e85d3a]"
                }`}
              />
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-[24px] border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-black">エラー</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        )}

        <section className="space-y-3">
          {topics.map((topic, index) => {
            const selectedStance = stances[topic.id];

            return (
              <article
                key={topic.id}
                className="rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-4 shadow-[0_6px_0_#d2b17e]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f3dfb0] text-[11px] font-black text-[#744b2e]">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-black text-[#8a6847]">
                      {topic.category}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      selectedStance === null
                        ? "bg-[#f0f0ee] text-[#aaa]"
                        : selectedStance
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {selectedStance === null ? "未回答" : selectedStance ? "普通" : "普通じゃない"}
                  </span>
                </div>

                <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#1a1a1a]">
                  {topic.text}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, true)}
                    className={`rounded-[18px] border-2 px-3 py-3 text-left transition ${
                      selectedStance === true
                        ? "border-emerald-600 bg-emerald-500 text-white"
                        : "border-[#d5b98b] bg-[#fff7e6] text-[#555]"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.normal.label}</p>
                    <p className={`mt-0.5 text-[11px] ${selectedStance === true ? "text-white/80" : "text-[#888]"}`}>
                      {STANCE_COPY.normal.description}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, false)}
                    className={`rounded-[18px] border-2 px-3 py-3 text-left transition ${
                      selectedStance === false
                        ? "border-[#b53c19] bg-[#e85d3a] text-white"
                        : "border-[#d5b98b] bg-[#fff7e6] text-[#555]"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.notNormal.label}</p>
                    <p className={`mt-0.5 text-[11px] ${selectedStance === false ? "text-white/80" : "text-[#888]"}`}>
                      {STANCE_COPY.notNormal.description}
                    </p>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      <div
        className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f7edd6] via-[#f7edd6] to-transparent px-4 pt-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <div className="mx-auto max-w-[420px]">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full rounded-[24px] border-[3px] px-5 py-4 text-[16px] font-black transition ${
              canProceed
                ? "border-[#744b2e] bg-[#1f8f5f] text-white shadow-[0_6px_0_#166647] active:translate-y-[2px] active:shadow-[0_3px_0_#166647]"
                : "border-[#b8a282] bg-[#e7dcc8] text-[#9f8d76]"
            }`}
          >
            {canProceed ? "この内容で名刺をつくる" : "全ての質問に答えてください"}
          </button>
        </div>
      </div>
    </div>
  );
}
