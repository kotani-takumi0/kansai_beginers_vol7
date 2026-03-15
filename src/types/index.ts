/** 名刺データ（シンプル版） */
export interface MeishiData {
  readonly id: string;
  readonly name: string;
  readonly prefecture: string;
  readonly createdAt: string; // ISO 8601
}

/** AIが生成した話題 */
export interface ConversationTopic {
  readonly id: string;
  readonly text: string;
  readonly emoji: string;
}

/** 交換履歴 */
export interface ExchangeHistoryEntry {
  readonly id: string;
  readonly exchangedAt: string; // ISO 8601
  readonly myMeishi: MeishiData;
  readonly partnerMeishi: MeishiData;
  readonly topics: ReadonlyArray<ConversationTopic>;
}
