"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { CameraPanel } from "@/components/system/camera-panel";
import { ConfidenceDisplay } from "@/components/system/confidence-display";
import { DetectionCard } from "@/components/system/detection-card";
import { DetectionTimeline } from "@/components/system/detection-timeline";
import { ModeSelector } from "@/components/system/mode-selector";
import { SpeechButton } from "@/components/system/speech-button";
import { ErrorState } from "@/components/system/state-cards";
import { SystemStatus } from "@/components/system/system-status";
import { useCamera } from "@/hooks/useCamera";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { useMediaPipeTracker } from "@/hooks/useMediaPipeTracker";
import { RollingBuffer } from "@/lib/mediapipe/buffer";
import { FEATURE_COUNT, FEATURE_VERSION } from "@/lib/mediapipe/schema";
import type { AppContext } from "@/lib/types";

const BUFFER_SIZE = 45;
const SEND_WINDOW = 30;
const SEND_INTERVAL_MS = 100;

export default function LivePage() {
  const [context, setContext] = useState<AppContext>("isl");
  const { videoRef, state: cameraState, error: cameraError, start: startCamera, stop: stopCamera, restart: restartCamera } = useCamera();
  const { connected, lastMessage, error: wsError, sendSequence } = useLiveWebSocket(context);

  const [buffer] = useState(() => new RollingBuffer(BUFFER_SIZE));
  const [bufferedFrames, setBufferedFrames] = useState(0);

  const handleTrackerFrame = useCallback(({ frame }: { frame: { timestamp_ms: number; features: number[]; missing: { leftHand: boolean; rightHand: boolean; pose: boolean } } }) => {
    buffer.push(frame);
  }, [buffer]);

  const { status: trackerStatus, error: trackerError, snapshot, fps, start: startTracker, stop: stopTracker } =
    useMediaPipeTracker(videoRef, handleTrackerFrame);

  useEffect(() => {
    const timer = setInterval(() => {
      if (buffer.size === 0) {
        return;
      }
      // Throttle UI counter without re-rendering every frame.
      setBufferedFrames(buffer.size);
      sendSequence(buffer.window(SEND_WINDOW));
    }, SEND_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [buffer, sendSequence]);

  const handleStart = useCallback(async () => {
    await startCamera();
    startTracker();
  }, [startCamera, startTracker]);

  const handleStop = useCallback(() => {
    stopTracker();
    stopCamera();
    buffer.clear();
    setBufferedFrames(0);
  }, [stopCamera, stopTracker, buffer]);

  const handleRestart = useCallback(async () => {
    stopTracker();
    buffer.clear();
    await restartCamera();
    startTracker();
  }, [restartCamera, startTracker, stopTracker, buffer]);

  const diagnostics = useMemo(
    () => [
      { label: `Camera: ${cameraState}`, detail: "Browser MediaDevices stream" },
      { label: `MediaPipe: ${trackerStatus}`, detail: `Feature ${FEATURE_VERSION} · ${FEATURE_COUNT} features` },
      { label: `Buffer: ${bufferedFrames}/${BUFFER_SIZE}`, detail: `Window ${SEND_WINDOW} @ ~10 Hz` },
      { label: `WebSocket: ${connected ? "connected" : "reconnecting"}`, detail: "Normalized landmarks only; never raw frames" },
      { label: "Model: unavailable", detail: "No trained weights installed" },
      { label: `Update rate: ${fps !== null ? `${fps} fps` : "—"}`, detail: "Tracker processing rate" },
    ],
    [cameraState, trackerStatus, bufferedFrames, connected, fps],
  );

  const error = wsError ?? cameraError ?? trackerError;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CameraPanel
          videoRef={videoRef}
          cameraState={cameraState}
          cameraError={cameraError}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
          trackerStatus={trackerStatus}
          trackerError={trackerError}
          snapshot={snapshot}
          fps={fps}
        />
        <div className="space-y-4">
          <ModeSelector value={context} onChange={setContext} />
          <SystemStatus backendAvailable modelAvailable={false} websocketConnected={connected} />
          <ConfidenceDisplay confidence={null} />
        </div>
      </div>

      {error ? <ErrorState title="Live connection issue">{error}</ErrorState> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <DetectionCard
          title="Current context"
          value={context === "isl" ? "ISL communication" : "Mudra interpretation"}
          note="Both contexts run on one shared movement pipeline."
        />
        <DetectionCard
          title="Backend message"
          value={lastMessage?.message ?? "Waiting for backend status..."}
          note={lastMessage?.status === "unavailable" ? "Model unavailable state is expected until trained weights are installed." : undefined}
        />
        <SpeechButton text={"SANKET AI live mode ready. Model unavailable until trained weights are installed."} />
      </div>

      <DetectionTimeline items={diagnostics} />
    </div>
  );
}
