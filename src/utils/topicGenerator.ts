import type { GenerateTopicsResponse, Topic } from "../types";
import { buildBackendUrl } from "./backendUrl";

const CATEGORY_LABELS = ["食文化", "習慣", "ことば", "くらし", "地元あるある"];

const FALLBACK_PATTERNS = [
  "{prefecture}では、お好み焼き定食はアリ",
  "{prefecture}の人は、地元チェーンの話になると急に熱量が上がる",
  "{prefecture}では、方言を少し混ぜたほうが親しみやすい",
  "都会より田舎の方が住みやすい",
  "{prefecture}では、有名スポットを日常使いしている感覚がある",
];

function buildFallbackTopics(prefecture: string): ReadonlyArray<Topic> {
  return FALLBACK_PATTERNS.map((pattern, index) => ({
    id: `${prefecture}-${index + 1}`,
    text: pattern.replaceAll("{prefecture}", prefecture),
    category: CATEGORY_LABELS[index % CATEGORY_LABELS.length],
  }));
}

export async function generateTopics(prefecture: string): Promise<GenerateTopicsResponse> {
  try {
    const response = await fetch(buildBackendUrl("/api/generate-topics"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefecture }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate topics: ${response.status}`);
    }

    const data = (await response.json()) as GenerateTopicsResponse;

    if (!Array.isArray(data.topics) || data.topics.length === 0) {
      throw new Error("No topics returned");
    }

    return data;
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    return {
      prefecture,
      topics: buildFallbackTopics(prefecture),
    };
  }
}
