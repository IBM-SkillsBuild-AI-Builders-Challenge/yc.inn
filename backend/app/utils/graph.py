from __future__ import annotations

import networkx as nx

from app.models.pipeline import Edge, Node


def build_graph(nodes: list[Node], edges: list[Edge]) -> nx.DiGraph:
    graph = nx.DiGraph()
    for node in nodes:
        graph.add_node(node.id)
    for edge in edges:
        graph.add_edge(edge.source, edge.target, id=edge.id)
    return graph


def validate_dag(graph: nx.DiGraph) -> bool:
    return nx.is_directed_acyclic_graph(graph)


def get_graph_stats(graph: nx.DiGraph) -> dict[str, int]:
    return {
        "num_nodes": graph.number_of_nodes(),
        "num_edges": graph.number_of_edges(),
    }
