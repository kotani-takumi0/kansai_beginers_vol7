import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Topic, TopicWithStance } from "../types";
import { loadSelectedPrefecture, saveSelectedTopics } from "../utils/appStorage";
import { generateTopics } from "../utils/topicGenerator";

type Stance = boolean | null;
type TopicIllustration = {
  readonly id: string;
  readonly label: string;
  readonly accent: string;
  readonly emoji: string;
};

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

const PREFECTURE_ILLUSTRATIONS: Record<string, TopicIllustration> = {
  北海道: { id: "melon", label: "メロン", accent: "#ff9f1c", emoji: "北の甘さ" },
  青森県: { id: "apple", label: "りんご", accent: "#e63946", emoji: "しゃきっと" },
  岩手県: { id: "wanko", label: "わんこそば", accent: "#8d6e63", emoji: "椀が止まらない" },
  宮城県: { id: "gyutan", label: "牛たん", accent: "#2a9d8f", emoji: "香ばしい" },
  秋田県: { id: "kiritanpo", label: "きりたんぽ", accent: "#a66a3f", emoji: "あつあつ" },
  山形県: { id: "cherry", label: "さくらんぼ", accent: "#ef476f", emoji: "つやつや" },
  福島県: { id: "peach", label: "もも", accent: "#ff8fab", emoji: "みずみずしい" },
  茨城県: { id: "natto", label: "納豆", accent: "#7f5539", emoji: "ねばり強い" },
  栃木県: { id: "strawberry", label: "いちご", accent: "#ff4d6d", emoji: "とちおとめ" },
  群馬県: { id: "daruma", label: "だるま", accent: "#d62828", emoji: "必勝" },
  埼玉県: { id: "sweetpotato", label: "さつまいも", accent: "#9c6644", emoji: "ほくほく" },
  千葉県: { id: "peanut", label: "落花生", accent: "#b08968", emoji: "香ばしい" },
  東京都: { id: "taiyaki", label: "たい焼き", accent: "#ff7b54", emoji: "下町の熱" },
  神奈川県: { id: "ship", label: "港", accent: "#457b9d", emoji: "潮風" },
  新潟県: { id: "rice", label: "お米", accent: "#dda15e", emoji: "つやつや" },
  富山県: { id: "fish", label: "白えび", accent: "#4ea8de", emoji: "海の幸" },
  石川県: { id: "goldleaf", label: "金箔", accent: "#d4a017", emoji: "きらり" },
  福井県: { id: "dinosaur", label: "恐竜", accent: "#588157", emoji: "どーんと" },
  山梨県: { id: "grape", label: "ぶどう", accent: "#7b2cbf", emoji: "実り" },
  長野県: { id: "apple", label: "りんご", accent: "#e76f51", emoji: "高原の香り" },
  岐阜県: { id: "ayu", label: "鮎", accent: "#2a9d8f", emoji: "清流" },
  静岡県: { id: "tea", label: "お茶", accent: "#5f8f3f", emoji: "一服" },
  愛知県: { id: "shachihoko", label: "しゃちほこ", accent: "#355070", emoji: "きらり" },
  三重県: { id: "lobster", label: "伊勢えび", accent: "#c1121f", emoji: "豪華" },
  滋賀県: { id: "lake", label: "琵琶湖", accent: "#3a86ff", emoji: "でっかい" },
  京都府: { id: "temple", label: "お寺", accent: "#d94841", emoji: "雅" },
  大阪府: { id: "takoyaki", label: "たこ焼き", accent: "#ef476f", emoji: "粉もん魂" },
  兵庫県: { id: "cow", label: "神戸牛", accent: "#9c6644", emoji: "上品" },
  奈良県: { id: "deer", label: "鹿", accent: "#8d6e63", emoji: "のんびり" },
  和歌山県: { id: "mikan", label: "みかん", accent: "#ff9f1c", emoji: "太陽" },
  鳥取県: { id: "dune", label: "砂丘", accent: "#c49a6c", emoji: "風紋" },
  島根県: { id: "shimenawa", label: "しめ縄", accent: "#8c6a43", emoji: "ご縁" },
  岡山県: { id: "peach", label: "白桃", accent: "#f4a6b8", emoji: "やさしい甘さ" },
  広島県: { id: "okonomiyaki", label: "お好み焼き", accent: "#c8553d", emoji: "重ね焼き" },
  山口県: { id: "puffer", label: "ふぐ", accent: "#277da1", emoji: "ぴりっと" },
  徳島県: { id: "sudachi", label: "すだち", accent: "#70e000", emoji: "さわやか" },
  香川県: { id: "udon", label: "うどん", accent: "#f4a261", emoji: "コシ強め" },
  愛媛県: { id: "mikan", label: "みかん", accent: "#ff9f1c", emoji: "みずみずしい" },
  高知県: { id: "bonito", label: "かつお", accent: "#577590", emoji: "豪快" },
  福岡県: { id: "ramen", label: "ラーメン", accent: "#118ab2", emoji: "湯気" },
  佐賀県: { id: "pottery", label: "焼き物", accent: "#6d597a", emoji: "手仕事" },
  長崎県: { id: "ship", label: "異国の港", accent: "#457b9d", emoji: "ロマン" },
  熊本県: { id: "bear", label: "くまモチーフ", accent: "#264653", emoji: "どっしり" },
  大分県: { id: "onsen", label: "温泉", accent: "#f28482", emoji: "ほかほか" },
  宮崎県: { id: "mango", label: "マンゴー", accent: "#ffb703", emoji: "南国" },
  鹿児島県: { id: "volcano", label: "火山", accent: "#e76f51", emoji: "力強い" },
  沖縄県: { id: "shisa", label: "シーサー", accent: "#06d6a0", emoji: "守り神" },
};

