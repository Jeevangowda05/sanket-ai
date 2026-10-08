#!/usr/bin/env python3
"""Training scaffold for temporal sign models."""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    dataset_dir = Path("data/processed")
    if not dataset_dir.exists() or not any(dataset_dir.glob("*.npz")):
        raise SystemExit(
            "No processed training data found in data/processed. "
            "Collect and preprocess real samples before training."
        )

    raise SystemExit(
        "Training pipeline scaffold detected real data directory, but training loop is not auto-generated. "
        "Implement dataset loading and optimization based on collected samples."
    )


if __name__ == "__main__":
    main()
