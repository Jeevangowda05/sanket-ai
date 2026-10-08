import { PropsWithChildren } from "react";

function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="text-sm text-[var(--foreground)]/90">{children}</div>
    </section>
  );
}

export function EmptyState({ title, children }: PropsWithChildren<{ title: string }>) {
  return <Card title={title}>{children}</Card>;
}

export function LoadingState({ title, children }: PropsWithChildren<{ title: string }>) {
  return <Card title={title}>{children}</Card>;
}

export function ErrorState({ title, children }: PropsWithChildren<{ title: string }>) {
  return <Card title={title}>{children}</Card>;
}
