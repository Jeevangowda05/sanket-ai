"use client";

import { useEffect, useRef } from "react";

import type { RawLandmark, TrackerSnapshot } from "@/lib/mediapipe/schema";

/** Sparse face subset for perf: contour + a few inner points, overlay only. */
const FACE_OVERLAY_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 33, 133, 159, 145, 362, 386, 374, 61, 291];

function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: RawLandmark[] | null,
  width: number,
  height: number,
  color: string,
  radius: number,
  indices?: number[],
) {
  if (!points) {
    return;
  }
  ctx.fillStyle = color;
  const list = indices ? indices.map((i) => points[i]).filter(Boolean) : points;
  for (const point of list) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      continue;
    }
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function LandmarkOverlay({
  videoRef,
  snapshot,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  snapshot: TrackerSnapshot | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      return;
    }
    const width = video.clientWidth || 640;
    const height = video.clientHeight || 360;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!snapshot) {
      return;
    }
    const dot = Math.max(2, Math.min(4, canvas.width / 240));
    drawPoints(ctx, snapshot.leftHand, canvas.width, canvas.height, "rgba(45, 212, 191, 0.9)", dot);
    drawPoints(ctx, snapshot.rightHand, canvas.width, canvas.height, "rgba(45, 212, 191, 0.9)", dot);
    drawPoints(ctx, snapshot.pose, canvas.width, canvas.height, "rgba(251, 191, 36, 0.85)", dot);
    if (snapshot.face) {
      drawPoints(ctx, snapshot.face, canvas.width, canvas.height, "rgba(248, 113, 113, 0.7)", Math.max(1, dot - 1), FACE_OVERLAY_INDICES);
    }
  }, [snapshot, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
