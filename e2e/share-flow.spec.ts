import { test, expect } from "@playwright/test";
import type { MeishiData } from "../src/types";

const sampleMeishi: MeishiData = {
  id: "e2e-share-test",
  prefecture: "京都府",
  topics: [
    {
      topic: { id: "1", text: "おばんざいは家庭料理", category: "食文化" },
      agrees: true,
    },
    {
      topic: { id: "2", text: "バスの乗り方が独特", category: "習慣" },
      agrees: false,
    },
    {
      topic: {
        id: "3",
        text: "道案内でお寺を目印にする",
        category: "地元あるある",
      },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

function encodeMeishi(data: MeishiData): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

test.describe("URL/QR共有フロー", () => {
  test("共有URL → カード受信 → カード表示", async ({ page }) => {
    const encoded = encodeMeishi(sampleMeishi);

    // 共有URLにアクセス
    await page.goto(`/receive?d=${encoded}`);

    // 受信画面が表示される
    await expect(page.getByText("カードが届きました！")).toBeVisible();
    await expect(page.getByText("京都府", { exact: true })).toBeVisible();

    // ネタが表示される
    await expect(page.getByText("おばんざいは家庭料理")).toBeVisible();
    await expect(page.getByText("バスの乗り方が独特")).toBeVisible();
    await expect(page.getByText("道案内でお寺を目印にする")).toBeVisible();

    // 「自分のカードも作る」ボタンが表示される
    await expect(
      page.getByRole("button", { name: "自分のカードも作る" })
    ).toBeVisible();
  });

  test("共有URL → 自分のカード作成 → 比較画面へ遷移", async ({ page }) => {
    const encoded = encodeMeishi(sampleMeishi);

    // 1. 共有URLにアクセスし「自分のカードも作る」
    await page.goto(`/receive?d=${encoded}`);
    await page.getByRole("button", { name: "自分のカードも作る" }).click();

    // 2. トップページに遷移しカードを作成
    await expect(page).toHaveURL("/");
    await page.getByRole("button", { name: "大阪府" }).click();
    await page.getByRole("button", { name: /大阪府で決定/ }).click();

    // 3. ネタ生成画面
    await expect(page).toHaveURL("/topics");
    await expect(page.getByText("TOPIC 1")).toBeVisible({ timeout: 15_000 });

    // 全ネタで「それ、わかる」を選択
    const agreeButtons = page.getByRole("button", { name: "それ、わかる" });
    const count = await agreeButtons.count();
    for (let i = 0; i < count; i++) {
      await agreeButtons.nth(i).click();
    }

    await page
      .getByRole("button", { name: "この内容でカードをつくる" })
      .click();

    // 4. プレビュー画面で「カードを比較する」ボタンが表示される（partnerMeishiが保存されているため）
    await expect(page).toHaveURL("/preview");
    await expect(
      page.getByRole("button", { name: "カードを比較する" })
    ).toBeVisible();

    // 5. 比較画面に遷移
    await page.getByRole("button", { name: "カードを比較する" }).click();
    await expect(page).toHaveURL("/comparison");
    await expect(page.getByText("比較結果")).toBeVisible();
  });

  test("不正な共有URLではエラーが表示される", async ({ page }) => {
    await page.goto("/receive?d=invalid-data");
    await expect(page.getByText("エラー")).toBeVisible();
    await expect(
      page.getByText("カードデータの読み取りに失敗しました")
    ).toBeVisible();
  });
});
