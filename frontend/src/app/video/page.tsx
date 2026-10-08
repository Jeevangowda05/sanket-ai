import { EmptyState } from "@/components/system/state-cards";

export default function VideoPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-semibold">Video analysis</h2>
        <p className="mt-2 text-sm">
          Upload flow is backed by strict backend validation (extension, MIME type, size, and max 30-second duration).
          Prediction output remains unavailable until trained weights are configured.
        </p>
      </section>
      <EmptyState title="Prototype scope">
        This page intentionally does not fabricate detections. Use it to validate pipeline readiness and backend availability.
      </EmptyState>
    </div>
  );
}
