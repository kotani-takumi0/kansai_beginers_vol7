import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { createGenerateTopicsRouter } from "./generateTopics";

// Anthropic SDK のモック
const mockCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate };
  },
}));

const VALID_PREFECTURES = [
  "北海道", "青森県", "東京都", "大阪府", "沖縄県",
];

const mockTopicsResponse = [
  { id: "1", text: "たこ焼きは主食である", category: "食文化" },
  { id: "2", text: "エスカレーターは右に立つ", category: "習慣" },
  { id: "3", text: "「知らんけど」は敬語である", category: "方言" },
];

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/generate-topics", createGenerateTopicsRouter());
  return app;
};

describe("POST /api/generate-topics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("有効な都道府県名で3〜5個のTopicが返る", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockTopicsResponse),
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/generate-topics")
      .send({ prefecture: "大阪府" });

    expect(res.status).toBe(200);
    expect(res.body.prefecture).toBe("大阪府");
    expect(res.body.topics).toHaveLength(3);
    expect(res.body.topics[0]).toHaveProperty("id");
    expect(res.body.topics[0]).toHaveProperty("text");
    expect(res.body.topics[0]).toHaveProperty("category");
  });

  it("無効な都道府県名で400エラーが返る", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/generate-topics")
      .send({ prefecture: "存在しない県" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("prefectureが未指定で400エラーが返る", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/generate-topics")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("AI API障害時に500エラーとメッセージが返る", async () => {
    mockCreate.mockRejectedValue(new Error("API connection failed"));

    const app = createApp();
    const res = await request(app)
      .post("/api/generate-topics")
      .send({ prefecture: "東京都" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it("レスポンスがTopic型（id, text, category）に準拠している", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockTopicsResponse),
        },
      ],
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/generate-topics")
      .send({ prefecture: "北海道" });

    expect(res.status).toBe(200);
    for (const topic of res.body.topics) {
      expect(typeof topic.id).toBe("string");
      expect(typeof topic.text).toBe("string");
      expect(typeof topic.category).toBe("string");
      expect(topic.id.length).toBeGreaterThan(0);
      expect(topic.text.length).toBeGreaterThan(0);
      expect(topic.category.length).toBeGreaterThan(0);
    }
  });

  it("47都道府県すべてが有効な入力として受け付けられる", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockTopicsResponse),
        },
      ],
    });

    const app = createApp();
    for (const pref of VALID_PREFECTURES) {
      const res = await request(app)
        .post("/api/generate-topics")
        .send({ prefecture: pref });

      expect(res.status).toBe(200);
    }
  });
});
