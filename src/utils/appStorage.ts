import type { MeishiData, TopicWithStance } from "../types";

const PREFECTURE_KEY = "jimoto:selectedPrefecture";
const TOPICS_KEY = "jimoto:selectedTopics";
const PARTNER_MEISHI_KEY = "jimoto:partnerMeishi";
const MY_MEISHI_KEY = "jimoto:myMeishi";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveSelectedPrefecture(prefecture: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(PREFECTURE_KEY, prefecture);
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
