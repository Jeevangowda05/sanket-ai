import { EmptyState } from "@/components/system/state-cards";

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-semibold">Session history</h2>
        <p className="mt-2 text-sm">Future sessions can store verified recognition events and user-approved phrase outputs.</p>
      </section>
      <EmptyState title="No history yet">No recognition sessions are stored in this milestone.</EmptyState>
    </div>
  );
}
