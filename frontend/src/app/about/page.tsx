export default function AboutPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-xl font-semibold">About SANKET AI</h2>
        <p className="mt-2 text-sm leading-6">
          SANKET AI is a single platform for selected Indian Sign Language communication and selected mudra interpretation.
          The shared pipeline captures human movement features over time and routes interpretation by context. This prototype does not claim broad ISL translation or complete cultural understanding.
        </p>
      </section>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="text-lg font-semibold">Technical honesty</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>No fabricated predictions when model weights are missing.</li>
          <li>No fabricated cultural meanings; entries are marked pending verification when needed.</li>
          <li>Raw camera frames are not sent to backend by default.</li>
        </ul>
      </section>
    </div>
  );
}
