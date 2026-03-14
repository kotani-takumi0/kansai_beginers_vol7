import { test, expect } from "@playwright/test";
import type { MeishiData } from "../src/types";

const partnerMeishi: MeishiData = {
  id: "e2e-partner",
  prefecture: "東京都",
  topics: [
    {
      topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
      agrees: false,
    },
    {
      topic: { id: "2", text: "エスカレーターは右に立つ", category: "習慣" },
      agrees: true,
    },
    {
      topic: {
        id: "3",
        text: "知らん人にも話しかける",
        category: "地元あるある",
      },
      agrees: false,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

function encodeMeishi(data: MeishiData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

test.describe("比較表示", () => {
  test("URL受信 → 名刺作成 → 比較画面で一致/不一致がハイライトされる", async ({
    page,
  }) => {
    const encoded = encodeMeishi(partnerMeishi);

    // 1. 受信ページでpartnerMeishiを保存
    await page.goto(`/receive?d=${encoded}`);
    await page.getByRole("button", { name: "自分の名刺も作る" }).click();

    // 2. 名刺作成フロー
    await expect(page).toHaveURL("/");
    await page.getByRole("button", { name: "大阪府" }).click();
    await page.getByRole("button", { name: /大阪府で決定/ }).click();

    await expect(page.getByText("TOPIC 1")).toBeVisible({ timeout: 15_000 });

    const agreeButtons = page.getByRole("button", { name: "それ、わかる" });
    const count = await agreeButtons.count();
    for (let i = 0; i < count; i++) {
      await agreeButtons.nth(i).click();
    }

    await page
      .getByRole("button", { name: "この内容で名刺をつくる" })
      .click();

    // 3. プレビューから比較へ
    await expect(page).toHaveURL("/preview");
    await page.getByRole("button", { name: "名刺を比較する" }).click();

    // 4. 比較結果の検証
    await expect(page).toHaveURL("/comparison");
    await expect(page.getByText("比較結果")).toBeVisible();

    // サマリーが表示される
    await expect(page.getByText("一致").first()).toBeVisible();
    await expect(page.getByText("不一致").first()).toBeVisible();

    // 出身地が表示される
    await expect(page.getByText("大阪府", { exact: true })).toBeVisible();
    await expect(page.getByText("東京都", { exact: true })).toBeVisible();

    // 会話メッセージが表示される
    const messages = page.locator('[data-testid="match-message"]');
    const messageCount = await messages.count();
    expect(messageCount).toBeGreaterThan(0);

    // 「もう一度名刺を作る」ボタンが表示される
    await expect(
      page.getByRole("button", { name: "もう一度名刺を作る" })
    ).toBeVisible();
  });

  test("比較データなしでアクセスするとエラー表示", async ({ page }) => {
    await page.goto("/comparison");
    await expect(page.getByText("比較データがありません")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "名刺を作る" })
    ).toBeVisible();
  });
});
