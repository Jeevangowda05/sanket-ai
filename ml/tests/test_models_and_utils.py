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


def _write_checkpoint(path: Path, **overrides) -> None:
    model = TCNModel(input_size=258, num_classes=3)
    metadata = {
        "architecture": "tcn",
        "input_size": 258,
        "num_classes": 3,
        "feature_version": "v1",
        "feature_count": 258,
        "label_mapping": {"a": 0, "b": 1, "c": 2},
    }
    metadata.update(overrides)
    torch.save({"state_dict": model.state_dict(), **metadata}, path)


def test_model_loader_accepts_matching_v1_checkpoint(tmp_path: Path) -> None:
    path = tmp_path / "v1.pt"
    _write_checkpoint(path)
    result = load_model_if_available(
        architecture="tcn",
        weights_path=path,
        input_size=258,
        num_classes=3,
    )
    assert result.status == "available"
    assert result.model is not None


def test_model_loader_rejects_contract_mismatch(tmp_path: Path) -> None:
    path = tmp_path / "v1.pt"
    _write_checkpoint(path)

    wrong_version = tmp_path / "v2.pt"
    _write_checkpoint(wrong_version, feature_version="v2")

    no_mapping = tmp_path / "nomap.pt"
    model = TCNModel(input_size=258, num_classes=3)
    torch.save({"state_dict": model.state_dict()}, no_mapping)

    cases = [
        # input_size must equal the v1 feature count.
        dict(weights_path=path, input_size=12, num_classes=3),
        dict(weights_path=wrong_version, input_size=258, num_classes=3),
        dict(weights_path=no_mapping, input_size=258, num_classes=3),
    ]
    for case in cases:
        result = load_model_if_available(architecture="tcn", **case)
        assert result.status == "unavailable"
        assert result.model is None
