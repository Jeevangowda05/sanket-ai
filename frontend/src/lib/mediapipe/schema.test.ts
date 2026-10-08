import { describe, expect, it } from "vitest";

import { buildFeatureVector } from "@/lib/mediapipe/normalize";
import {
  FEATURE_COUNT,
  FEATURE_VERSION,
  LEFT_HAND_COUNT,
  POSE_COUNT,
  RIGHT_HAND_COUNT,
} from "@/lib/mediapipe/schema";

function hand(value: number) {
  return Array.from({ length: 21 }, (_, i) => ({ x: value + i * 0.001, y: value, z: 0 }));
}

function pose() {
  return Array.from({ length: 33 }, (_, i) => {
    if (i === 11) {
      return { x: 0.4, y: 0.5, z: 0, visibility: 0.9 };
    }
    if (i === 12) {
      return { x: 0.6, y: 0.5, z: 0, visibility: 0.9 };
    }
    return { x: 0.5, y: 0.5, z: 0, visibility: 0.8 };
  });
}

describe("v1 feature schema", () => {
  it("has frozen version and count", () => {
    expect(FEATURE_VERSION).toBe("v1");
    expect(FEATURE_COUNT).toBe(258);
    expect(LEFT_HAND_COUNT * 3 + RIGHT_HAND_COUNT * 3 + POSE_COUNT * 4).toBe(258);
  });

  it("normalizes relative to shoulder anchors when pose is present", () => {
    const result = buildFeatureVector(
      { leftHand: hand(0.45), rightHand: hand(0.55), pose: pose(), face: null },
      1000,
    );
    expect(result.features).toHaveLength(258);
    expect(result.timestamp_ms).toBe(1000);
    expect(result.missing).toEqual({ leftHand: false, rightHand: false, pose: false });
    for (const value of result.features) {
      expect(Number.isFinite(value)).toBe(true);
    }
    // Mid-shoulder origin (0.5, 0.5), scale 0.2: left-hand first x ≈ (0.45-0.5)/0.2.
    expect(result.features[0]).toBeCloseTo(-0.25, 5);
  });

  it("zero-fills missing parts with flags and never fabricates", () => {
    const result = buildFeatureVector({ leftHand: null, rightHand: null, pose: null, face: null }, 0);
    expect(result.features).toHaveLength(258);
    expect(result.features.every((value) => value === 0)).toBe(true);
    expect(result.missing).toEqual({ leftHand: true, rightHand: true, pose: true });
  });

  it("falls back to wrist-relative hands when pose is missing", () => {
    const result = buildFeatureVector({ leftHand: hand(0.3), rightHand: null, pose: null, face: null }, 42);
    expect(result.missing.pose).toBe(true);
    expect(result.missing.rightHand).toBe(true);
    // Wrist-relative: first left-hand point equals origin.
    expect(result.features[0]).toBe(0);
    expect(result.features[1]).toBe(0);
    expect(result.features[2]).toBe(0);
  });

  it("treats non-finite coordinates as missing data, not NaN", () => {
    const bad = [{ x: NaN, y: Infinity, z: 0 }];
    const result = buildFeatureVector({ leftHand: bad as never, rightHand: null, pose: null, face: null }, 7);
    expect(result.features.slice(0, 63).every((value) => Number.isFinite(value))).toBe(true);
  });

  it("builds native v1 wire frames with version, count, and timestamps", () => {
    const result = buildFeatureVector(
      { leftHand: hand(0.45), rightHand: hand(0.55), pose: pose(), face: null },
      1234,
    );
    const wireFrame = {
      timestamp_ms: result.timestamp_ms,
      feature_version: FEATURE_VERSION,
      feature_count: FEATURE_COUNT,
      features: result.features,
    };
    expect(wireFrame.features).toHaveLength(258);
    expect(wireFrame).toMatchObject({
      timestamp_ms: 1234,
      feature_version: "v1",
      feature_count: 258,
    });
    expect(wireFrame.features.every((value) => Number.isFinite(value))).toBe(true);
  });
});
