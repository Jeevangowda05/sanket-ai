from __future__ import annotations

from abc import ABC, abstractmethod

import torch
from torch import nn


class BaseTemporalModel(nn.Module, ABC):
    def __init__(self, input_size: int, num_classes: int) -> None:
        super().__init__()
        self.input_size = input_size
        self.num_classes = num_classes

    @abstractmethod
    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        """Expected input shape: [batch, time, features]."""

    def predict_proba(self, inputs: torch.Tensor) -> torch.Tensor:
        logits = self.forward(inputs)
        return torch.softmax(logits, dim=-1)
