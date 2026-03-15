import { describe, it, expect } from "vitest";
import { buildComparisonResult } from "./comparison";
import type { MeishiData, ShockReaction } from "../types";

const createMeishi = (
  prefecture: string,
  stances: { text: string; category: string; isNormal: boolean }[]
): MeishiData => ({
  id: crypto.randomUUID(),
  prefecture,
  topics: stances.map((s) => ({
    topic: { id: crypto.randomUUID(), text: s.text, category: s.category },
    isNormal: s.isNormal,
  })),
  createdAt: new Date().toISOString(),
});

describe("buildComparisonResult", () => {
  it("全てショックの場合、shockCountが一致する", () => {
    const my = createMeishi("東京都", [
      { text: "もんじゃ焼き", category: "食文化", isNormal: true },
    ]);
    const partner = createMeishi("大阪府", [
      { text: "お好み焼き定食", category: "食文化", isNormal: true },
      { text: "エスカレーター右", category: "習慣", isNormal: true },
    ]);

    const reactions: ReadonlyArray<ShockReaction> = [
      { topic: partner.topics[0].topic, isShocked: true },
      { topic: partner.topics[1].topic, isShocked: true },
    ];

    const result = buildComparisonResult(my, partner, reactions);

    expect(result.shockCount).toBe(2);
    expect(result.knewItCount).toBe(0);
  });

  it("全て知ってた場合、knewItCountが一致する", () => {
    const my = createMeishi("大阪府", [
      { text: "たこ焼き", category: "食文化", isNormal: true },
    ]);
    const partner = createMeishi("北海道", [
      { text: "ジンギスカンBBQ", category: "食文化", isNormal: true },
      { text: "100km近い", category: "習慣", isNormal: true },
    ]);

    const reactions: ReadonlyArray<ShockReaction> = [
      { topic: partner.topics[0].topic, isShocked: false },
      { topic: partner.topics[1].topic, isShocked: false },
    ];

    const result = buildComparisonResult(my, partner, reactions);

    expect(result.shockCount).toBe(0);
    expect(result.knewItCount).toBe(2);
  });

  it("混合パターン: shockCount + knewItCount = reactions数", () => {
    const my = createMeishi("福岡県", [
      { text: "ラーメン替え玉", category: "食文化", isNormal: true },
    ]);
    const partner = createMeishi("沖縄県", [
      { text: "ステーキはシメ", category: "食文化", isNormal: true },
      { text: "なんくるないさ", category: "ことば", isNormal: true },
      { text: "台風ワクワク", category: "くらし", isNormal: true },
    ]);

    const reactions: ReadonlyArray<ShockReaction> = [
      { topic: partner.topics[0].topic, isShocked: true },
      { topic: partner.topics[1].topic, isShocked: false },
      { topic: partner.topics[2].topic, isShocked: true },
    ];

    const result = buildComparisonResult(my, partner, reactions);

    expect(result.shockCount).toBe(2);
    expect(result.knewItCount).toBe(1);
    expect(result.shockCount + result.knewItCount).toBe(3);
  });

  it("空のリアクションの場合、両方0になる", () => {
    const my = createMeishi("東京都", []);
    const partner = createMeishi("大阪府", []);

    const result = buildComparisonResult(my, partner, []);

    expect(result.shockCount).toBe(0);
    expect(result.knewItCount).toBe(0);
  });

  it("myMeishiとpartnerMeishiが正しく設定される", () => {
    const my = createMeishi("東京都", []);
    const partner = createMeishi("大阪府", []);

    const result = buildComparisonResult(my, partner, []);

    expect(result.myMeishi).toBe(my);
    expect(result.partnerMeishi).toBe(partner);
  });
});
