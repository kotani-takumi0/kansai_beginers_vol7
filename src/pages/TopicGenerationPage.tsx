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
    <div className="mx-auto flex h-full max-w-md flex-col pb-24">
      <section className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-orange-500 via-rose-500 to-pink-500 px-5 py-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-10 left-4 h-24 w-24 rounded-full bg-amber-200/20 blur-2xl" />
        <p className="relative text-xs font-semibold tracking-[0.2em] text-white/75">TOPIC GENERATOR</p>
        <h2 className="relative mt-2 text-2xl font-bold leading-tight">
          {prefecture}の
          <br />
          あるある、どっち派？
        </h2>
        <p className="relative mt-3 text-sm leading-6 text-white/85">
          AIが「本人は普通だと思っているけど、話すと盛り上がる」ネタを集めました。
        </p>
        <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="text-xs text-white/70">選択状況</p>
            <p className="text-sm font-semibold">
              {completedCount} / {topics.length || 5} 個
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={isLoading}
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            別のネタにする
          </button>
        </div>
      </section>

      <section className="mt-5 flex-1 space-y-4 overflow-y-auto scrollbar-hide">
        {isLoading && (
          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">ネタを生成中です</p>
                <p className="text-sm text-gray-500">{prefecture}らしい論点をまとめています…</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-[28px] border border-red-100 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
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
                className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-orange-500">
                      TOPIC {index + 1}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                      {topic.category}
                    </span>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedStance === null
                        ? "bg-gray-100 text-gray-500"
                        : selectedStance
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {selectedStance === null ? "未選択" : selectedStance ? "わかる派" : "違う派"}
                  </div>
                </div>

                <p className="mt-4 text-base font-semibold leading-7 text-gray-900">{topic.text}</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, true)}
                    className={`rounded-2xl px-4 py-4 text-left transition ${
                      selectedStance === true
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.agree.label}</p>
                    <p className={`mt-1 text-xs ${selectedStance === true ? "text-white/80" : "text-emerald-700"}`}>
                      {STANCE_COPY.agree.description}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectStance(topic.id, false)}
                    className={`rounded-2xl px-4 py-4 text-left transition ${
                      selectedStance === false
                        ? "bg-sky-500 text-white shadow-md"
                        : "bg-sky-50 text-sky-900 hover:bg-sky-100"
                    }`}
                  >
                    <p className="text-sm font-bold">{STANCE_COPY.disagree.label}</p>
                    <p className={`mt-1 text-xs ${selectedStance === false ? "text-white/80" : "text-sky-700"}`}>
                      {STANCE_COPY.disagree.description}
                    </p>
                  </button>
                </div>
              </article>
            );
          })}
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-4 pb-6 pt-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex w-full items-center justify-center rounded-full py-4 text-lg font-bold shadow-lg transition ${
              canProceed
                ? "bg-linear-to-r from-orange-500 to-pink-500 text-white hover:scale-[1.01] active:scale-95"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {canProceed ? "この内容で名刺をつくる" : "全てのネタで立場を選んでください"}
          </button>
        </div>
      </div>
    </div>
  );
}
