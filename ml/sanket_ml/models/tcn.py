from __future__ import annotations

import torch
from torch import nn

from sanket_ml.models.base import BaseTemporalModel


class TemporalBlock(nn.Module):
    def __init__(self, channels: int, dilation: int) -> None:
        super().__init__()
        self.conv = nn.Conv1d(
            channels,
            channels,
            kernel_size=3,
            padding=dilation,
            dilation=dilation,
        )
        self.norm = nn.BatchNorm1d(channels)
        self.act = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.conv(x)
        out = self.norm(out)
        out = self.act(out)
        return out + x


class TCNModel(BaseTemporalModel):
    def __init__(self, input_size: int, num_classes: int, channels: int = 128) -> None:
        super().__init__(input_size=input_size, num_classes=num_classes)
        self.input_proj = nn.Conv1d(input_size, channels, kernel_size=1)
        self.blocks = nn.Sequential(
            TemporalBlock(channels=channels, dilation=1),
            TemporalBlock(channels=channels, dilation=2),
            TemporalBlock(channels=channels, dilation=4),
        )
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.head = nn.Linear(channels, num_classes)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        # [B, T, F] -> [B, F, T]
        x = inputs.transpose(1, 2)
        x = self.input_proj(x)
        x = self.blocks(x)
        x = self.pool(x).squeeze(-1)
        return self.head(x)
