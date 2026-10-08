import type { LiveOutgoingMessage } from "@/lib/types";

export function isLiveOutgoingMessage(value: unknown): value is LiveOutgoingMessage {
  if (!value || typeof value !== "object") {
    return false;
  }
  const payload = value as Record<string, unknown>;
  const validType = payload.type === "prediction" || payload.type === "error" || payload.type === "status";
  const validStatus = payload.status === "available" || payload.status === "unavailable";
  return validType && validStatus && typeof payload.message === "string";
}
