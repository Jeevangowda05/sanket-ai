#!/usr/bin/env python3
"""Record real user samples for SANKET AI data collection."""

from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Collect real landmark/video samples.")
    parser.add_argument("--out", default="data/raw", help="Output directory for collected samples")
    parser.add_argument("--label", required=True, help="Gesture/sign label being recorded")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    raise SystemExit(
        "Data collection scaffold is ready, but recording is intentionally user-driven. "
        "Run with a connected camera and integrate your capture loop here; no synthetic data is generated."
    )


if __name__ == "__main__":
    main()
