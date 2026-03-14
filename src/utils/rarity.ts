import type { ComparisonResult } from "../types";

export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export interface RarityInfo {
  readonly rarity: Rarity;
  readonly label: string;
  readonly color: string;
  readonly bgColor: string;
  readonly glowColor: string;
  readonly description: string;
}

const RARITY_MAP: Record<Rarity, Omit<RarityInfo, "rarity">> = {
  N: {
    label: "ノーマル",
    color: "#9ca3af",
    bgColor: "#f3f4f6",
    glowColor: "rgba(156,163,175,0.4)",
    description: "まだまだこれから！",
  },
  R: {
    label: "レア",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    glowColor: "rgba(59,130,246,0.5)",
    description: "ちょっと気が合うかも！",
  },
  SR: {
    label: "スーパーレア",
    color: "#a855f7",
    bgColor: "#f3e8ff",
    glowColor: "rgba(168,85,247,0.5)",
    description: "結構わかり合えるやん！",
  },
  SSR: {
    label: "SSレア",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    glowColor: "rgba(245,158,11,0.6)",
    description: "めっちゃ気が合うやん！！",
  },
  UR: {
    label: "ウルトラレア",
    color: "#ef4444",
    bgColor: "#fef2f2",
    glowColor: "rgba(239,68,68,0.7)",
    description: "運命の出会いやんけ！！！",
  },
};

/**
 * 比較結果からレアリティを判定する。
 * 共通点（一致数）が多いほど高レアリティ。
 * 同じ都道府県の場合はボーナスでレアリティが1段階上がる。
 */
export const calculateRarity = (result: ComparisonResult): Rarity => {
  const { matchCount, matches } = result;
  const totalTopics = matches.length;
  const samePrefecture =
    result.myMeishi.prefecture === result.partnerMeishi.prefecture;

  // 一致率で基本レアリティを決定
  const matchRate = totalTopics > 0 ? matchCount / totalTopics : 0;

  let rarity: Rarity;
  if (matchRate >= 0.8) {
    rarity = "SSR";
  } else if (matchRate >= 0.6) {
    rarity = "SR";
  } else if (matchRate >= 0.4) {
    rarity = "R";
  } else {
    rarity = "N";
  }

  // 同県ボーナス: レアリティ1段階アップ
  if (samePrefecture) {
    const upgradeMap: Record<Rarity, Rarity> = {
      N: "R",
      R: "SR",
      SR: "SSR",
      SSR: "UR",
      UR: "UR",
    };
    rarity = upgradeMap[rarity];
  }

  return rarity;
};

export const getRarityInfo = (rarity: Rarity): RarityInfo => ({
  rarity,
  ...RARITY_MAP[rarity],
});
