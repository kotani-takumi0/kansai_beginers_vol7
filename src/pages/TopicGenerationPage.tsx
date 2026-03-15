import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildBackendUrl } from "../utils/backendUrl";
import { saveExchangeHistoryEntry } from "../utils/appStorage";
import type { MeishiData, ConversationTopic } from "../types";

type PageState = "loading" | "done" | "error";

export function TopicGenerationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const myMeishi = location.state?.myMeishi as MeishiData | undefined;
  const partnerMeishi = location.state?.partnerMeishi as MeishiData | undefined;
  const cachedTopics = location.state?.topics as ReadonlyArray<ConversationTopic> | undefined;

  const [pageState, setPageState] = useState<PageState>(cachedTopics ? "done" : "loading");
  const [topics, setTopics] = useState<ReadonlyArray<ConversationTopic>>(cachedTopics ?? []);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!myMeishi || !partnerMeishi) {
      navigate("/");
      return;
    }

    if (cachedTopics) return;

    const my = myMeishi;
    const partner = partnerMeishi;
    const controller = new AbortController();

    async function fetchTopics() {
      try {
        const response = await fetch(buildBackendUrl("/api/topics"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            myPrefecture: my.prefecture,
            partnerPrefecture: partner.prefecture,
            myName: my.name,
            partnerName: partner.name,
          }),
        });

        if (!response.ok) {
          throw new Error("APIエラー");
        }

        const data = (await response.json()) as { topics: ConversationTopic[] };
        setTopics(data.topics);
        setPageState("done");

        saveExchangeHistoryEntry({
          id: `${my.id}:${partner.id}`,
          exchangedAt: new Date().toISOString(),
          myMeishi: my,
          partnerMeishi: partner,
          topics: data.topics,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setPageState("error");
        setErrorMessage("話題の生成に失敗しました。もう一度お試しください。");
      }
    }

    void fetchTopics();

    return () => controller.abort();
  }, [myMeishi, partnerMeishi, cachedTopics, navigate]);

  if (!myMeishi || !partnerMeishi) return null;

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

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">CONVERSATION TOPICS</p>
            <h1 className="mt-1 text-[27px] font-black leading-tight">
              {myMeishi.prefecture} × {partnerMeishi.prefecture}
            </h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              {myMeishi.name}さんと{partnerMeishi.name}さんの話のタネ
            </p>
          </div>
        </section>

        {pageState === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d5b98b] border-t-[#d94841]" />
            <p className="text-lg font-black text-[#744b2e]">AIが話のタネを考え中...</p>
            <p className="text-sm text-[#8a6847]">
              {myMeishi.prefecture}と{partnerMeishi.prefecture}の違いから<br />
              盛り上がる話題を探しています
            </p>
          </div>
        )}

        {pageState === "error" && (
          <div className="rounded-[24px] border-[3px] border-red-300 bg-red-50 p-5 text-center">
            <p className="text-lg font-black text-red-600">エラー</p>
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setPageState("loading");
                setErrorMessage("");
                navigate(0);
              }}
              className="mt-4 rounded-2xl bg-[#d94841] px-6 py-3 text-sm font-bold text-white"
            >
              もう一度試す
            </button>
          </div>
        )}

        {pageState === "done" && (
          <section className="space-y-3">
            {topics.map((topic, index) => (
              <article
                key={topic.id}
                className="rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-4 shadow-[0_6px_0_#d2b17e]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#f3dfb0] text-[11px] font-black text-[#744b2e]">
                    {index + 1}
                  </span>
                  <span className="text-xl">{topic.emoji}</span>
                </div>
                <p className="text-[15px] font-semibold leading-relaxed text-[#1a1a1a]">
                  {topic.text}
                </p>
              </article>
            ))}
          </section>
        )}

        {pageState === "done" && (
          <button
            type="button"
            onClick={() => navigate("/preview")}
            className="w-full rounded-[24px] border-[3px] border-[#744b2e] bg-[#1f8f5f] px-5 py-4 text-[16px] font-black text-white shadow-[0_6px_0_#166647] transition active:translate-y-[2px] active:shadow-[0_3px_0_#166647]"
          >
            名刺に戻る
          </button>
        )}
      </div>
    </div>
  );
}
