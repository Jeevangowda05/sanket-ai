from __future__ import annotations

import math
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator


FEATURE_VERSION: Literal["v1"] = "v1"
FEATURE_COUNT: Literal[258] = 258
MAX_SEQUENCE_LENGTH = 240
FEATURE_VALUE_MIN = -10.0
FEATURE_VALUE_MAX = 10.0
# Pose block starts at index 126; every 4th slot from there is visibility.
POSE_OFFSET = 126


def _is_visibility_index(index: int) -> bool:
    return index >= POSE_OFFSET and (index - POSE_OFFSET) % 4 == 3


class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


class FeatureFrame(BaseModel):
    timestamp_ms: int = Field(ge=0)
    feature_version: Literal["v1"] = "v1"
    feature_count: Literal[258] = 258
    features: list[float] = Field(min_length=258, max_length=258)

    @field_validator("features")
    @classmethod
    def enforce_finite_values_in_range(cls, value: list[float]) -> list[float]:
        for index, entry in enumerate(value):
            if isinstance(entry, bool) or not isinstance(entry, (int, float)):
                raise ValueError(f"Feature at index {index} must be numeric.")
            number = float(entry)
            if not math.isfinite(number):
                raise ValueError(f"Feature at index {index} must be finite.")
            if _is_visibility_index(index):
                if number < 0.0 or number > 1.0:
                    raise ValueError(
                        f"Visibility feature at index {index} must be within [0.0, 1.0]."
                    )
            elif number < FEATURE_VALUE_MIN or number > FEATURE_VALUE_MAX:
                raise ValueError(
                    f"Feature at index {index} must be within "
                    f"[{FEATURE_VALUE_MIN}, {FEATURE_VALUE_MAX}]."
                )
        return value


class FeatureSequenceMixin(BaseModel):
    context: Literal["isl", "mudra"]
    feature_version: Literal["v1"] = "v1"
    feature_count: Literal[258] = 258
    sequence: list[FeatureFrame] = Field(min_length=1)

    @field_validator("sequence")
    @classmethod
    def enforce_sequence_contract(cls, value: list[FeatureFrame], info) -> list[FeatureFrame]:
        if len(value) > MAX_SEQUENCE_LENGTH:
            raise ValueError(
                f"Sequence exceeds maximum supported length ({MAX_SEQUENCE_LENGTH} frames)."
            )
        expected_version = (info.data or {}).get("feature_version", "v1")
        expected_count = (info.data or {}).get("feature_count", 258)
        previous: int | None = None
        for frame in value:
            if frame.feature_version != expected_version:
                raise ValueError("Frame feature_version must match sequence feature_version.")
            if frame.feature_count != expected_count:
                raise ValueError("Frame feature_count must match sequence feature_count.")
            if previous is not None and frame.timestamp_ms < previous:
                raise ValueError("Sequence timestamps must be monotonic non-decreasing.")
            previous = frame.timestamp_ms
        return value


class PredictRequest(FeatureSequenceMixin):
    pass


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


class LiveIncomingMessage(FeatureSequenceMixin):
    type: Literal["landmark_sequence"]


class LiveOutgoingMessage(BaseModel):
    type: Literal["prediction", "error", "status"]
    status: AvailabilityStatus
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str


class ErrorResponse(BaseModel):
    detail: str
