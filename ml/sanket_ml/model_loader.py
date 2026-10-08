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


EXPECTED_FEATURE_VERSION = "v1"
EXPECTED_FEATURE_COUNT = 258


def _unavailable(message: str) -> ModelLoadResult:
    return ModelLoadResult(status="unavailable", model=None, message=message)


def load_model_if_available(
    architecture: str,
    weights_path: Path,
    input_size: int,
    num_classes: int,
    *,
    expected_feature_version: str = EXPECTED_FEATURE_VERSION,
    expected_feature_count: int = EXPECTED_FEATURE_COUNT,
) -> ModelLoadResult:
    if not weights_path.exists():
        return _unavailable(f"Missing weights at {weights_path}")

    if input_size != expected_feature_count:
        return _unavailable(
            f"Contract mismatch: input_size={input_size} does not match "
            f"feature_count={expected_feature_count} for feature_version={expected_feature_version}."
        )

    try:
        checkpoint = torch.load(weights_path, map_location="cpu", weights_only=True)
    except Exception as error:
        return _unavailable(f"Failed to load checkpoint safely from {weights_path}: {error}")

    state = checkpoint
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        metadata = checkpoint
        checks = {
            "architecture": architecture,
            "input_size": input_size,
            "num_classes": num_classes,
            "feature_version": expected_feature_version,
            "feature_count": expected_feature_count,
        }
        for key, expected in checks.items():
            actual = metadata.get(key)
            if actual is not None and actual != expected:
                return _unavailable(
                    f"Checkpoint mismatch: {key}={actual!r} does not match expected {expected!r}."
                )
        if metadata.get("label_mapping") is None:
            return _unavailable("Checkpoint is missing label_mapping metadata.")
        state = metadata["state_dict"]

    try:
        model = build_model(architecture=architecture, input_size=input_size, num_classes=num_classes)
        model.load_state_dict(state)
    except Exception as error:
        return _unavailable(f"Weights at {weights_path} are incompatible with {architecture}: {error}")
    model.eval()
    return ModelLoadResult(status="available", model=model, message="Loaded")
