import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

function resetCopiedState(setCopied: (value: boolean) => void) {
  setCopied(true);
  window.setTimeout(() => setCopied(false), 2000);
}

function fallbackCopyToClipboard(text: string): boolean {
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    return false;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "absolute";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const meishi = location.state?.meishi as MeishiData | undefined;
  const [copied, setCopied] = useState(false);

  const shareUrl = meishi ? toShareUrl(meishi) : "";
  const shareText = meishi ? `${meishi.prefecture}の地元名刺を見てね！` : "";

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      resetCopiedState(setCopied);
    } catch {
      if (fallbackCopyToClipboard(shareUrl)) {
        resetCopiedState(setCopied);
      }
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!shareUrl) return;

    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      await handleCopy();
      return;
    }

    try {
      const shareData = {
        title: "地元名刺",
        text: shareText,
        url: shareUrl,
      };

      if (
        typeof navigator.canShare === "function" &&
        !navigator.canShare({ url: shareUrl })
      ) {
        await handleCopy();
        return;
      }

      await navigator.share(shareData);
    } catch {
      await handleCopy();
    }
  }, [handleCopy, shareText, shareUrl]);

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

      {/* 交換画面への導線 */}
      <button
        onClick={() => navigate("/exchange", { state: { meishi } })}
        className="w-full py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-bold hover:bg-blue-50 transition-colors"
      >
        ぶつけて交換する
      </button>
    </div>
  );
}
