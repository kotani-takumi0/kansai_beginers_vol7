import type { ExchangeHistoryEntry, MeishiData, TopicWithStance, ShockReaction } from "../types";

const SHOCK_REACTIONS_KEY = "jimoto:shockReactions";

const PREFECTURE_KEY = "jimoto:selectedPrefecture";
const NAME_KEY = "jimoto:selectedName";
const TOPICS_KEY = "jimoto:selectedTopics";
const PARTNER_MEISHI_KEY = "jimoto:partnerMeishi";
const MY_MEISHI_KEY = "jimoto:myMeishi";
const EXCHANGE_HISTORY_KEY = "jimoto:exchangeHistory";
const COMPARISON_STATE_KEY = "jimoto:comparisonState";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveSelectedPrefecture(prefecture: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(PREFECTURE_KEY, prefecture);
}

export function saveSelectedName(name: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(NAME_KEY, name);
}

export function loadSelectedName(): string {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(NAME_KEY) ?? "";
}

export function loadSelectedPrefecture(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(PREFECTURE_KEY);
}

export function saveSelectedTopics(topics: ReadonlyArray<TopicWithStance>) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}

export function loadSelectedTopics(): ReadonlyArray<TopicWithStance> {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.sessionStorage.getItem(TOPICS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ReadonlyArray<TopicWithStance>;
  } catch {
    return [];
  }
}

export function savePartnerMeishi(meishi: MeishiData) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(PARTNER_MEISHI_KEY, JSON.stringify(meishi));
}

export function loadPartnerMeishi(): MeishiData | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PARTNER_MEISHI_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MeishiData;
  } catch {
    return null;
  }
}

export function clearPartnerMeishi() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(PARTNER_MEISHI_KEY);
}

export function saveMyMeishi(meishi: MeishiData) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(MY_MEISHI_KEY, JSON.stringify(meishi));
}

export function clearMyMeishi() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(MY_MEISHI_KEY);
}

export function loadMyMeishi(): MeishiData | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(MY_MEISHI_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MeishiData;
  } catch {
    return null;
  }
}

export function saveExchangeHistoryEntry(entry: ExchangeHistoryEntry) {
  if (!isBrowser()) {
    return;
  }

  const currentHistory = loadExchangeHistory().filter((item) => item.id !== entry.id);
  const nextHistory = [entry, ...currentHistory].slice(0, 20);
  window.localStorage.setItem(EXCHANGE_HISTORY_KEY, JSON.stringify(nextHistory));
}

export function loadExchangeHistory(): ReadonlyArray<ExchangeHistoryEntry> {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(EXCHANGE_HISTORY_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ReadonlyArray<ExchangeHistoryEntry>;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveShockReactions(reactions: ReadonlyArray<ShockReaction>) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(SHOCK_REACTIONS_KEY, JSON.stringify(reactions));
}

export function loadShockReactions(): ReadonlyArray<ShockReaction> {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.sessionStorage.getItem(SHOCK_REACTIONS_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ReadonlyArray<ShockReaction>;
  } catch {
    return [];
  }
}

export function saveComparisonState(myMeishi: MeishiData, partnerMeishi: MeishiData) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    COMPARISON_STATE_KEY,
    JSON.stringify({ myMeishi, partnerMeishi }),
  );
}

export function loadComparisonState(): { myMeishi: MeishiData; partnerMeishi: MeishiData } | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(COMPARISON_STATE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { myMeishi: MeishiData; partnerMeishi: MeishiData };
    if (parsed.myMeishi && parsed.partnerMeishi) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearComparisonState() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(COMPARISON_STATE_KEY);
}
