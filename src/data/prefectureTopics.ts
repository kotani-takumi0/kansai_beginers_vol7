import type { Topic } from "../types";

export interface PrefectureTopicSet {
  readonly prefecture: string;
  readonly topics: ReadonlyArray<Topic>;
}

const PREFECTURE_TOPICS: ReadonlyArray<PrefectureTopicSet> = [
  {
    prefecture: "大阪府",
    topics: [
      { id: "osaka-1", text: "お好み焼きをおかずにご飯を食べる", category: "食文化" },
      { id: "osaka-2", text: "知らない人に話しかけられても普通に返す", category: "習慣" },
      { id: "osaka-3", text: "エスカレーターは右に立つ", category: "くらし" },
      { id: "osaka-4", text: "会話にオチを求められる", category: "ことば" },
      { id: "osaka-5", text: "551の紙袋を新幹線に持ち込む", category: "地元あるある" },
    ],
  },
  {
    prefecture: "北海道",
    topics: [
      { id: "hokkaido-1", text: "冬は車にスコップを積んでいる", category: "くらし" },
      { id: "hokkaido-2", text: "100km先を「近い」と言う", category: "習慣" },
      { id: "hokkaido-3", text: "ジンギスカンはBBQの定番", category: "食文化" },
      { id: "hokkaido-4", text: "「しばれる」は標準語だと思っていた", category: "ことば" },
      { id: "hokkaido-5", text: "セイコーマートがコンビニの中で一番好き", category: "地元あるある" },
    ],
  },
  {
    prefecture: "東京都",
    topics: [
      { id: "tokyo-1", text: "電車の乗り換えで毎日1万歩は歩く", category: "くらし" },
      { id: "tokyo-2", text: "有名観光地にほぼ行ったことがない", category: "習慣" },
      { id: "tokyo-3", text: "もんじゃ焼きは立派な食事だと思う", category: "食文化" },
      { id: "tokyo-4", text: "地元の話になると「東京のどこ？」と聞かれてちょっと困る", category: "地元あるある" },
      { id: "tokyo-5", text: "方言がないことがコンプレックス", category: "ことば" },
    ],
  },
  {
    prefecture: "福岡県",
    topics: [
      { id: "fukuoka-1", text: "ラーメンは替え玉してこそ", category: "食文化" },
      { id: "fukuoka-2", text: "「よかろうもん」は敬語だと思っている", category: "ことば" },
      { id: "fukuoka-3", text: "屋台が日常の延長にある", category: "くらし" },
      { id: "fukuoka-4", text: "うどんはやわやわが好き", category: "食文化" },
      { id: "fukuoka-5", text: "修羅の国と言われると微妙な気持ちになる", category: "地元あるある" },
    ],
  },
  {
    prefecture: "沖縄県",
    topics: [
      { id: "okinawa-1", text: "集合時間に遅れるのは文化", category: "習慣" },
      { id: "okinawa-2", text: "ステーキはシメに食べるもの", category: "食文化" },
      { id: "okinawa-3", text: "台風が来ると少しワクワクする", category: "くらし" },
      { id: "okinawa-4", text: "「なんくるないさ」で大体のことは乗り越えられる", category: "ことば" },
      { id: "okinawa-5", text: "A&Wのルートビアが大好き", category: "地元あるある" },
    ],
  },
];

export function getTopicsForPrefecture(prefecture: string): ReadonlyArray<Topic> | null {
  const found = PREFECTURE_TOPICS.find((p) => p.prefecture === prefecture);
  return found?.topics ?? null;
}

export function getSupportedPrefectures(): ReadonlyArray<string> {
  return PREFECTURE_TOPICS.map((p) => p.prefecture);
}
