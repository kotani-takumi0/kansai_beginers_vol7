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
        navigate("/topics", {
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
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] pb-8 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-[-110px] left-[-70px] h-60 w-60 rounded-full bg-[#ffe09a]" />
        <div className="absolute top-44 right-[-90px] h-64 w-64 rounded-full bg-[#ffd7b5]" />
        <div className="absolute bottom-20 left-[-100px] h-72 w-72 rounded-full bg-[#bde0c5]" />
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">SCAN QR</p>
            <h1 className="mt-1 text-[27px] font-black leading-tight">名刺を読み取る</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              相手のQRコードをカメラで読み取ってね
            </p>
          </div>
        </section>

        <div className="overflow-hidden rounded-[24px] border-[3px] border-[#744b2e] bg-white shadow-[0_6px_0_#d2b17e]">
          <div id="qr-reader" ref={containerRef} />
        </div>

        {scanState === "error" && (
          <div className="rounded-[24px] border-[3px] border-red-300 bg-red-50 p-4 text-center">
            <p className="text-sm font-bold text-red-600">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {scanState === "ready" && (
            <button
              type="button"
              onClick={() => void startScanner()}
              className="w-full rounded-[24px] border-[3px] border-[#744b2e] bg-[#d94841] px-5 py-4 text-[16px] font-black text-white shadow-[0_6px_0_#8e2a24] transition active:translate-y-[2px] active:shadow-[0_3px_0_#8e2a24]"
            >
              カメラを起動する
            </button>
          )}

          {scanState === "error" && (
            <button
              type="button"
              onClick={() => void startScanner()}
              className="w-full rounded-[24px] border-[3px] border-[#744b2e] bg-[#d94841] px-5 py-4 text-[16px] font-black text-white shadow-[0_6px_0_#8e2a24] transition active:translate-y-[2px] active:shadow-[0_3px_0_#8e2a24]"
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
            className="w-full rounded-[24px] border-[3px] border-[#d5b98b] bg-white px-5 py-4 text-[16px] font-black text-[#744b2e] shadow-[0_6px_0_#ead3ac] transition active:translate-y-[2px] active:shadow-[0_3px_0_#ead3ac]"
          >
            名刺に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
