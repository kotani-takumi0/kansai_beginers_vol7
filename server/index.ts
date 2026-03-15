import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createAuthRouter } from "./routes/auth";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3001;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY が設定されていません");
  }
  return new OpenAI({ apiKey });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", createAuthRouter());

// --- 名刺交換 API ---
// メモリ内ストア: { [受け取る側のmeishiId]: 送った側のmeishiデータ }
const pendingExchanges = new Map<string, { meishi: unknown; createdAt: number }>();

// 古いエントリを5分で自動削除
const EXCHANGE_TTL_MS = 5 * 60 * 1000;

function cleanupExpiredExchanges() {
  const now = Date.now();
  for (const [key, value] of pendingExchanges) {
    if (now - value.createdAt > EXCHANGE_TTL_MS) {
      pendingExchanges.delete(key);
    }
  }
}

// 名刺を交換に登録（スキャンした側が呼ぶ）
app.post("/api/exchange", (req, res) => {
  const { myMeishi, partnerMeishiId } = req.body as {
    myMeishi: unknown;
    partnerMeishiId: string;
  };

  if (!myMeishi || !partnerMeishiId) {
    res.status(400).json({ error: "名刺データが不足しています" });
    return;
  }

  cleanupExpiredExchanges();
  pendingExchanges.set(partnerMeishiId, { meishi: myMeishi, createdAt: Date.now() });
  res.json({ ok: true });
});

// 自分宛の名刺があるか確認（読み取られた側がポーリングで呼ぶ）
app.get("/api/exchange/:meishiId", (req, res) => {
  const { meishiId } = req.params;
  cleanupExpiredExchanges();

  const entry = pendingExchanges.get(meishiId);
  if (!entry) {
    res.json({ found: false });
    return;
  }

  pendingExchanges.delete(meishiId);
  res.json({ found: true, partnerMeishi: entry.meishi });
});

app.post("/api/topics", async (req, res) => {
  const { myPrefecture, partnerPrefecture, myName, partnerName } = req.body as {
    myPrefecture: string;
    partnerPrefecture: string;
    myName: string;
    partnerName: string;
  };

  if (!myPrefecture || !partnerPrefecture) {
    res.status(400).json({ error: "出身地が指定されていません" });
    return;
  }

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `あなたは初対面の2人の会話を盛り上げるための「話のタネ」を生成するアシスタントです。

2人の出身地の違いから生まれる面白い話題を5つ生成してください。

ルール:
- それぞれの地域の「あるある」や文化の違いに基づく話題にする
- 「へぇ〜！」「え、マジで？」と盛り上がれるような意外性のある話題を選ぶ
- 質問形式で、お互いに聞き合えるようにする
- 各話題には内容を象徴する絵文字を1つ付ける
- 堅すぎず、フランクで楽しい雰囲気にする

JSON配列で返してください。各要素は { "text": "話題テキスト", "emoji": "絵文字" } の形式です。
JSON以外は出力しないでください。`,
        },
        {
          role: "user",
          content: `${myName}さん（${myPrefecture}出身）と${partnerName}さん（${partnerPrefecture}出身）の会話が盛り上がる話題を5つ考えてください。`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "[]";
    const topics = JSON.parse(content) as Array<{ text: string; emoji: string }>;

    const result = topics.map((topic, index) => ({
      id: `topic-${index}`,
      text: topic.text,
      emoji: topic.emoji,
    }));

    res.json({ topics: result });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "話題の生成に失敗しました" });
  }
});

if (isProduction) {
  const distPath = path.resolve(__dirname, "..", "dist");
  app.use(express.static(distPath));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
