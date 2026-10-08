interface Props {
  confidence: number | null;
}

export function ConfidenceDisplay({ confidence }: Props) {
  const percent = Math.max(0, Math.min(100, Math.round((confidence ?? 0) * 100)));
  const label = confidence == null ? "Unavailable" : percent >= 85 ? "High" : percent >= 60 ? "Medium" : "Low";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2 text-base font-semibold">Confidence</h3>
      <div aria-label={`Confidence ${percent} percent`} className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-[var(--gold)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm">{label} {confidence == null ? "(model unavailable)" : `(${percent}%)`}</p>
    </section>
  );
}
