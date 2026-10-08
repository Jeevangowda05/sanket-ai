interface Props {
  title: string;
  value: string;
  note?: string;
}

export function DetectionCard({ title, value, note }: Props) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="text-xs uppercase tracking-wide text-[var(--foreground)]/75">{title}</h3>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {note ? <p className="mt-2 text-sm text-[var(--foreground)]/80">{note}</p> : null}
    </article>
  );
}
