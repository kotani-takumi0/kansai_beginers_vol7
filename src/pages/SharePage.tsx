import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

export function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const meishi = location.state?.meishi as MeishiData | undefined;
  const [copied, setCopied] = useState(false);

  const shareUrl = meishi ? toShareUrl(meishi) : "";

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share || !shareUrl) return;
    try {
      await navigator.share({
        title: "地元名刺",
        text: `${meishi?.prefecture}の地元名刺を見てね！`,
        url: shareUrl,
      });
    } catch {
      // ユーザーがキャンセルした場合は何もしない
    }
  }, [shareUrl, meishi?.prefecture]);

  if (!meishi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-gray-600 text-lg mb-4">名刺データがありません</p>
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
      <h1 className="text-2xl font-bold mb-2">名刺を共有しよう</h1>
      <p className="text-gray-500 text-sm mb-8">
        QRコードを見せるか、URLを送ってね
      </p>

      {/* QRコード */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <QRCodeSVG
          value={shareUrl}
          size={220}
          level="M"
          includeMargin
        />
      </div>

      {/* 共有URL表示 & コピー */}
      <div className="w-full mb-6">
        <div
          onClick={handleCopy}
          className="w-full p-4 bg-gray-100 rounded-xl text-sm text-gray-700 break-all cursor-pointer hover:bg-gray-200 transition-colors"
        >
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`w-full mt-3 py-3 rounded-xl font-bold text-white transition-colors ${
            copied ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {copied ? "コピーしました！" : "URLをコピー"}
        </button>
      </div>

      {/* ネイティブ共有（対応端末のみ） */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold mb-6 transition-colors"
        >
          共有メニューで送る
        </button>
      )}

      {/* トップに戻る */}
      <button
        onClick={() => navigate("/")}
        className="w-full py-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
      >
        トップに戻る
      </button>
    </div>
  );
}
