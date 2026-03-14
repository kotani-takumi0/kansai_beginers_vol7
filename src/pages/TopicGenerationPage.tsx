import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Topic, TopicWithStance } from "../types";
import { loadSelectedPrefecture, saveSelectedTopics } from "../utils/appStorage";
import { generateTopics } from "../utils/topicGenerator";

type Stance = boolean | null;

const STANCE_COPY = {
  agree: {
    label: "それ、わかる",
    description: "自分もそう思う",
  },
  disagree: {
    label: "それは違う",
    description: "自分はそう思わない",
  },
} as const;

export function TopicGenerationPage() {
  const navigate = useNavigate();
  const [prefecture, setPrefecture] = useState<string | null>(null);
  const [topics, setTopics] = useState<ReadonlyArray<Topic>>([]);
  const [stances, setStances] = useState<Record<string, Stance>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedPrefecture = loadSelectedPrefecture();

    if (!savedPrefecture) {
      navigate("/");
      return;
    }

    setPrefecture(savedPrefecture);
  }, [navigate]);

  useEffect(() => {
    if (!prefecture) {
      return;
    }

    const currentPrefecture = prefecture;
    let isCancelled = false;

    async function runGeneration() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await generateTopics(currentPrefecture);

        if (isCancelled) {
          return;
        }

        setTopics(response.topics);
        setStances(
          Object.fromEntries(response.topics.map((topic) => [topic.id, null])),
        );
      } catch {
        if (!isCancelled) {
          setErrorMessage("ネタの生成に失敗しました。もう一度試してください。");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void runGeneration();

    return () => {
      isCancelled = true;
    };
  }, [prefecture]);

  const completedCount = useMemo(
    () => topics.filter((topic) => stances[topic.id] !== null).length,
    [topics, stances],
  );

  const canProceed = topics.length > 0 && completedCount === topics.length;

  const handleRegenerate = async () => {
    if (!prefecture) {
      return;
    }

    const currentPrefecture = prefecture;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await generateTopics(currentPrefecture);
      setTopics(response.topics);
      setStances(Object.fromEntries(response.topics.map((topic) => [topic.id, null])));
    } catch {
      setErrorMessage("ネタの再生成に失敗しました。時間をおいて試してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStance = (topicId: string, agrees: boolean) => {
    setStances((current) => ({
      ...current,
      [topicId]: agrees,
    }));
  };

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    const selectedTopics: ReadonlyArray<TopicWithStance> = topics.map((topic) => ({
      topic,
      agrees: stances[topic.id] === true,
    }));

    saveSelectedTopics(selectedTopics);
    navigate("/preview");
  };

  if (!prefecture) {
    return null;
  }

  return (
    <div className="mx-auto flex h-full max-w-[420px] flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-5 pb-1 text-center">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">ネタ選択</span>
      </div>
      <p className="mb-4 text-center text-sm font-medium text-[#888]">{prefecture}</p>

      {/* Progress & Regenerate */}
      <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl border border-[#ececea] bg-white px-4 py-3">
        <div>
          <p className="text-xs text-[#888]">選択状況</p>
          <p className="text-sm font-semibold text-[#1a1a1a]">
            {completedCount} / {topics.length || 5} 個
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleRegenerate()}
          disabled={isLoading}
          className="min-h-[44px] rounded-xl border border-[#e0e0dc] px-4 py-2.5 text-sm font-semibold text-[#e85d3a] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          別のネタにする
        </button>
      </div>

      {/* Topics */}
      <section className="flex-1 space-y-3 overflow-y-auto px-5 scrollbar-hide">
        {isLoading && (
          <div className="rounded-2xl border border-[#ececea] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#e85d3a]/30" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">ネタを生成中です</p>
                <p className="text-xs text-[#888]">{prefecture}らしい論点をまとめています…</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-[#f0f0ee]" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">生成できませんでした</p>
            <p className="mt-1">{errorMessage}</p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          topics.map((topic, index) => {
            const selectedStance = stances[topic.id];

            return (
              <article
                key={topic.id}
                className="rounded-2xl border border-[#ececea] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f0f0ee] text-[11px] font-bold text-[#888]">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-[#888]">
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
                    {selectedStance === null ? "未選択" : selectedStance ? "わかる" : "違う"}
                  </span>
                </div>

                <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#1a1a1a]">
                  {topic.text}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, true)}
                    className={`rounded-xl px-3 py-3 text-left transition ${
                      selectedStance === true
                        ? "bg-emerald-500 text-white"
                        : "border border-[#e0e0dc] bg-[#f8f8f6] text-[#555]"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.agree.label}</p>
                    <p className={`mt-0.5 text-[11px] ${selectedStance === true ? "text-white/80" : "text-[#888]"}`}>
                      {STANCE_COPY.agree.description}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, false)}
                    className={`rounded-xl px-3 py-3 text-left transition ${
                      selectedStance === false
                        ? "bg-[#e85d3a] text-white"
                        : "border border-[#e0e0dc] bg-[#f8f8f6] text-[#555]"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.disagree.label}</p>
                    <p className={`mt-0.5 text-[11px] ${selectedStance === false ? "text-white/80" : "text-[#888]"}`}>
                      {STANCE_COPY.disagree.description}
                    </p>
                  </button>
                </div>
              </article>
            );
          })}
      </section>

      {/* Floating action */}
      <div
        className="fixed right-0 bottom-0 left-0 bg-gradient-to-t from-[#f8f8f6] via-[#f8f8f6] to-transparent p-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        <div className="mx-auto max-w-[420px]">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex w-full items-center justify-center rounded-2xl py-4 text-[15px] font-semibold shadow-lg transition ${
              canProceed
                ? "bg-[#e85d3a] text-white active:scale-[0.98]"
                : "bg-[#e0e0dc] text-[#aaa] cursor-not-allowed"
            }`}
          >
            {canProceed ? "この内容で名刺をつくる" : "全てのネタで立場を選んでください"}
          </button>
        </div>
      </div>
    </div>
  );
}
