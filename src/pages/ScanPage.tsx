import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { decode } from "../utils/meishiEncoder";
import { savePartnerMeishi, loadMyMeishi } from "../utils/appStorage";

type ScanState = "ready" | "scanning" | "success" | "error";

const SCAN_STATUS = {
  ready: {
    label: "準備OK",
    accent: "#a54f23",
    background: "#fff3d1",
    title: "カメラを起動して交換スタート",
    description: "相手のQRコードを枠の中に入れると、自動で名刺を読み取ります。",
  },
  scanning: {
    label: "読み取り中",
    accent: "#0b6e4f",
    background: "#dff6e8",
    title: "QRコードをカメラの中心に合わせてください",
    description: "ピントが合うまで少し待つと読み取りやすくなります。",
  },
  success: {
    label: "受信完了",
    accent: "#0b6e4f",
    background: "#dff6e8",
    title: "名刺を受け取りました",
    description: "比較画面へ移動しています。",
  },
  error: {
    label: "再トライ",
    accent: "#b42318",
    background: "#fee4e2",
    title: "読み取りに失敗しました",
    description: "カメラの許可やQRコードの明るさ、距離を見直してください。",
  },
} as const;

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 4.8L19 8.6l-4 2.9L16.5 17 12 14.2 7.5 17 9 11.5 5 8.6l5.2-1.8L12 2Z" />
    </svg>
  );
}

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

  const status = SCAN_STATUS[scanState];

  return (
    <div
      className="relative min-h-full overflow-hidden bg-[#f7edd6] pb-24 text-[#3d2718]"
      style={{ fontFamily: '"Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute top-[-110px] left-[-80px] h-64 w-64 rounded-full bg-[#ffd879]" />
        <div className="absolute top-48 right-[-90px] h-72 w-72 rounded-full bg-[#ffd4b2]" />
        <div className="absolute bottom-10 left-[-100px] h-72 w-72 rounded-full bg-[#c8e6c9]" />
      </div>

      <div className="relative mx-auto flex max-w-[420px] flex-col gap-4 px-4 pt-4">
        <section className="overflow-hidden rounded-[28px] border-[3px] border-[#744b2e] bg-[#fff8df] shadow-[0_8px_0_#c77b30]">
          <div className="border-b-[3px] border-[#744b2e] bg-[linear-gradient(90deg,#d94841_0%,#ef8d32_52%,#ffd166_100%)] px-5 py-4 text-[#fffdf4]">
            <p className="text-[11px] font-black tracking-[0.28em]">SCAN STATION</p>
            <span className="mt-1 block text-[17px] font-semibold">QRコード読み取り</span>
            <h1 className="mt-1 text-[27px] font-black leading-tight">相手の地元名刺を受け取る</h1>
            <p className="mt-2 text-sm font-bold text-[#fff4dc]">
              名刺カードの裏面を読み取って、比較トークを始めよう。
            </p>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border-2 border-[#744b2e] bg-white shadow-[0_5px_0_#e7c58b]">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#fff3d1] text-[#a54f23]">
                <CameraIcon />
              </div>
            </div>
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black tracking-[0.16em]"
                style={{ backgroundColor: status.background, color: status.accent }}
              >
                <SparkIcon />
                {status.label}
              </div>
              <p className="mt-2 text-lg font-black text-[#3d2718]">{status.title}</p>
              <p className="mt-1 text-sm font-bold text-[#7c5a39]">{status.description}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border-[3px] border-[#744b2e] bg-[#fffdf6] p-4 shadow-[0_8px_0_#d2b17e]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">CAMERA VIEW</p>
              <p className="text-sm font-black text-[#3d2718]">枠の中にQRコードを入れてください</p>
            </div>
            <div className="rounded-full bg-[#fff3d1] px-3 py-1 text-[10px] font-black tracking-[0.14em] text-[#a54f23]">
              AUTO SCAN
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border-[3px] border-[#744b2e] bg-[#2f241a] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#5d4730_0%,#2f241a_55%,#21170f_100%)] px-2 py-2">
              <div className="pointer-events-none absolute inset-5 rounded-[28px] border-2 border-dashed border-[#fff8df]/70" />
              <div
                id="qr-reader"
                ref={containerRef}
                className="min-h-[300px] rounded-[16px] bg-black/15 [&_video]:min-h-[300px] [&_video]:w-full [&_video]:rounded-[12px] [&_video]:object-cover"
              />
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border-2 border-[#e3c68f] bg-[#fff7e7] p-4">
            <p className="text-xs font-black tracking-[0.18em] text-[#a54f23]">読み取りのコツ</p>
            <ul className="mt-2 space-y-2 text-sm font-bold text-[#6a4a2f]">
              <li>QRコード全体が見えるように、10〜20cmほど離す</li>
              <li>暗い場所では画面の明るさを上げて試す</li>
              <li>読み込めないときは名刺を少し傾けて反射を避ける</li>
            </ul>
          </div>
        </section>

        {scanState === "error" && (
          <div className="rounded-[24px] border-[3px] border-[#b42318] bg-[#fff1ef] px-4 py-4 shadow-[0_6px_0_#f2b8b5]">
            <p className="text-sm font-black text-[#b42318]">{errorMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(scanState === "ready" || scanState === "error") && (
            <button
              type="button"
              onClick={() => void startScanner()}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-[20px] border-[3px] border-[#744b2e] bg-[#e85d3a] px-4 py-4 text-[15px] font-black text-white shadow-[0_6px_0_#b94a26] transition active:translate-y-[2px] active:shadow-[0_3px_0_#b94a26]"
            >
              <CameraIcon />
              {scanState === "error" ? "もう一度スキャンする" : "カメラを起動する"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              void stopScanner();
              navigate("/preview");
            }}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-[20px] border-[3px] border-[#744b2e] bg-[#fffdf6] px-4 py-3.5 text-[14px] font-black text-[#6a4a2f] shadow-[0_6px_0_#d2b17e] transition active:translate-y-[2px] active:shadow-[0_3px_0_#d2b17e]"
          >
            名刺に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
