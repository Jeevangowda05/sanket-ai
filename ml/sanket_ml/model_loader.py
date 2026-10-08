from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import torch

from sanket_ml.models.base import BaseTemporalModel
from sanket_ml.models.tcn import TCNModel
from sanket_ml.models.transformer import TransformerModel


@dataclass(frozen=True)
class ModelLoadResult:
    status: Literal["available", "unavailable"]
    model: BaseTemporalModel | None
    message: str


def build_model(architecture: str, input_size: int, num_classes: int) -> BaseTemporalModel:
    if architecture == "tcn":
        return TCNModel(input_size=input_size, num_classes=num_classes)
    if architecture == "transformer":
        return TransformerModel(input_size=input_size, num_classes=num_classes)
    raise ValueError(f"Unsupported architecture: {architecture}")


def load_model_if_available(
    architecture: str,
    weights_path: Path,
    input_size: int,
    num_classes: int,
) -> ModelLoadResult:
    if not weights_path.exists():
        return ModelLoadResult(
            status="unavailable",
            model=None,
            message=f"Missing weights at {weights_path}",
        )

    model = build_model(architecture=architecture, input_size=input_size, num_classes=num_classes)
    state = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    return ModelLoadResult(status="available", model=model, message="Loaded")
