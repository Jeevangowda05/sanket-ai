"use client";

import { useCamera } from "@/hooks/useCamera";

export function CameraPanel() {
  const { videoRef, state, error, start, stop, restart } = useCamera();
  const mediapipeConfigured = false;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-2 text-lg font-semibold">Live camera</h2>
      <p className="mb-3 text-sm text-[var(--foreground)]/80">
        Privacy notice: webcam processing stays in-browser by default. Only normalized landmark sequences may be sent for live inference.
      </p>
      <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-slate-900/90">
        <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline aria-label="Live camera preview" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-md bg-black/40 px-3 py-2 text-center text-xs text-white">
            {mediapipeConfigured
              ? "Landmark overlay active"
              : "MediaPipe Tasks model assets are required to enable landmark overlay."}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm">Camera state: {state}</p>
      {error ? <p role="alert" className="mt-1 text-sm text-red-700">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-full bg-[var(--teal)] px-4 py-2 text-sm" onClick={start}>Start</button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={stop}>Stop</button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={restart}>Restart</button>
      </div>
    </section>
  );
}
