import {
  FEATURE_COUNT,
  LEFT_HAND_COUNT,
  LEFT_SHOULDER_INDEX,
  POSE_COUNT,
  RIGHT_HAND_COUNT,
  RIGHT_SHOULDER_INDEX,
  type MissingFlags,
  type RawLandmark,
  type TrackerSnapshot,
} from "@/lib/mediapipe/schema";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clean(value: unknown): number {
  return isFiniteNumber(value) ? (value as number) : 0;
}

function handToRelative(hand: RawLandmark[] | null, count: number): { values: number[]; missing: boolean } {
  if (!hand || hand.length < count) {
    return { values: new Array(count * 3).fill(0), missing: true };
  }
  const wrist = hand[0];
  const ox = clean(wrist?.x);
  const oy = clean(wrist?.y);
  const oz = clean(wrist?.z);
  const values: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const point = hand[i] ?? { x: 0, y: 0, z: 0 };
    values.push(clean(point.x) - ox, clean(point.y) - oy, clean(point.z) - oz);
  }
  return { values, missing: false };
}

function poseAnchors(pose: RawLandmark[]): { ox: number; oy: number; scale: number } | null {
  const left = pose[LEFT_SHOULDER_INDEX];
  const right = pose[RIGHT_SHOULDER_INDEX];
  if (!left || !right) {
    return null;
  }
  if (!isFiniteNumber(left.x) || !isFiniteNumber(left.y) || !isFiniteNumber(right.x) || !isFiniteNumber(right.y)) {
    return null;
  }
  const ox = (left.x + right.x) / 2;
  const oy = (left.y + right.y) / 2;
  const scale = Math.hypot(left.x - right.x, left.y - right.y);
  if (!Number.isFinite(scale) || scale < 1e-6) {
    return null;
  }
  return { ox, oy, scale };
}

/**
 * Build a 258-float v1 feature vector.
 * - Pose available: hands + pose xyz normalized relative to mid-shoulders,
 *   scaled by shoulder width. Pose visibility passed through (0 when unknown).
 * - Pose missing: each present hand falls back to wrist-relative coordinates;
 *   missing parts are zero-filled with missing flags set.
 * Never fabricates landmarks: absent input always yields zeros + flags.
 */
export function buildFeatureVector(
  snapshot: TrackerSnapshot,
  timestampMs: number,
): { timestamp_ms: number; features: number[]; missing: MissingFlags } {
  const timestamp_ms = Number.isFinite(timestampMs) && timestampMs >= 0 ? Math.floor(timestampMs) : 0;
  const poseValid = !!snapshot.pose && snapshot.pose.length >= POSE_COUNT;
  const anchors = poseValid ? poseAnchors(snapshot.pose as RawLandmark[]) : null;

  const missing: MissingFlags = {
    leftHand: !snapshot.leftHand || snapshot.leftHand.length < LEFT_HAND_COUNT,
    rightHand: !snapshot.rightHand || snapshot.rightHand.length < RIGHT_HAND_COUNT,
    pose: !poseValid,
  };

  let leftValues: number[];
  let rightValues: number[];
  let poseValues: number[];

  if (anchors) {
    const normalizeHand = (hand: RawLandmark[] | null): number[] => {
      if (!hand || hand.length < LEFT_HAND_COUNT) {
        return new Array(LEFT_HAND_COUNT * 3).fill(0);
      }
      const out: number[] = [];
      for (let i = 0; i < LEFT_HAND_COUNT; i += 1) {
        const point = hand[i] ?? { x: 0, y: 0, z: 0 };
        out.push(
          (clean(point.x) - anchors.ox) / anchors.scale,
          (clean(point.y) - anchors.oy) / anchors.scale,
          clean(point.z) / anchors.scale,
        );
      }
      return out;
    };
    leftValues = normalizeHand(snapshot.leftHand);
    rightValues = normalizeHand(snapshot.rightHand);

    poseValues = [];
    const pose = snapshot.pose as RawLandmark[];
    for (let i = 0; i < POSE_COUNT; i += 1) {
      const point = pose[i] ?? { x: 0, y: 0, z: 0 };
      poseValues.push(
        (clean(point.x) - anchors.ox) / anchors.scale,
        (clean(point.y) - anchors.oy) / anchors.scale,
        clean(point.z) / anchors.scale,
        isFiniteNumber(point.visibility) ? Math.min(1, Math.max(0, point.visibility as number)) : 0,
      );
    }
  } else {
    leftValues = handToRelative(snapshot.leftHand, LEFT_HAND_COUNT).values;
    rightValues = handToRelative(snapshot.rightHand, RIGHT_HAND_COUNT).values;
    poseValues = new Array(POSE_COUNT * 4).fill(0);
  }

  const features = [...leftValues, ...rightValues, ...poseValues];

  if (features.length !== FEATURE_COUNT) {
    throw new Error(`v1 feature vector must have ${FEATURE_COUNT} entries, got ${features.length}.`);
  }

  return { timestamp_ms, features, missing };
}
