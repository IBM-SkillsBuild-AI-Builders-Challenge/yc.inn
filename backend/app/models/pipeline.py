from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class Node(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any]

    model_config = ConfigDict(frozen=True)


class Edge(BaseModel):
    id: str
    source: str
    target: str
    source_handle: str | None = None
    target_handle: str | None = None
    data: dict[str, Any] = {}
