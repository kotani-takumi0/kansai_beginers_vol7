import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { createAuthRouter, resetAuthStore } from "./auth";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", createAuthRouter());
  return app;
};

describe("auth routes", () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("新規登録に成功するとユーザーとトークンを返す", async () => {
    const app = createApp();

    const res = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
      displayName: "たこやき太郎",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.displayName).toBe("たこやき太郎");
  });

  it("重複したメールアドレスの新規登録は409を返す", async () => {
    const app = createApp();

    await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "password123",
      displayName: "一人目",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "password123",
      displayName: "二人目",
    });

    expect(res.status).toBe(409);
  });

  it("ログインに成功するとユーザーとトークンを返す", async () => {
    const app = createApp();

    await request(app).post("/api/auth/register").send({
      email: "login@example.com",
      password: "password123",
      displayName: "ログイン太郎",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.displayName).toBe("ログイン太郎");
  });

  it("不正なパスワードでは401を返す", async () => {
    const app = createApp();

    await request(app).post("/api/auth/register").send({
      email: "wrong-pass@example.com",
      password: "password123",
      displayName: "ログイン太郎",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong-pass@example.com",
      password: "password999",
    });

    expect(res.status).toBe(401);
  });

  it("認証済みトークンで /me にアクセスできる", async () => {
    const app = createApp();

    const registerRes = await request(app).post("/api/auth/register").send({
      email: "me@example.com",
      password: "password123",
      displayName: "認証ユーザー",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });
});
