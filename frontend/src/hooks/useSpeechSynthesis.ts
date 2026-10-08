"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useSpeechSynthesis() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) {
      return;
    }
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.onvoiceschanged = update;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, voiceURI?: string) => {
      if (!supported || !text.trim()) {
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceURI) {
        utterance.voice = voices.find((voice) => voice.voiceURI === voiceURI) ?? null;
      }
      window.speechSynthesis.speak(utterance);
    },
    [supported, voices],
  );

  const pause = useCallback(() => {
    if (supported) {
      window.speechSynthesis.pause();
    }
  }, [supported]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
  }, [supported]);

  return useMemo(
    () => ({
      supported,
      voices,
      speak,
      pause,
      cancel,
    }),
    [supported, voices, speak, pause, cancel],
  );
}
