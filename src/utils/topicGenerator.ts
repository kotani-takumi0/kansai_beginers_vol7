import type { Topic } from "../types";
import { getTopicsForPrefecture } from "../data/prefectureTopics";

export function getTopics(prefecture: string): ReadonlyArray<Topic> {
  const topics = getTopicsForPrefecture(prefecture);

  if (!topics) {
    throw new Error(`未対応の都道府県です: ${prefecture}`);
  }

  return topics;
}
