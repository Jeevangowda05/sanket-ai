"use client";

import { useState } from "react";

import { CameraPanel } from "@/components/system/camera-panel";
import { ConfidenceDisplay } from "@/components/system/confidence-display";
import { DetectionCard } from "@/components/system/detection-card";
import { DetectionTimeline } from "@/components/system/detection-timeline";
import { ModeSelector } from "@/components/system/mode-selector";
import { SpeechButton } from "@/components/system/speech-button";
import { ErrorState } from "@/components/system/state-cards";
import { SystemStatus } from "@/components/system/system-status";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import type { AppContext } from "@/lib/types";

export default function LivePage() {
  const [context, setContext] = useState<AppContext>("isl");
  const { connected, lastMessage, error } = useLiveWebSocket(context);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CameraPanel />
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
          note={lastMessage?.status === "unavailable" ? "Model unavailable state is expected for this milestone." : undefined}
        />
        <SpeechButton text={"SANKET AI live mode ready. Model unavailable until trained weights are installed."} />
      </div>

      <DetectionTimeline items={[]} />
    </div>
  );
}
