import { DetectionCard } from "@/components/system/detection-card";
import { EmptyState } from "@/components/system/state-cards";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-2xl font-semibold">Prototype foundation</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--foreground)]/90">
          SANKET AI is a unified human-movement understanding platform with selected ISL recognition as the primary communication flow and mudra interpretation as a secondary context using the same movement pipeline.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DetectionCard title="Primary application" value="Selected ISL to text/speech" note="Requires verified dataset collection and trained temporal model weights." />
        <DetectionCard title="Secondary context" value="Selected mudra interpretation" note="Uses controlled knowledge base entries with verification status." />
        <DetectionCard title="Current milestone" value="Production-ready skeleton" note="Infrastructure is implemented; trained model predictions are intentionally unavailable." />
      </div>

      <EmptyState title="Current limitation">
        No real-time sign predictions are shown until MediaPipe model assets are configured in the frontend and trained PyTorch weights are installed in the backend.
      </EmptyState>
    </div>
  );
}
