#!/usr/bin/env python3
"""Model export scaffold."""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    source_weights = Path("models/latest.pt")
    if not source_weights.exists():
        raise SystemExit("Cannot export model: models/latest.pt does not exist.")

    raise SystemExit(
        "Export scaffold is ready. Add your chosen export target (TorchScript/ONNX) once validated weights exist."
    )


if __name__ == "__main__":
    main()
