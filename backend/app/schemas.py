from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0
    visibility: float | None = None


class LandmarkFrame(BaseModel):
    timestamp_ms: int = Field(ge=0)
    points: list[LandmarkPoint] = Field(min_length=1)


class PredictRequest(BaseModel):
    context: Literal["isl", "mudra"]
    sequence: list[LandmarkFrame] = Field(min_length=1)

    @field_validator("sequence")
    @classmethod
    def enforce_max_sequence_length(cls, value: list[LandmarkFrame]) -> list[LandmarkFrame]:
        if len(value) > 240:
            raise ValueError("Sequence exceeds maximum supported length (240 frames).")
        return value


class PredictionCandidate(BaseModel):
    label_id: str
    display_text: str
    confidence: float = Field(ge=0.0, le=1.0)


class UnavailableReason(BaseModel):
    code: str
    message: str


class PredictResponse(BaseModel):
    status: AvailabilityStatus
    top_prediction: PredictionCandidate | None = None
    alternatives: list[PredictionCandidate] = Field(default_factory=list)
    reason: UnavailableReason | None = None


class KnowledgeEntry(BaseModel):
    id: str
    name: str
    status: Literal["pending_verification", "verified"]
    source: str | None = None
    note: str | None = None


class CatalogResponse(BaseModel):
    context: Literal["isl", "mudra"]
    items: list[KnowledgeEntry]


class VideoAnalyzeResponse(BaseModel):
    analysis_id: str
    status: Literal["queued", "failed", "model_unavailable"]
    message: str


class VideoStatusResponse(BaseModel):
    analysis_id: str
    status: Literal["queued", "processing", "failed", "model_unavailable", "completed"]
    message: str


class VideoResultsResponse(BaseModel):
    analysis_id: str
    status: Literal["completed", "failed", "model_unavailable"]
    timeline: list[PredictionCandidate] = Field(default_factory=list)
    reason: UnavailableReason | None = None


class LiveIncomingMessage(BaseModel):
    type: Literal["landmark_sequence"]
    context: Literal["isl", "mudra"]
    sequence: list[LandmarkFrame] = Field(min_length=1)


class LiveOutgoingMessage(BaseModel):
    type: Literal["prediction", "error", "status"]
    status: AvailabilityStatus
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str


class ErrorResponse(BaseModel):
    detail: str
