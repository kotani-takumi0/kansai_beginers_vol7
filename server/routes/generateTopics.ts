import { Router } from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";
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

const PROMPT_TEMPLATE = `あなたは日本の地域文化に詳しい専門家です。
以下の都道府県の出身者が「自分では普通だと思っているけど、他の地域の人からすると議論になる・驚かれるネタ」を3〜5個生成してください。

都道府県: {{prefecture}}

以下のJSON配列形式で返してください。他のテキストは含めないでください。
[
  {
    "id": "1",
    "text": "ネタの内容",
    "category": "カテゴリ（食文化・方言・習慣・文化・交通など）"
  }
]`;

const isValidPrefecture = (value: unknown): value is string =>
  typeof value === "string" && PREFECTURES.includes(value as typeof PREFECTURES[number]);

const parseTopicsFromResponse = (responseText: string): ReadonlyArray<Topic> => {
  const parsed: unknown = JSON.parse(responseText);

  if (!Array.isArray(parsed)) {
    throw new Error("AIのレスポンスが配列形式ではありません");
  }

  return parsed.map((item: Record<string, unknown>) => {
    if (
      typeof item.id !== "string" ||
      typeof item.text !== "string" ||
      typeof item.category !== "string"
    ) {
      throw new Error("Topic型に準拠していないデータが含まれています");
    }
    return { id: item.id, text: item.text, category: item.category };
  });
};

const createOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const createGenerateTopicsRouter = (): Router => {
  const router = Router();

  router.post("/", async (req: Request, res: Response): Promise<void> => {
    const { prefecture } = req.body as { prefecture: unknown };

    if (!isValidPrefecture(prefecture)) {
      res.status(400).json({
        error: "無効な都道府県名です。正しい都道府県名を指定してください。",
      });
      return;
    }

    try {
      const client = createOpenAIClient();

      if (!client) {
        res.status(503).json({
          error: "ネタ生成APIの設定が未完了です。OPENAI_API_KEY を設定してください。",
        });
        return;
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: PROMPT_TEMPLATE.replace("{{prefecture}}", prefecture),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        res.status(500).json({
          error: "AIからのレスポンスを取得できませんでした。再試行してください。",
        });
        return;
      }

      const topics = parseTopicsFromResponse(content);

      res.json({ topics, prefecture });
    } catch (error) {
      console.error("AI API error:", error);
      res.status(500).json({
        error: "ネタ生成に失敗しました。しばらく待ってから再試行してください。",
      });
    }
  });

  return router;
};
