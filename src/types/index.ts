/** カードデータ（シンプル版） */
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

/** 認証済みユーザー */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly createdAt: string;
}

/** クライアントが保持する認証セッション */
export interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
}

/** 認証APIレスポンス */
export interface AuthResponse {
  readonly token: string;
  readonly user: AuthUser;
}
