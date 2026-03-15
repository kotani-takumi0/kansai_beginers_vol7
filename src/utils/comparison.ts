import type {
  MeishiData,
  ComparisonResult,
  ShockReaction,
} from "../types";

/**
 * 相手の名刺の「普通」トピックに対するリアクションから比較結果を作成する。
 */
export const buildComparisonResult = (
  myMeishi: MeishiData,
  partnerMeishi: MeishiData,
  reactions: ReadonlyArray<ShockReaction>,
): ComparisonResult => {
  const shockCount = reactions.filter((r) => r.isShocked).length;

  return {
    myMeishi,
    partnerMeishi,
    reactions,
    shockCount,
    knewItCount: reactions.length - shockCount,
  };
};
