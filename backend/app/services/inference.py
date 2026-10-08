from __future__ import annotations

from app.schemas import (
    AvailabilityStatus,
    PredictRequest,
    PredictResponse,
    UnavailableReason,
)


MODEL_UNAVAILABLE_REASON = UnavailableReason(
    code="model_unavailable",
    message="No trained model weights are configured. Collect data and train models before inference.",
)


def predict_from_sequence(request: PredictRequest) -> PredictResponse:
    _ = request
    return PredictResponse(
        status=AvailabilityStatus.UNAVAILABLE,
        reason=MODEL_UNAVAILABLE_REASON,
        alternatives=[],
    )
