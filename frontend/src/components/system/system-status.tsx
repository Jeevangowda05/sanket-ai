interface Props {
  backendAvailable: boolean;
  modelAvailable: boolean;
  websocketConnected: boolean;
}

function Dot({ ok }: { ok: boolean }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />;
}

export function SystemStatus({ backendAvailable, modelAvailable, websocketConnected }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2 text-base font-semibold">System status</h3>
      <ul className="space-y-1 text-sm">
        <li className="flex items-center gap-2"><Dot ok={backendAvailable} /> Backend {backendAvailable ? "reachable" : "unreachable"}</li>
        <li className="flex items-center gap-2"><Dot ok={modelAvailable} /> Model {modelAvailable ? "available" : "unavailable"}</li>
        <li className="flex items-center gap-2"><Dot ok={websocketConnected} /> Live socket {websocketConnected ? "connected" : "reconnecting"}</li>
      </ul>
    </section>
  );
}
