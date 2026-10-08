import Link from "next/link";
import { PropsWithChildren } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/video", label: "Video" },
  { href: "/history", label: "History" },
  { href: "/about", label: "About" },
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--navy)]">SANKET AI</h1>
            <p className="text-sm text-[var(--foreground)]">From Signs to Speech</p>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--teal)] hover:bg-[var(--teal)]/20"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
