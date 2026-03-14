import type {
  MeishiData,
  ComparisonResult,
  TopicMatch,
} from "../types";

/**
 * 2人の名刺データを比較し、各ネタの立場の一致・不一致を判定する。
 * インデックスベースで対応するネタ同士を比較する。
 */
export const compareMeishi = (
  myMeishi: MeishiData,
  partnerMeishi: MeishiData
): ComparisonResult => {
  const minLength = Math.min(
    myMeishi.topics.length,
    partnerMeishi.topics.length
  );

  const matches: ReadonlyArray<TopicMatch> = myMeishi.topics
    .slice(0, minLength)
    .map((myTopic, index) => {
      const partnerTopic = partnerMeishi.topics[index];
      const isMatch = myTopic.agrees === partnerTopic.agrees;

      return {
        topicText: myTopic.topic.text,
        category: myTopic.topic.category,
        myStance: myTopic.agrees,
        partnerStance: partnerTopic.agrees,
        isMatch,
      };
    });

  const matchCount = matches.filter((m) => m.isMatch).length;

  return {
    myMeishi,
    partnerMeishi,
    matches,
    matchCount,
    mismatchCount: matches.length - matchCount,
  };
};
