"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AppContext, LiveOutgoingMessage } from "@/lib/types";
import { isLiveOutgoingMessage } from "@/lib/validation";
import { FEATURE_COUNT, FEATURE_VERSION, type FrameV1 } from "@/lib/mediapipe/schema";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1/live";

/** v1 live frame: 258 normalized features + timestamp + missing flags. */
export type { FrameV1 };

export function useLiveWebSocket(context: AppContext) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<() => void>(() => undefined);

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<LiveOutgoingMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    const socket = new WebSocket(WS_BASE);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!isLiveOutgoingMessage(parsed)) {
          setError("Received malformed live response from backend.");
          return;
        }
        setLastMessage(parsed);
      } catch {
        setError("Failed to parse live response message.");
      }
    };

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      reconnectRef.current = setTimeout(() => connectRef.current(), 2000);
    };

    socket.onerror = () => {
      setError("Live backend unavailable.");
    };
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const sendSequence = useCallback(
    (frames: FrameV1[]) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        return;
      }
      if (frames.length === 0) {
        return;
      }

      socketRef.current.send(
        JSON.stringify({
          type: "landmark_sequence",
          context,
          feature_version: FEATURE_VERSION,
          feature_count: FEATURE_COUNT,
          sequence: frames.map((frame) => ({
            timestamp_ms: frame.timestamp_ms,
            feature_version: FEATURE_VERSION,
            feature_count: FEATURE_COUNT,
            features: frame.features,
          })),
        }),
      );
    },
    [context],
  );

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { connected, lastMessage, error, sendSequence };
}
