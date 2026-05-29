from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, model_validator


class NodeSchema(BaseModel):
    id: str = Field(..., min_length=1, description="Unique node identifier")
    type: str = Field(..., description="Node type")
    position: dict[str, float] = Field(default_factory=lambda: {"x": 0.0, "y": 0.0})
    data: dict[str, Any] = Field(default_factory=dict)


class EdgeSchema(BaseModel):
    id: str = Field(..., min_length=1, description="Unique edge identifier")
    source: str = Field(..., min_length=1, description="Source node ID")
    target: str = Field(..., min_length=1, description="Target node ID")
    source_handle: str | None = None
    target_handle: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class PipelineRequest(BaseModel):
    nodes: list[NodeSchema] = Field(..., min_length=1, description="List of pipeline nodes")
    edges: list[EdgeSchema] = Field(default_factory=list, description="List of pipeline edges")

    @model_validator(mode="after")
    def validate_edge_references(self) -> "PipelineRequest":
        node_ids = {n.id for n in self.nodes}
        for edge in self.edges:
            if edge.source not in node_ids:
                raise ValueError(f"Edge '{edge.id}' references unknown source node '{edge.source}'")
            if edge.target not in node_ids:
                raise ValueError(f"Edge '{edge.id}' references unknown target node '{edge.target}'")
        return self


class PipelineResponse(BaseModel):
    num_nodes: int = Field(..., ge=0, description="Total number of nodes")
    num_edges: int = Field(..., ge=0, description="Total number of edges")
    is_dag: bool = Field(..., description="Whether the pipeline forms a valid DAG")
