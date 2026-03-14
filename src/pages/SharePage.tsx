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
      <div className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col items-center justify-center px-5">
        <div className="w-full rounded-2xl border border-[#ececea] bg-white p-6 text-center">
          <h2 className="text-lg font-bold text-[#1a1a1a]">名刺データがありません</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full rounded-xl bg-[#e85d3a] px-5 py-3.5 text-[15px] font-semibold text-white"
          >
            名刺を作る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[420px] pb-8">
      {/* Header */}
      <div className="px-6 pt-5 pb-1 text-center">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">名刺を共有</span>
      </div>
      <p className="mb-6 text-center text-sm font-medium text-[#888]">
        QRコードを見せるか、URLを送ってね
      </p>

      {/* QR Code */}
      <div className="mx-5 mb-4 flex justify-center rounded-2xl border border-[#ececea] bg-white p-6">
        <QRCodeSVG
          value={shareUrl}
          size={200}
          level="M"
          includeMargin
        />
      </div>

      {/* URL & Copy */}
      <div className="mx-5 mb-4 rounded-2xl border border-[#ececea] bg-white p-5">
        <h3 className="mb-3 text-base font-bold text-[#1a1a1a]">共有URL</h3>
        <div
          onClick={() => void handleCopy()}
          className="cursor-pointer rounded-xl bg-[#f8f8f6] p-3 text-[13px] leading-relaxed text-[#555] break-all transition hover:bg-[#f0f0ee]"
        >
          {shareUrl}
        </div>
        <button
          onClick={() => void handleCopy()}
          className={`mt-3 w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition ${
            copied ? "bg-emerald-500" : "bg-[#e85d3a]"
          }`}
        >
          {copied ? "コピーしました！" : "URLをコピー"}
        </button>
      </div>

      {/* Native share */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <div className="mx-5 mb-4">
          <button
            onClick={() => void handleNativeShare()}
            className="w-full rounded-2xl border border-[#e0e0dc] bg-white px-4 py-4 text-[15px] font-semibold text-[#e85d3a] transition"
          >
            共有メニューで送る
          </button>
        </div>
      )}

      {/* Back */}
      <div className="mx-5">
        <button
          onClick={() => navigate("/preview")}
          className="w-full rounded-2xl border border-[#e0e0dc] bg-white px-4 py-4 text-[15px] font-semibold text-[#555] transition"
        >
          名刺に戻る
        </button>
      </div>
    </div>
  );
}
