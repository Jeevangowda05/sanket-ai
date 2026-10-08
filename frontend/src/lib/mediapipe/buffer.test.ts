import { describe, expect, it } from "vitest";

import { RollingBuffer } from "@/lib/mediapipe/buffer";
import type { FrameV1 } from "@/lib/mediapipe/schema";
import { isLiveOutgoingMessage } from "@/lib/validation";

function frame(timestamp_ms: number): FrameV1 {
  return {
    timestamp_ms,
    features: new Array(258).fill(0),
    missing: { leftHand: true, rightHand: true, pose: true },
  };
}

describe("rolling temporal buffer", () => {
  it("caps length and returns the latest window", () => {
    const buffer = new RollingBuffer(45);
    for (let i = 0; i < 60; i += 1) {
      buffer.push(frame(i));
    }
    expect(buffer.size).toBe(45);
    const window = buffer.window(30);
    expect(window).toHaveLength(30);
    expect(window[0].timestamp_ms).toBe(30);
    expect(window[29].timestamp_ms).toBe(59);
  });

  it("clears without classifying a single frame", () => {
    const buffer = new RollingBuffer(45);
    buffer.push(frame(1));
    expect(buffer.size).toBe(1);
    buffer.clear();
    expect(buffer.size).toBe(0);
    expect(buffer.window(30)).toEqual([]);
  });
});

describe("live payload guards", () => {
  it("rejects malformed backend messages", () => {
    expect(isLiveOutgoingMessage(null)).toBe(false);
    expect(isLiveOutgoingMessage({ type: "prediction" })).toBe(false);
    expect(isLiveOutgoingMessage({ type: "prediction", status: "available" })).toBe(false);
    expect(
      isLiveOutgoingMessage({ type: "prediction", status: "available", message: "ok" }),
    ).toBe(true);
  });

  it("keeps sequence windows under the backend 240-frame limit", () => {
    const buffer = new RollingBuffer(45);
    for (let i = 0; i < 45; i += 1) {
      buffer.push(frame(i));
    }
    expect(buffer.window(30).length).toBeLessThanOrEqual(240);
  });
});
