/**
 * SANKET AI feature schema v1.
 *
 * Layout per frame (258 floats, row-major):
 * - [0:63]    left hand:  21 landmarks x (x, y, z)
 * - [63:126]  right hand: 21 landmarks x (x, y, z)
 * - [126:258] pose:       33 landmarks x (x, y, z, visibility)
 *
 * Face landmarks are tracked for optional overlay/diagnostics only and are
 * NEVER included in the TCN feature vector. This keeps `input_size: 258`
 * stable (see configs/model.example.yaml) until a deliberate v2 schema.
 */

export const FEATURE_VERSION = "v1" as const;
export const FEATURE_COUNT = 258 as const;

export const LEFT_HAND_COUNT = 21 as const;
export const RIGHT_HAND_COUNT = 21 as const;
export const POSE_COUNT = 33 as const;

export const LEFT_HAND_OFFSET = 0 as const;
export const RIGHT_HAND_OFFSET = 63 as const;
export const POSE_OFFSET = 126 as const;

/** Pose landmark indices used as stable body anchors (MediaPipe Pose). */
export const LEFT_SHOULDER_INDEX = 11 as const;
export const RIGHT_SHOULDER_INDEX = 12 as const;

export interface RawLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface TrackerSnapshot {
  leftHand: RawLandmark[] | null;
  rightHand: RawLandmark[] | null;
  /** 33 pose landmarks or null when pose is missing. */
  pose: RawLandmark[] | null;
  /** Overlay/diagnostics only. Excluded from the v1 feature vector. */
  face: RawLandmark[] | null;
}

export interface MissingFlags {
  leftHand: boolean;
  rightHand: boolean;
  pose: boolean;
}

export interface FrameV1 {
  timestamp_ms: number;
  features: number[];
  missing: MissingFlags;
}

export interface SequenceMetadata {
  feature_version: typeof FEATURE_VERSION;
  feature_count: typeof FEATURE_COUNT;
  frame_rate: number | null;
  window_size: number;
}
