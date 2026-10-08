import type { CatalogResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getSigns(): Promise<CatalogResponse> {
  return getJSON<CatalogResponse>("/api/v1/signs");
}

export function getMudras(): Promise<CatalogResponse> {
  return getJSON<CatalogResponse>("/api/v1/mudras");
}
