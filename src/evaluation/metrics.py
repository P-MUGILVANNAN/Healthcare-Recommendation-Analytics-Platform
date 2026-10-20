"""
Recommendation Evaluation Metrics.
Computes Precision@K, Recall@K, NDCG@K, HitRate@K, Coverage, and Intra-List Diversity.
"""

import math
from typing import List, Set


def precision_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    k_items = recommended[:k]
    hits = sum(1 for item in k_items if item in ground_truth)
    return hits / k if k > 0 else 0.0


def recall_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    if not ground_truth:
        return 0.0
    k_items = recommended[:k]
    hits = sum(1 for item in k_items if item in ground_truth)
    return hits / len(ground_truth)


def ndcg_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    if not ground_truth:
        return 0.0
    k_items = recommended[:k]
    hits = [1 if item in ground_truth else 0 for item in k_items]
    dcg = sum((hit / math.log2(idx + 2)) for idx, hit in enumerate(hits))
    idcg = sum((1.0 / math.log2(idx + 2)) for idx in range(min(len(ground_truth), k)))
    return (dcg / idcg) if idcg > 0 else 0.0


def hit_rate_at_k(recommended: List[str], ground_truth: Set[str], k: int) -> float:
    k_items = recommended[:k]
    return 1.0 if any(item in ground_truth for item in k_items) else 0.0
