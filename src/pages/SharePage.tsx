import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toShareUrl } from "../utils/meishiEncoder";
import type { MeishiData } from "../types";

export function SharePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const meishi = location.state?.meishi as MeishiData | undefined;

  const shareUrl = meishi ? toShareUrl(meishi) : "";

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
      <div className="px-6 pt-5 pb-1 text-center">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">名刺を共有</span>
      </div>
      <p className="mb-6 text-center text-sm font-medium text-[#888]">
        QRコードを相手に見せてね
      </p>

      <div className="mx-5 mb-6 flex justify-center rounded-2xl border border-[#ececea] bg-white p-8">
        <QRCodeSVG
          value={shareUrl}
          size={240}
          level="M"
          includeMargin
        />
      </div>

      <div className="mx-5">
        <button
          onClick={() => navigate("/preview")}
          className="w-full rounded-2xl border border-[#e0e0dc] bg-white px-4 py-4 text-[15px] font-semibold text-[#555] transition active:scale-[0.98]"
        >
          名刺に戻る
        </button>
      </div>
    </div>
  );
}
