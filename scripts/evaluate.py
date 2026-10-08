#!/usr/bin/env python3
"""Evaluation scaffold that never fabricates metrics."""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    weights = Path("models/latest.pt")
    eval_data = Path("data/processed_eval")

    missing = [
        str(path)
        for path in [weights, eval_data]
        if not path.exists()
    ]
    if missing:
        raise SystemExit(
            "Evaluation cannot run. Missing required assets: " + ", ".join(missing)
        )

    raise SystemExit(
        "Evaluation scaffold is present, but no metrics are generated without a concrete evaluation implementation."
    )


if __name__ == "__main__":
    main()
