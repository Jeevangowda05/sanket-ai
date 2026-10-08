from __future__ import annotations

import torch
from torch import nn

from sanket_ml.models.base import BaseTemporalModel


class TransformerModel(BaseTemporalModel):
    """Swappable lightweight transformer skeleton for temporal classification."""

    def __init__(
        self,
        input_size: int,
        num_classes: int,
        hidden_size: int = 128,
        num_heads: int = 4,
        num_layers: int = 2,
    ) -> None:
        super().__init__(input_size=input_size, num_classes=num_classes)
        self.input_proj = nn.Linear(input_size, hidden_size)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=num_heads,
            batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.norm = nn.LayerNorm(hidden_size)
        self.head = nn.Linear(hidden_size, num_classes)

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        x = self.input_proj(inputs)
        x = self.encoder(x)
        x = self.norm(x.mean(dim=1))
        return self.head(x)
