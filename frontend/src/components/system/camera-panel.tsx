"use client";

import type { RefObject } from "react";

import { LandmarkOverlay } from "@/components/system/landmark-overlay";
import type { CameraState } from "@/hooks/useCamera";
import type { TrackerStatus } from "@/hooks/useMediaPipeTracker";
import type { TrackerSnapshot } from "@/lib/mediapipe/schema";

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  cameraError: string | null;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  trackerStatus: TrackerStatus;
  trackerError: string | null;
  snapshot: TrackerSnapshot | null;
  fps: number | null;
}

const TRACKER_LABEL: Record<TrackerStatus, string> = {
  unavailable: "MediaPipe Tasks model assets are required to enable landmark overlay.",
  loading: "Loading MediaPipe models…",
  ready: "Tracker ready. Start the camera to process frames.",
  processing: "Landmark overlay active",
  error: "Tracker error.",
  stopped: "Tracker stopped.",
};

export function CameraPanel({
  videoRef,
  cameraState,
  cameraError,
  onStart,
  onStop,
  onRestart,
  trackerStatus,
  trackerError,
  snapshot,
  fps,
}: CameraPanelProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-2 text-lg font-semibold">Live camera</h2>
      <p className="mb-3 text-sm text-[var(--foreground)]/80">
        Privacy notice: webcam processing stays in-browser by default. Only normalized landmark sequences may be sent for live inference.
      </p>
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-slate-900/90">
        <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline aria-label="Live camera preview" />
        <LandmarkOverlay videoRef={videoRef} snapshot={snapshot} />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-2">
          <div className="rounded-md bg-black/40 px-3 py-2 text-center text-xs text-white">
            {TRACKER_LABEL[trackerStatus]}
            {trackerStatus === "processing" && fps !== null ? ` · ${fps} fps` : null}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm">Camera state: {cameraState} · Tracker: {trackerStatus}</p>
      {cameraError ? <p role="alert" className="mt-1 text-sm text-red-700">{cameraError}</p> : null}
      {trackerError ? <p role="alert" className="mt-1 text-sm text-red-700">{trackerError}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-full bg-[var(--teal)] px-4 py-2 text-sm" onClick={onStart}>Start</button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={onStop}>Stop</button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={onRestart}>Restart</button>
      </div>
    </section>
  );
}
