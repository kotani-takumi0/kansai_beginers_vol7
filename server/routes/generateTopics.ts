import { Router } from "express";
import type { Request, Response } from "express";
import type { Topic } from "../../src/types";

const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

const CATEGORY_LABELS = ["食文化", "習慣", "ことば", "くらし", "地元あるある"];

const FALLBACK_PATTERNS = [
  "{prefecture}では、お好み焼き定食はアリ",
  "{prefecture}の人は、地元チェーンの話になると急に熱量が上がる",
  "{prefecture}では、方言を少し混ぜたほうが親しみやすい",
  "都会より田舎の方が住みやすい",
  "{prefecture}では、有名スポットを日常使いしている感覚がある",
];

const isValidPrefecture = (value: unknown): value is string =>
  typeof value === "string" && PREFECTURES.includes(value as typeof PREFECTURES[number]);

const buildTopics = (prefecture: string): ReadonlyArray<Topic> =>
  FALLBACK_PATTERNS.map((pattern, index) => ({
    id: `${prefecture}-${index + 1}`,
    text: pattern.replaceAll("{prefecture}", prefecture),
    category: CATEGORY_LABELS[index % CATEGORY_LABELS.length],
  }));

export const createGenerateTopicsRouter = (): Router => {
  const router = Router();

  router.post("/", (req: Request, res: Response): void => {
    const { prefecture } = req.body as { prefecture: unknown };

    if (!isValidPrefecture(prefecture)) {
      res.status(400).json({
        error: "無効な都道府県名です。正しい都道府県名を指定してください。",
      });
      return;
    }

    const topics = buildTopics(prefecture);
    res.json({ topics, prefecture });
  });

  return router;
};
