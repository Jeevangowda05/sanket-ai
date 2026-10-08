export type AppContext = "isl" | "mudra";

export type AvailabilityStatus = "available" | "unavailable";

export interface CatalogEntry {
  id: string;
  name: string;
  status: "pending_verification" | "verified";
  source?: string | null;
  note?: string | null;
}

export interface CatalogResponse {
  context: AppContext;
  items: CatalogEntry[];
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface LandmarkFrame {
  timestamp_ms: number;
  points: LandmarkPoint[];
}

export interface PredictRequest {
  context: AppContext;
  sequence: LandmarkFrame[];
}

export interface PredictionCandidate {
  label_id: string;
  display_text: string;
  confidence: number;
}

export interface PredictResponse {
  status: AvailabilityStatus;
  top_prediction?: PredictionCandidate | null;
  alternatives: PredictionCandidate[];
  reason?: { code: string; message: string } | null;
}

export interface LiveOutgoingMessage {
  type: "prediction" | "error" | "status";
  status: AvailabilityStatus;
  message: string;
}
