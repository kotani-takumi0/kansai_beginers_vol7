import type { TopicWithStance } from "../types";

const PREFECTURE_KEY = "jimoto:selectedPrefecture";
const TOPICS_KEY = "jimoto:selectedTopics";

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
