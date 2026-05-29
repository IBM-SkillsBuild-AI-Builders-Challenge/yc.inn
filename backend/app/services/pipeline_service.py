from __future__ import annotations

from loguru import logger

from app.core.exceptions import GraphValidationError, MalformedPipelineError
from app.models.pipeline import Edge, Node
from app.schemas.pipeline import PipelineRequest, PipelineResponse
from app.utils.graph import build_graph, get_graph_stats, validate_dag


class PipelineService:
    """Business logic for pipeline operations."""

    def parse(self, payload: PipelineRequest) -> PipelineResponse:
        logger.info(f"Parsing pipeline: {len(payload.nodes)} nodes, {len(payload.edges)} edges")

        nodes = [Node(**n.model_dump()) for n in payload.nodes]
        edges = [Edge(**e.model_dump()) for e in payload.edges]

        try:
            graph = build_graph(nodes, edges)
        except Exception as exc:
            logger.error(f"Failed to build graph: {exc}")
            raise MalformedPipelineError("Could not build graph from pipeline data") from exc

        stats = get_graph_stats(graph)
        is_dag = validate_dag(graph)

        logger.info(f"Pipeline parsed: {stats['num_nodes']} nodes, {stats['num_edges']} edges, is_dag={is_dag}")

        if not is_dag:
            logger.warning("Pipeline contains cycles — not a valid DAG")

        return PipelineResponse(num_nodes=stats["num_nodes"], num_edges=stats["num_edges"], is_dag=is_dag)


pipeline_service = PipelineService()
