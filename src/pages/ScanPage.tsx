import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { decode } from "../utils/meishiEncoder";
import { savePartnerMeishi, loadMyMeishi } from "../utils/appStorage";

type ScanState = "ready" | "scanning" | "success" | "error";

export function ScanPage() {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState<ScanState>("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;

    setScanState("scanning");
    setErrorMessage("");

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          void handleScanResult(decodedText);
        },
        () => {
          // scan miss - ignore
        },
      );
    } catch {
      setScanState("error");
      setErrorMessage("カメラを起動できませんでした。カメラの許可を確認してください。");
    }
  };

  const handleScanResult = async (url: string) => {
    await stopScanner();

    try {
      const urlObj = new URL(url);
      const encoded = urlObj.searchParams.get("d");
      if (!encoded) {
        setScanState("error");
        setErrorMessage("名刺データが含まれていないQRコードです");
        return;
      }

      const partnerMeishi = decode(encoded);
      savePartnerMeishi(partnerMeishi);
      setScanState("success");

      const myMeishi = loadMyMeishi();
      if (myMeishi) {
        navigate("/comparison", {
          state: { myMeishi, partnerMeishi },
        });
      } else {
        navigate("/");
      }
    } catch {
      setScanState("error");
      setErrorMessage("QRコードの読み取りに失敗しました");
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <div className="mx-auto max-w-[420px] pb-8">
      <div className="px-6 pt-5 pb-1 text-center">
        <span className="text-[17px] font-semibold text-[#1a1a1a]">QRコード読み取り</span>
      </div>
      <p className="mb-6 text-center text-sm font-medium text-[#888]">
        相手の名刺カード裏面を読み取ってね
      </p>

      <div className="mx-5 mb-4 overflow-hidden rounded-2xl border border-[#ececea] bg-white">
        <div id="qr-reader" ref={containerRef} />
      </div>

      {scanState === "error" && (
        <div className="mx-5 mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-5">
        {scanState === "ready" && (
          <button
            type="button"
            onClick={() => void startScanner()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
          >
            カメラを起動する
          </button>
        )}

        {scanState === "error" && (
          <button
            type="button"
            onClick={() => void startScanner()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#e85d3a] px-4 py-4 text-[15px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
          >
            もう一度試す
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            void stopScanner();
            navigate("/preview");
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#e0e0dc] bg-white px-4 py-3.5 text-[14px] font-semibold text-[#555] transition active:scale-[0.98]"
        >
          名刺に戻る
        </button>
      </div>
    </div>
  );
}
