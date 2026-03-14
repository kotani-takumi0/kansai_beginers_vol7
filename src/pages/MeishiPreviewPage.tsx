import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { MeishiData } from "../types";
import {
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

export function MeishiPreviewPage() {
  const navigate = useNavigate();
  const prefecture = loadSelectedPrefecture();
  const topics = loadSelectedTopics();
  const partnerMeishi = loadPartnerMeishi();

  const meishi = useMemo<MeishiData | null>(() => {
    if (prefecture && topics.length > 0) {
      return {
        id: createMeishiId(),
        prefecture,
        topics,
        createdAt: new Date().toISOString(),
      };
    }

    // sessionStorageにデータがなければlocalStorageから復元
    return loadMyMeishi();
  }, [prefecture, topics]);

  useEffect(() => {
    if (meishi) {
      saveMyMeishi(meishi);
    }
  }, [meishi]);

  if (!meishi) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="rounded-[32px] border border-orange-100 bg-white px-6 py-8 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.2em] text-orange-500">PREVIEW</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">名刺データがありません</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            先に出身地を選んで、ネタの立場を決めてください。
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-5 py-3 font-bold text-white"
            >
              最初からつくる
            </button>
            <button
              type="button"
              onClick={() => navigate("/topics")}
              className="rounded-full border border-gray-200 px-5 py-3 font-semibold text-gray-700"
            >
              ネタ選択に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 pb-8">
      <section className="rounded-[28px] bg-linear-to-br from-slate-950 via-slate-900 to-orange-950 px-5 py-6 text-white shadow-xl">
        <p className="text-xs font-semibold tracking-[0.24em] text-orange-300">JIMOTO MEISHI</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{meishi.prefecture}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              地元では普通。でも外に出ると会話になる、わたしの論点カード。
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
            <p className="text-[10px] tracking-[0.18em] text-white/50">TOPICS</p>
            <p className="text-2xl font-bold">{meishi.topics.length}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {meishi.topics.map(({ topic, agrees }, index) => (
            <article
              key={topic.id}
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/12 px-2 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[11px] font-semibold text-orange-200">
                    {topic.category}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    agrees
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-sky-400/20 text-sky-200"
                  }`}
                >
                  {agrees ? "わかる派" : "違う派"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/92">{topic.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">この名刺でよければ共有へ</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          QR表示とURL共有は次の画面で行います。気になるなら一度ネタ選択に戻って調整できます。
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {partnerMeishi ? (
            <button
              type="button"
              onClick={() => {
                clearPartnerMeishi();
                navigate("/comparison", {
                  state: { myMeishi: meishi, partnerMeishi },
                });
              }}
              className="rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-95"
            >
              名刺を比較する
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/share", { state: { meishi } })}
              className="rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-95"
            >
              この名刺を共有する
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearMyMeishi();
              navigate("/");
            }}
            className="rounded-full border border-gray-200 px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            名刺を作り直す
          </button>
        </div>
      </section>
    </div>
  );
}
