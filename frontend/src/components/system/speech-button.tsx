"use client";

import { useMemo, useState } from "react";

import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface Props {
  text: string;
}

export function SpeechButton({ text }: Props) {
  const { supported, voices, speak, pause, cancel } = useSpeechSynthesis();
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  const uniqueVoices = useMemo(() => voices.filter((v, i, arr) => arr.findIndex((x) => x.voiceURI === v.voiceURI) === i), [voices]);

  if (!supported) {
    return <p className="text-sm">Speech synthesis is not available in this browser.</p>;
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="mb-2 text-base font-semibold">Speech output</h3>
      <label className="mb-3 flex flex-col gap-1 text-sm">
        Voice
        <select className="rounded-lg border border-[var(--border)] bg-white px-3 py-2" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
          <option value="">Default voice</option>
          {uniqueVoices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-full bg-[var(--teal)] px-4 py-2 text-sm font-medium" onClick={() => speak(text, selectedVoice)}>
          Speak
        </button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={pause}>
          Pause
        </button>
        <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm" onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
