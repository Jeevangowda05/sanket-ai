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

export interface FeatureFrame {
  timestamp_ms: number;
  feature_version: "v1";
  feature_count: 258;
  features: number[];
}

export interface PredictRequest {
  context: AppContext;
  feature_version: "v1";
  feature_count: 258;
  sequence: FeatureFrame[];
}

export interface LiveIncomingMessage {
  type: "landmark_sequence";
  context: AppContext;
  feature_version: "v1";
  feature_count: 258;
  sequence: FeatureFrame[];
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
