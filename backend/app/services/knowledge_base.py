from __future__ import annotations

import json
from pathlib import Path

from app.schemas import KnowledgeEntry


DATA_DIR = Path(__file__).resolve().parents[3] / "data"


def _load_entries(file_name: str) -> list[KnowledgeEntry]:
    with (DATA_DIR / file_name).open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return [KnowledgeEntry(**entry) for entry in payload.get("items", [])]


def get_isl_entries() -> list[KnowledgeEntry]:
    return _load_entries("isl_labels.json")


def get_mudra_entries() -> list[KnowledgeEntry]:
    return _load_entries("mudras.json")