const DECORATIVE_STICKERS = [
  { key: "sticker-1", label: "旅みやげ気分", color: "#ffd166", position: "top-20 right-4 rotate-[10deg]" },
  { key: "sticker-2", label: "地元あるある", color: "#90be6d", position: "top-64 left-3 rotate-[-8deg]" },
  { key: "sticker-3", label: "名物トーク", color: "#f28482", position: "bottom-36 right-2 rotate-[-6deg]" },
] as const;

function TopicIllustrationBadge({ illustration }: { readonly illustration: TopicIllustration }) {
  const { id, accent } = illustration;

  if (id === "melon" || id === "apple" || id === "peach" || id === "grape" || id === "mango" || id === "mikan" || id === "cherry" || id === "strawberry") {
    return (
      <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
        <circle cx="48" cy="52" r="26" fill={accent} />
        <path d="M39 29c4-8 12-13 21-13" fill="none" stroke="#4f7c2b" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="61" cy="29" rx="11" ry="6" fill="#77b255" transform="rotate(-18 61 29)" />
        <circle cx="38" cy="46" r="5" fill="#fff" opacity="0.18" />
      </svg>
    );
  }

  if (id === "takoyaki" || id === "okonomiyaki" || id === "gyutan" || id === "ramen" || id === "udon" || id === "wanko" || id === "kiritanpo") {
    return (
      <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
        <path d="M20 50h56c0 16-13 28-28 28S20 66 20 50Z" fill={accent} />
        <path d="M28 49c0-11 9-20 20-20s20 9 20 20" fill="#fff6df" />
        <path d="M33 41c5 4 10 7 15 7s10-3 15-7" fill="none" stroke="#ffd166" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "temple" || id === "shachihoko" || id === "pottery" || id === "goldleaf" || id === "shimenawa" || id === "dinosaur" || id === "volcano" || id === "onsen") {
    return (
      <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
        <path d="M26 70V46l22-14 22 14v24" fill={accent} />
        <path d="M31 44h34L48 28 31 44Z" fill="#ffd166" />
        <rect x="41" y="52" width="14" height="18" rx="4" fill="#fff9ea" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden="true">
      <circle cx="48" cy="48" r="28" fill={accent} />
      <path d="M33 56c4-6 10-10 15-10 6 0 12 4 15 10" fill="none" stroke="#fff9ea" strokeWidth="6" strokeLinecap="round" />
      <circle cx="39" cy="41" r="4" fill="#fff9ea" />
      <circle cx="57" cy="41" r="4" fill="#fff9ea" />
    </svg>
  );
}

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

  const illustration =
    PREFECTURE_ILLUSTRATIONS[prefecture] ?? {
      id: "fallback",
      label: "ご当地",
      accent: "#e85d3a",
      emoji: "ローカル感",
    };

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

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-24 mx-auto max-w-[460px]">
        {DECORATIVE_STICKERS.map((sticker) => (
          <div
            key={sticker.key}
            className={`absolute hidden rounded-full border-2 border-[#744b2e] px-3 py-1 text-[10px] font-black tracking-[0.14em] text-[#744b2e] shadow-[0_4px_0_#d6b98e] sm:block ${sticker.position}`}
            style={{ backgroundColor: sticker.color }}
            aria-hidden="true"
          >
            {sticker.label}
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">TOPIC TICKET</p>
            <span className="mt-1 block text-[17px] font-semibold">ネタ選択</span>
            <h1 className="mt-1 text-[27px] font-black leading-tight">{prefecture}のご当地トーク</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              イラストをヒントに、地元らしい論点を選んで名刺の中身を仕上げよう
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] border-2 border-[#744b2e] bg-white shadow-[0_5px_0_#e7c58b]"
              style={{ backgroundColor: `${illustration.accent}20` }}
            >
              <TopicIllustrationBadge illustration={illustration} />
            </div>
            <div className="min-w-0">
              <div
                className="inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-[0.16em] text-white"
                style={{ backgroundColor: illustration.accent }}
              >
                {illustration.label}
              </div>
              <p className="mt-2 text-lg font-black text-[#3d2718]">{illustration.emoji}</p>
              <p className="mt-1 text-sm font-bold text-[#7c5a39]">
                この空気感に近いネタを5つ選んで、地元トークの輪郭を作ります。
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] px-4 py-3 shadow-[0_8px_0_#d2b17e]">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">選択状況</p>
            <p className="text-sm font-black text-[#3d2718]">
              {completedCount} / {topics.length || 5} 個
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={isLoading}
            className="min-h-[44px] rounded-[16px] border-2 border-[#744b2e] bg-[#fff3d1] px-4 py-2 text-sm font-black text-[#a54f23] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            別のネタにする
          </button>
        </div>

        <section className="relative flex-1 space-y-3 overflow-y-auto px-4 scrollbar-hide">
        {isLoading && (
          <div className="rounded-[24px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-5 shadow-[0_8px_0_#d2b17e]">
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[18px] border-2 border-[#744b2e] bg-white"
                style={{ backgroundColor: `${illustration.accent}20` }}
              >
                <TopicIllustrationBadge illustration={illustration} />
              </div>
              <div>
                <p className="text-sm font-black text-[#1a1a1a]">ネタを生成中です</p>
                <p className="text-xs font-bold text-[#7c5a39]">
                  {prefecture}らしい論点を、ご当地イラストの空気感と一緒にまとめています…
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-[18px] bg-[#f0e6d2]" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-[24px] border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-black">生成できませんでした</p>
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
                    className={`rounded-[18px] border-2 px-3 py-3 text-left transition ${
                      selectedStance === true
                        ? "border-emerald-600 bg-emerald-500 text-white"
                        : "border-[#d5b98b] bg-[#fff7e6] text-[#555]"
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
                    className={`rounded-[18px] border-2 px-3 py-3 text-left transition ${
                      selectedStance === false
                        ? "border-[#b53c19] bg-[#e85d3a] text-white"
                        : "border-[#d5b98b] bg-[#fff7e6] text-[#555]"
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
            {canProceed ? "この内容で名刺をつくる" : "全てのネタで立場を選んでください"}
          </button>
        </div>
      </div>
    </div>
  );
}
