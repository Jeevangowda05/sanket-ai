from __future__ import annotations

from collections import deque
from typing import Literal


def confidence_band(confidence: float) -> Literal["high", "medium", "low"]:
    if confidence >= 0.85:
        return "high"
    if confidence >= 0.6:
        return "medium"
    return "low"


class PredictionSmoother:
    def __init__(self, size: int = 5) -> None:
        self.values: deque[float] = deque(maxlen=size)

    def update(self, value: float) -> float:
        self.values.append(value)
        return sum(self.values) / len(self.values)


class DuplicateSuppressor:
    def __init__(self, cooldown_frames: int = 12) -> None:
        self.cooldown_frames = cooldown_frames
        self.last_label: str | None = None
        self.frames_since_emit = cooldown_frames

    def should_emit(self, label: str) -> bool:
        self.frames_since_emit += 1
        if label != self.last_label:
            self.last_label = label
            self.frames_since_emit = 0
            return True
        if self.frames_since_emit >= self.cooldown_frames:
            self.frames_since_emit = 0
            return True
        return False
