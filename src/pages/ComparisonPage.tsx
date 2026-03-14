import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { compareMeishi } from "../utils/comparison";
import type { MeishiData, TopicMatch } from "../types";

const MATCH_MESSAGES = [
  "お前もそうなん！",
  "わかるわ〜！",
  "それな！",
  "仲間やん！",
  "せやせや！",
] as const;

const MISMATCH_MESSAGES = [
  "え、マジで！？",
  "嘘やろ！？",
  "そっち派なん！？",
  "信じられへん！",
  "ここ議論やな！",
] as const;

const pickMessage = (messages: ReadonlyArray<string>, index: number): string =>
  messages[index % messages.length];

function TopicMatchCard({
  match,
  index,
}: {
  readonly match: TopicMatch;
  readonly index: number;
}) {
  const message = match.isMatch
    ? pickMessage(MATCH_MESSAGES, index)
    : pickMessage(MISMATCH_MESSAGES, index);

  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        match.isMatch
          ? "border-green-300 bg-green-50"
          : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{match.category}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            match.isMatch
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {match.isMatch ? "一致" : "不一致"}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-800 mb-3">
        {match.topicText}
      </p>

      <div className="flex gap-3 mb-2">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400 mb-1">自分</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              match.myStance
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {match.myStance ? "同意" : "反対"}
          </span>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400 mb-1">相手</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              match.partnerStance
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {match.partnerStance ? "同意" : "反対"}
          </span>
        </div>
      </div>

      <p className="text-center text-sm font-bold mt-2" data-testid="match-message">
        {message}
      </p>
    </div>
  );
}

export function ComparisonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const myMeishi = location.state?.myMeishi as MeishiData | undefined;
  const partnerMeishi = location.state?.partnerMeishi as
    | MeishiData
    | undefined;

  const result = useMemo(() => {
    if (!myMeishi || !partnerMeishi) return null;
    return compareMeishi(myMeishi, partnerMeishi);
  }, [myMeishi, partnerMeishi]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-gray-600 text-lg mb-4">比較データがありません</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
        >
          名刺を作る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">比較結果</h1>

      {/* サマリー */}
      <div className="flex gap-4 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
          <span className="text-green-700 font-bold text-xl">
            {result.matchCount}
          </span>
          <span className="text-green-600 text-sm">一致</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-xl">
          <span className="text-red-700 font-bold text-xl">
            {result.mismatchCount}
          </span>
          <span className="text-red-600 text-sm">不一致</span>
        </div>
      </div>

      {/* 出身地表示 */}
      <div className="flex gap-4 mb-6 w-full">
        <div className="flex-1 text-center">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
            {result.myMeishi.prefecture}
          </span>
        </div>
        <div className="flex-1 text-center">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
            {result.partnerMeishi.prefecture}
          </span>
        </div>
      </div>

      {/* 各ネタの比較 */}
      <div className="w-full space-y-4 mb-8">
        {result.matches.map((match, index) => (
          <TopicMatchCard key={match.topicText} match={match} index={index} />
        ))}
      </div>

      {/* もう一度 */}
      <button
        onClick={() => navigate("/")}
        className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-bold hover:bg-blue-50 transition-colors"
      >
        もう一度名刺を作る
      </button>
    </div>
  );
}
