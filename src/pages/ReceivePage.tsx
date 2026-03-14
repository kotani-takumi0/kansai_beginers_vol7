import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { decode } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

export function ReceivePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { meishi, error } = useMemo(() => {
    const encoded = searchParams.get("d");
    if (!encoded) {
      return { meishi: null, error: "共有データが見つかりません" };
    }
    try {
      const decoded = decode(encoded);
      return { meishi: decoded as MeishiData, error: null };
    } catch {
      return { meishi: null, error: "名刺データの読み取りに失敗しました" };
    }
  }, [searchParams]);

  if (error || !meishi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-red-500 text-lg font-bold mb-2">エラー</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
        >
          自分の名刺を作る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">名刺が届きました！</h1>
      <p className="text-gray-500 text-sm mb-8">
        {meishi.prefecture}の人から名刺が届いたよ
      </p>

      {/* 受信した名刺カード */}
      <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
            {meishi.prefecture}
          </span>
        </div>

        <ul className="space-y-3">
          {meishi.topics.map((item) => (
            <li
              key={item.topic.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">
                  {item.topic.category}
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {item.topic.text}
                </p>
              </div>
              <span
                className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                  item.agrees
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.agrees ? "同意" : "反対"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 自分の名刺作成への誘導 */}
      <button
        onClick={() =>
          navigate("/", { state: { partnerMeishi: meishi } })
        }
        className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-colors mb-4"
      >
        自分の名刺も作る
      </button>
      <p className="text-gray-400 text-xs text-center">
        名刺を作ると、2人の名刺を比較できるよ！
      </p>
    </div>
  );
}
