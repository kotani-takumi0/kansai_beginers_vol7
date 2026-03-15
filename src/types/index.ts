/** 地元あるあるトピック */
export interface Topic {
  readonly id: string;
  readonly text: string;
  readonly category: string;
}

/** トピック＋ユーザーの回答（普通かどうか） */
export interface TopicWithStance {
  readonly topic: Topic;
  readonly isNormal: boolean;
}

/** 名刺データ */
export interface MeishiData {
  readonly id: string;
  readonly name?: string;
  readonly prefecture: string;
  readonly topics: ReadonlyArray<TopicWithStance>;
  readonly createdAt: string; // ISO 8601
}

/** ショックリアクション */
export interface ShockReaction {
  readonly topic: Topic;
  readonly isShocked: boolean;
}

/** 2人の名刺比較結果 */
export interface ComparisonResult {
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly reactions: ReadonlyArray<ShockReaction>;
  readonly shockCount: number;
  readonly knewItCount: number;
}

/** 交換履歴 */
export interface ExchangeHistoryEntry {
  readonly id: string;
  readonly exchangedAt: string; // ISO 8601
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly shockCount: number;
  readonly knewItCount: number;
}
