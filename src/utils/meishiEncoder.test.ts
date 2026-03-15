import { describe, it, expect } from "vitest";
import { encode, decode } from "./meishiEncoder";
import type { MeishiData } from "../types";

const sampleMeishi: MeishiData = {
  id: "test-123",
  name: "たろう",
  prefecture: "大阪府",
  createdAt: "2026-03-14T00:00:00+09:00",
};

describe("meishiEncoder", () => {
  it("エンコード→デコードで元データと完全一致する", () => {
    const encoded = encode(sampleMeishi);
    const decoded = decode(encoded);
    expect(decoded).toEqual(sampleMeishi);
  });

  it("エンコード結果がURLセーフな文字列である", () => {
    const encoded = encode(sampleMeishi);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("日本語を含むデータが正しくエンコード・デコードされる", () => {
    const encoded = encode(sampleMeishi);
    const decoded = decode(encoded);
    expect(decoded.prefecture).toBe("大阪府");
    expect(decoded.name).toBe("たろう");
  });

  it("不正な文字列のデコードでエラーが発生する", () => {
    expect(() => decode("!!!invalid!!!")).toThrow();
  });
});
