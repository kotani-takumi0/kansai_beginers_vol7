/** AI が生成する議論ネタ */
export interface Topic {
  readonly id: string;
  readonly text: string;
  readonly category: string;
}

/** ネタ＋ユーザーの立場 */
export interface TopicWithStance {
  readonly topic: Topic;
  readonly agrees: boolean;
}

/** 名刺データ */
export interface MeishiData {
  readonly id: string;
  readonly name?: string;
  readonly prefecture: string;
  readonly topics: ReadonlyArray<TopicWithStance>;
  readonly createdAt: string; // ISO 8601
}

/** ネタごとの比較結果 */
export interface TopicMatch {
  readonly topicText: string;
  readonly category: string;
  readonly myStance: boolean;
  readonly partnerStance: boolean;
  readonly isMatch: boolean;
}

/** 2人の名刺比較結果 */
export interface ComparisonResult {
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly matches: ReadonlyArray<TopicMatch>;
  readonly matchCount: number;
  readonly mismatchCount: number;
}

/** 交換履歴 */
export interface ExchangeHistoryEntry {
  readonly id: string;
  readonly exchangedAt: string; // ISO 8601
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly matchCount: number;
  readonly mismatchCount: number;
}

/** AI ネタ生成APIのレスポンス */
export interface GenerateTopicsResponse {
  readonly topics: ReadonlyArray<Topic>;
  readonly prefecture: string;
}
