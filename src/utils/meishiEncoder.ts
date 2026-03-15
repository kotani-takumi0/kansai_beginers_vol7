import type { MeishiData } from "../types";

/** カードデータをURLセーフなBase64文字列にエンコード */
export function encode(data: MeishiData): string {
  const json = JSON.stringify(data);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** URLセーフBase64文字列からカードデータを復元 */
export function decode(encoded: string): MeishiData {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const json = decodeURIComponent(escape(atob(padded)));
  return JSON.parse(json) as MeishiData;
}

/** カードデータを含む共有用URLを生成 */
export function toShareUrl(data: MeishiData): string {
  const encoded = encode(data);
  return `${window.location.origin}/receive?d=${encoded}`;
}
