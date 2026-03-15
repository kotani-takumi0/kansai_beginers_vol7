import { test, expect } from "@playwright/test";

test.describe("カード作成フロー", () => {
  test("都道府県選択 → ネタ生成 → 立場選択 → カードプレビュー完成", async ({
    page,
  }) => {
    // 1. トップページ（都道府県選択）
    await page.goto("/");
    await expect(page.getByText("出身地はどこ？")).toBeVisible();

    // 大阪府を選択
    await page.getByRole("button", { name: "大阪府" }).click();

    // 決定ボタン押下
    await page.getByRole("button", { name: /大阪府で決定/ }).click();

    // 2. ネタ生成画面に遷移
    await expect(page).toHaveURL("/topics");
    await expect(page.getByText("大阪府の")).toBeVisible();

    // ネタ生成完了を待つ（ローディング → コンテンツ表示）
    await expect(page.getByText("TOPIC 1")).toBeVisible({ timeout: 15_000 });

    // 3. 全ネタで立場を選択（「それ、わかる」を全部選ぶ）
    const agreeButtons = page.getByRole("button", { name: "それ、わかる" });
    const count = await agreeButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      await agreeButtons.nth(i).click();
    }

    // 4. カード作成ボタン押下
    await page
      .getByRole("button", { name: "この内容でカードをつくる" })
      .click();

    // 5. プレビュー画面に遷移
    await expect(page).toHaveURL("/preview");
    await expect(page.getByText("JIMOTO MEISHI")).toBeVisible();
    await expect(page.getByText("大阪府", { exact: true })).toBeVisible();

    // 共有ボタンが表示される
    await expect(
      page.getByRole("button", { name: "このカードを共有する" })
    ).toBeVisible();
  });
});
