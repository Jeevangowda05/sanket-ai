"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { buildFeatureVector } from "@/lib/mediapipe/normalize";
import type { FrameV1, RawLandmark, TrackerSnapshot } from "@/lib/mediapipe/schema";

export type TrackerStatus = "unavailable" | "loading" | "ready" | "processing" | "error" | "stopped";

const HAND_MODEL_URL = process.env.NEXT_PUBLIC_MEDIAPIPE_HAND_MODEL_URL ?? "";
const POSE_MODEL_URL = process.env.NEXT_PUBLIC_MEDIAPIPE_POSE_MODEL_URL ?? "";
const FACE_MODEL_URL = process.env.NEXT_PUBLIC_MEDIAPIPE_FACE_MODEL_URL ?? "";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";

interface LandmarkerHandles {
  hand: { detectForVideo: (video: HTMLVideoElement, now: number) => unknown } | null;
  pose: { detectForVideo: (video: HTMLVideoElement, now: number) => unknown } | null;
  face: { detectForVideo: (video: HTMLVideoElement, now: number) => unknown } | null;
  closeAll: () => void;
}

function toRawList(points: unknown): RawLandmark[] | null {
  if (!Array.isArray(points)) {
    return null;
  }
  const out: RawLandmark[] = [];
  for (const point of points) {
    if (!point || typeof point !== "object") {
      return null;
    }
    const record = point as Record<string, unknown>;
    if (typeof record.x !== "number" || typeof record.y !== "number") {
      return null;
    }
    out.push({
      x: record.x,
      y: record.y,
      z: typeof record.z === "number" ? record.z : 0,
      visibility: typeof record.visibility === "number" ? record.visibility : undefined,
    });
  }
  return out;
}

export interface TrackerFrame {
  snapshot: TrackerSnapshot;
  frame: FrameV1;
}

export function useMediaPipeTracker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onFrame?: (result: TrackerFrame) => void,
) {
  const [status, setStatus] = useState<TrackerStatus>("unavailable");
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<TrackerSnapshot | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const handlesRef = useRef<LandmarkerHandles | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const framesRef = useRef(0);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  const cleanup = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    handlesRef.current?.closeAll();
    handlesRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!HAND_MODEL_URL && !POSE_MODEL_URL && !FACE_MODEL_URL) {
        setStatus("unavailable");
        return;
      }
      if (typeof window === "undefined" || typeof document === "undefined") {
        setStatus("unavailable");
        return;
      }
      setStatus("loading");
      setError(null);
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, HandLandmarker, PoseLandmarker, FaceLandmarker } = vision;
        const visionFiles = await FilesetResolver.forVisionTasks(WASM_URL);

        const hand = HAND_MODEL_URL
          ? await HandLandmarker.createFromOptions(visionFiles, {
              baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: "GPU" },
              runningMode: "VIDEO",
              numHands: 2,
            })
          : null;
        const pose = POSE_MODEL_URL
          ? await PoseLandmarker.createFromOptions(visionFiles, {
              baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: "GPU" },
              runningMode: "VIDEO",
            })
          : null;
        const face = FACE_MODEL_URL
          ? await FaceLandmarker.createFromOptions(visionFiles, {
              baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate: "GPU" },
              runningMode: "VIDEO",
              numFaces: 1,
            })
          : null;

        if (cancelled) {
          hand?.close();
          pose?.close();
          face?.close();
          return;
        }
        handlesRef.current = {
          hand,
          pose,
          face,
          closeAll: () => {
            hand?.close();
            pose?.close();
            face?.close();
          },
        };
        setStatus("ready");
      } catch (caught) {
        if (cancelled) {
          return;
        }
        const message = caught instanceof Error ? caught.message : "Failed to load MediaPipe models.";
        setError(message);
        setStatus("error");
      }
    }

    void init();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cleanup]);

  const start = useCallback(() => {
    const handles = handlesRef.current;
    if (!handles || (!handles.hand && !handles.pose && !handles.face)) {
      return;
    }
    if (runningRef.current) {
      return;
    }
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    framesRef.current = 0;
    setStatus("processing");
    setError(null);

    const loop = () => {
      if (!runningRef.current) {
        return;
      }
      const video = videoRef.current;
      const now = performance.now();
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const handResult = handles.hand
            ? (handles.hand.detectForVideo(video, now) as {
                landmarks?: unknown[];
                handedness?: Array<Array<{ categoryName?: string }>>;
              })
            : null;
          const poseResult = handles.pose
            ? (handles.pose.detectForVideo(video, now) as { landmarks?: unknown[] })
            : null;
          const faceResult = handles.face
            ? (handles.face.detectForVideo(video, now) as { faceLandmarks?: unknown[] })
            : null;

          let leftHand: RawLandmark[] | null = null;
          let rightHand: RawLandmark[] | null = null;
          const handLists = handResult?.landmarks;
          const handed = handResult?.handedness;
          if (Array.isArray(handLists)) {
            for (let i = 0; i < handLists.length; i += 1) {
              const list = toRawList(handLists[i]);
              const label = handed?.[i]?.[0]?.categoryName;
              if (label === "Left") {
                leftHand = list;
              } else if (label === "Right") {
                rightHand = list;
              } else if (!leftHand) {
                leftHand = list;
              } else if (!rightHand) {
                rightHand = list;
              }
            }
          }

          const poseLists = poseResult?.landmarks;
          const pose = Array.isArray(poseLists) && poseLists.length > 0 ? toRawList(poseLists[0]) : null;
          const faceLists = faceResult?.faceLandmarks;
          const face = Array.isArray(faceLists) && faceLists.length > 0 ? toRawList(faceLists[0]) : null;

          const next: TrackerSnapshot = { leftHand, rightHand, pose, face };
          const timestampMs = Math.floor(video.currentTime * 1000);
          const frame = buildFeatureVector(next, timestampMs);
          setSnapshot(next);
          onFrameRef.current?.({ snapshot: next, frame });

          framesRef.current += 1;
          const elapsed = now - lastTimeRef.current;
          if (elapsed >= 1000) {
            setFps(Math.round((framesRef.current * 1000) / elapsed));
            framesRef.current = 0;
            lastTimeRef.current = now;
          }
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "Tracker processing error.";
          setError(message);
          setStatus("error");
          runningRef.current = false;
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setStatus((current) => (current === "processing" ? "stopped" : current));
  }, []);

  return { status, error, snapshot, fps, start, stop };
}
