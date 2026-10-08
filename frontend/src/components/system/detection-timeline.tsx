interface TimelineItem {
  label: string;
  detail: string;
}

export function DetectionTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-3 text-base font-semibold">Detection timeline</h3>
      {items.length === 0 ? (
        <p className="text-sm">No detections yet. Live predictions appear here after model setup.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.label}-${item.detail}`} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <strong>{item.label}</strong>
              <div>{item.detail}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
