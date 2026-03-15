import type { ExchangeHistoryEntry, MeishiData } from "../types";

const NAME_KEY = "jimoto:selectedName";
const MY_MEISHI_KEY = "jimoto:myMeishi";
const PARTNER_MEISHI_KEY = "jimoto:partnerMeishi";
const EXCHANGE_HISTORY_KEY = "jimoto:exchangeHistory";

function isBrowser() {
  return typeof window !== "undefined";
}

// --- 名前 ---

export function saveSelectedName(name: string) {
  if (isBrowser()) {
    window.localStorage.setItem(NAME_KEY, name);
  }
}

export function loadSelectedName(): string {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(NAME_KEY) ?? "";
}

// --- 自分の名刺 ---

export function saveMyMeishi(meishi: MeishiData) {
  if (isBrowser()) {
    window.localStorage.setItem(MY_MEISHI_KEY, JSON.stringify(meishi));
  }
}

export function loadMyMeishi(): MeishiData | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(MY_MEISHI_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MeishiData;
  } catch {
    return null;
  }
}

export function clearMyMeishi() {
  if (isBrowser()) {
    window.localStorage.removeItem(MY_MEISHI_KEY);
  }
}

// --- 相手の名刺 ---

export function savePartnerMeishi(meishi: MeishiData) {
  if (isBrowser()) {
    window.sessionStorage.setItem(PARTNER_MEISHI_KEY, JSON.stringify(meishi));
  }
}

export function loadPartnerMeishi(): MeishiData | null {
  if (!isBrowser()) return null;
  const raw = window.sessionStorage.getItem(PARTNER_MEISHI_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MeishiData;
  } catch {
    return null;
  }
}

export function clearPartnerMeishi() {
  if (isBrowser()) {
    window.sessionStorage.removeItem(PARTNER_MEISHI_KEY);
  }
}

// --- 交換履歴 ---

export function saveExchangeHistoryEntry(entry: ExchangeHistoryEntry) {
  if (!isBrowser()) return;
  const currentHistory = loadExchangeHistory().filter((item) => item.id !== entry.id);
  const nextHistory = [entry, ...currentHistory].slice(0, 20);
  window.localStorage.setItem(EXCHANGE_HISTORY_KEY, JSON.stringify(nextHistory));
}

export function loadExchangeHistory(): ReadonlyArray<ExchangeHistoryEntry> {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(EXCHANGE_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ReadonlyArray<ExchangeHistoryEntry>;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
