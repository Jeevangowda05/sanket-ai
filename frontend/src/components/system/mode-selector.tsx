import type { AppContext } from "@/lib/types";

interface Props {
  value: AppContext;
  onChange: (value: AppContext) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      Context
      <select
        className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value as AppContext)}
      >
        <option value="isl">ISL communication</option>
        <option value="mudra">Mudra exploration</option>
      </select>
    </label>
  );
}
