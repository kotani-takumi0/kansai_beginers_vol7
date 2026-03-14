// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { ExchangeAnimation } from "./ExchangeAnimation";
import type { MeishiData } from "../types";

const myMeishi: MeishiData = {
  id: "my-id",
  prefecture: "大阪府",
  topics: [
    {
      topic: { id: "1", text: "たこ焼きは主食", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

const partnerMeishi: MeishiData = {
  id: "partner-id",
  prefecture: "京都府",
  topics: [
    {
      topic: { id: "2", text: "おばんざいは最高", category: "食文化" },
      agrees: true,
    },
  ],
  createdAt: "2026-03-14T00:00:00.000Z",
};

describe("ExchangeAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("最初にインパクト演出を表示する", () => {
    const onComplete = vi.fn();
    render(
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={partnerMeishi}
        onComplete={onComplete}
      />
    );

    expect(document.querySelector("[data-stage='impact']")).not.toBeNull();
  });

  it("500ms後に通信中演出に遷移する", () => {
    const onComplete = vi.fn();
    render(
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={partnerMeishi}
        onComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(document.querySelector("[data-stage='connecting']")).not.toBeNull();
  });

  it("2500ms後に到着演出に遷移する", () => {
    const onComplete = vi.fn();
    render(
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={partnerMeishi}
        onComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(document.querySelector("[data-stage='arrival']")).not.toBeNull();
  });

  it("到着演出で相手の県名を表示する", () => {
    const onComplete = vi.fn();
    render(
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={partnerMeishi}
        onComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText("京都府")).toBeDefined();
  });

  it("4000ms後にonCompleteが呼ばれる", () => {
    const onComplete = vi.fn();
    render(
      <ExchangeAnimation
        myMeishi={myMeishi}
        partnerMeishi={partnerMeishi}
        onComplete={onComplete}
      />
    );

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
