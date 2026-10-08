from __future__ import annotations

import numpy as np


def flatten_landmark_sequence(sequence: np.ndarray) -> np.ndarray:
    """Converts [T, P, D] landmark points to [T, P*D] feature vectors."""
    if sequence.ndim != 3:
        raise ValueError("Expected sequence shape [time, points, dims].")
    t, p, d = sequence.shape
    return sequence.reshape((t, p * d))


def normalize_landmark_features(features: np.ndarray, eps: float = 1e-8) -> np.ndarray:
    """Frame-wise z-normalization to improve subject/camera robustness."""
    if features.ndim != 2:
        raise ValueError("Expected features shape [time, features].")
    mean = np.mean(features, axis=1, keepdims=True)
    std = np.std(features, axis=1, keepdims=True)
    return (features - mean) / (std + eps)


def create_sliding_windows(features: np.ndarray, window_size: int, stride: int) -> np.ndarray:
    if window_size <= 0 or stride <= 0:
        raise ValueError("window_size and stride must be positive.")
    if len(features) < window_size:
        raise ValueError("Not enough frames for the requested window size.")

    windows = []
    for start in range(0, len(features) - window_size + 1, stride):
        windows.append(features[start : start + window_size])
    return np.stack(windows)
