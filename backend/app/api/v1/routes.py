from __future__ import annotations

from pydantic import ValidationError
from fastapi import APIRouter, File, UploadFile, WebSocket, WebSocketDisconnect

from app.schemas import (
    CatalogResponse,
    LiveIncomingMessage,
    LiveOutgoingMessage,
    PredictRequest,
    PredictResponse,
    VideoAnalyzeResponse,
    VideoResultsResponse,
    VideoStatusResponse,
)
from app.services.inference import MODEL_UNAVAILABLE_REASON, predict_from_sequence
from app.services.knowledge_base import get_isl_entries, get_mudra_entries
from app.services.video_analysis import (
    cleanup_video_temp_file,
    get_video_status,
    queue_video_analysis,
    validate_uploaded_video,
)

router = APIRouter(prefix="/api/v1", tags=["v1"])


@router.get("/signs", response_model=CatalogResponse)
def get_signs() -> CatalogResponse:
    return CatalogResponse(context="isl", items=get_isl_entries())


@router.get("/mudras", response_model=CatalogResponse)
def get_mudras() -> CatalogResponse:
    return CatalogResponse(context="mudra", items=get_mudra_entries())


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    return predict_from_sequence(request)


@router.websocket("/live")
async def live_predict(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json(
        LiveOutgoingMessage(
            type="status",
            status="unavailable",
            message="Live model is unavailable until trained weights are configured.",
        ).model_dump()
    )
    try:
        while True:
            raw = await websocket.receive_json()
            try:
                incoming = LiveIncomingMessage.model_validate(raw)
                _ = incoming
            except ValidationError:
                await websocket.send_json(
                    LiveOutgoingMessage(
                        type="error",
                        status="unavailable",
                        message="Malformed live message payload.",
                    ).model_dump()
                )
                continue
            await websocket.send_json(
                LiveOutgoingMessage(
                    type="error",
                    status="unavailable",
                    message=MODEL_UNAVAILABLE_REASON.message,
                ).model_dump()
            )
    except WebSocketDisconnect:
        return


@router.post("/video/analyze", response_model=VideoAnalyzeResponse)
def analyze_video(file: UploadFile = File(...)) -> VideoAnalyzeResponse:
    temp_path = validate_uploaded_video(file)
    analysis_id, task = queue_video_analysis(temp_path)
    return VideoAnalyzeResponse(
        analysis_id=analysis_id,
        status=task["status"],
        message=task["message"],
    )


@router.get("/video/{analysis_id}/status", response_model=VideoStatusResponse)
def video_status(analysis_id: str) -> VideoStatusResponse:
    task = get_video_status(analysis_id)
    return VideoStatusResponse(
        analysis_id=analysis_id,
        status=task["status"],
        message=task["message"],
    )


@router.get("/video/{analysis_id}/results", response_model=VideoResultsResponse)
def video_results(analysis_id: str) -> VideoResultsResponse:
    task = get_video_status(analysis_id)
    cleanup_video_temp_file(analysis_id)
    return VideoResultsResponse(
        analysis_id=analysis_id,
        status=task["status"],
        timeline=[],
        reason=MODEL_UNAVAILABLE_REASON,
    )
