from __future__ import annotations

from pathlib import Path

import numpy as np
import torch

from sanket_ml.model_loader import load_model_if_available
from sanket_ml.models.tcn import TCNModel
from sanket_ml.models.transformer import TransformerModel
from sanket_ml.utils.postprocessing import DuplicateSuppressor, PredictionSmoother, confidence_band
from sanket_ml.utils.preprocessing import (
    create_sliding_windows,
    flatten_landmark_sequence,
    normalize_landmark_features,
)


def test_tcn_forward_shape() -> None:
    model = TCNModel(input_size=12, num_classes=4)
    output = model(torch.randn(2, 30, 12))
    assert output.shape == (2, 4)


def test_transformer_forward_shape() -> None:
    model = TransformerModel(input_size=12, num_classes=5)
    output = model(torch.randn(2, 24, 12))
    assert output.shape == (2, 5)


def test_preprocessing_helpers() -> None:
    points = np.random.rand(40, 10, 3)
    flat = flatten_landmark_sequence(points)
    assert flat.shape == (40, 30)

    normed = normalize_landmark_features(flat)
    assert normed.shape == flat.shape

    windows = create_sliding_windows(normed, window_size=20, stride=10)
    assert windows.shape[0] == 3


def test_postprocessing_helpers() -> None:
    assert confidence_band(0.9) == "high"
    assert confidence_band(0.7) == "medium"
    assert confidence_band(0.2) == "low"

    smoother = PredictionSmoother(size=3)
    assert smoother.update(0.3) == 0.3
    assert round(smoother.update(0.6), 2) == 0.45

    suppressor = DuplicateSuppressor(cooldown_frames=2)
    assert suppressor.should_emit("help")
    assert not suppressor.should_emit("help")


def test_model_loader_unavailable_without_weights(tmp_path: Path) -> None:
    result = load_model_if_available(
        architecture="tcn",
        weights_path=tmp_path / "missing.pt",
        input_size=12,
        num_classes=3,
    )
    assert result.status == "unavailable"
    assert result.model is None
