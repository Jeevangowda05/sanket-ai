"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AppContext, LiveOutgoingMessage } from "@/lib/types";
import { isLiveOutgoingMessage } from "@/lib/validation";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/api/v1/live";

export interface ClientLandmarkFrame {
  timestampMs: number;
  landmarks: Array<{ x: number; y: number; z: number }>;
}

function normalizeFrame(frame: ClientLandmarkFrame) {
  const centroid = frame.landmarks.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      acc.z += point.z;
      return acc;
    },
    { x: 0, y: 0, z: 0 },
  );

  const length = frame.landmarks.length || 1;
  const mean = { x: centroid.x / length, y: centroid.y / length, z: centroid.z / length };

  return {
    timestamp_ms: frame.timestampMs,
    points: frame.landmarks.map((point) => ({
      x: point.x - mean.x,
      y: point.y - mean.y,
      z: point.z - mean.z,
    })),
  };
}

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
    (frames: ClientLandmarkFrame[]) => {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      socketRef.current.send(
        JSON.stringify({
          type: "landmark_sequence",
          context,
          sequence: frames.map(normalizeFrame),
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
