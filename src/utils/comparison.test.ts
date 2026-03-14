import { describe, it, expect } from "vitest";
import { compareMeishi } from "./comparison";
import type { MeishiData } from "../types";

const createMeishi = (
  prefecture: string,
  stances: { text: string; category: string; agrees: boolean }[]
): MeishiData => ({
  id: crypto.randomUUID(),
  prefecture,
  topics: stances.map((s) => ({
    topic: { id: crypto.randomUUID(), text: s.text, category: s.category },
    agrees: s.agrees,
  })),
  createdAt: new Date().toISOString(),
});

describe("compareMeishi", () => {
  it("完全一致: すべてのネタで立場が同じ場合", () => {
    const topics = [
      { text: "たこ焼きは主食", category: "食文化", agrees: true },
      { text: "エスカレーターは右に立つ", category: "習慣", agrees: false },
      { text: "〜やねん は標準語", category: "方言", agrees: true },
    ];
    const my = createMeishi("大阪府", topics);
    const partner = createMeishi("大阪府", topics);

    const result = compareMeishi(my, partner);

    expect(result.matchCount).toBe(3);
    expect(result.mismatchCount).toBe(0);
    expect(result.matches).toHaveLength(3);
    expect(result.matches.every((m) => m.isMatch)).toBe(true);
    expect(result.myMeishi).toBe(my);
    expect(result.partnerMeishi).toBe(partner);
  });

  it("完全不一致: すべてのネタで立場が異なる場合", () => {
    const my = createMeishi("大阪府", [
      { text: "たこ焼きは主食", category: "食文化", agrees: true },
      { text: "エスカレーターは右に立つ", category: "習慣", agrees: true },
    ]);
    const partner = createMeishi("東京都", [
      { text: "たこ焼きは主食", category: "食文化", agrees: false },
      { text: "エスカレーターは右に立つ", category: "習慣", agrees: false },
    ]);

    const result = compareMeishi(my, partner);

    expect(result.matchCount).toBe(0);
    expect(result.mismatchCount).toBe(2);
    expect(result.matches.every((m) => !m.isMatch)).toBe(true);
  });

  it("混合パターン: 一致と不一致が混在する場合", () => {
    const my = createMeishi("大阪府", [
      { text: "たこ焼きは主食", category: "食文化", agrees: true },
      { text: "エスカレーターは右に立つ", category: "習慣", agrees: true },
      { text: "〜やねん は標準語", category: "方言", agrees: false },
    ]);
    const partner = createMeishi("京都府", [
      { text: "たこ焼きは主食", category: "食文化", agrees: true },
      { text: "エスカレーターは右に立つ", category: "習慣", agrees: false },
      { text: "〜やねん は標準語", category: "方言", agrees: false },
    ]);

    const result = compareMeishi(my, partner);

    expect(result.matchCount).toBe(2);
    expect(result.mismatchCount).toBe(1);
    expect(result.matchCount + result.mismatchCount).toBe(3);
  });

  it("matchCount + mismatchCount = 全ネタ数 を満たす", () => {
    const my = createMeishi("大阪府", [
      { text: "ネタ1", category: "食文化", agrees: true },
      { text: "ネタ2", category: "習慣", agrees: false },
      { text: "ネタ3", category: "方言", agrees: true },
      { text: "ネタ4", category: "文化", agrees: false },
      { text: "ネタ5", category: "観光", agrees: true },
    ]);
    const partner = createMeishi("東京都", [
      { text: "ネタ1", category: "食文化", agrees: false },
      { text: "ネタ2", category: "習慣", agrees: false },
      { text: "ネタ3", category: "方言", agrees: false },
      { text: "ネタ4", category: "文化", agrees: true },
      { text: "ネタ5", category: "観光", agrees: true },
    ]);

    const result = compareMeishi(my, partner);

    expect(result.matchCount + result.mismatchCount).toBe(5);
    expect(result.matches).toHaveLength(5);
  });

  it("各TopicMatchが正しいフィールドを持つ", () => {
    const my = createMeishi("大阪府", [
      { text: "たこ焼きは主食", category: "食文化", agrees: true },
    ]);
    const partner = createMeishi("東京都", [
      { text: "たこ焼きは主食", category: "食文化", agrees: false },
    ]);

    const result = compareMeishi(my, partner);
    const match = result.matches[0];

    expect(match.topicText).toBe("たこ焼きは主食");
    expect(match.category).toBe("食文化");
    expect(match.myStance).toBe(true);
    expect(match.partnerStance).toBe(false);
    expect(match.isMatch).toBe(false);
  });

  it("ネタの順番が異なっても正しく比較する（インデックスベース）", () => {
    const my = createMeishi("大阪府", [
      { text: "ネタA", category: "食文化", agrees: true },
      { text: "ネタB", category: "習慣", agrees: false },
    ]);
    const partner = createMeishi("東京都", [
      { text: "ネタA", category: "食文化", agrees: true },
      { text: "ネタB", category: "習慣", agrees: true },
    ]);

    const result = compareMeishi(my, partner);

    expect(result.matchCount).toBe(1);
    expect(result.mismatchCount).toBe(1);
  });
});
