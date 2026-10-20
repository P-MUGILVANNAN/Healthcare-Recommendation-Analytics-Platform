"""
Unit Tests for Recommendation Engines & Hybrid Scoring.
Verifies TF-IDF matching, cold-start handling, and score normalization.
"""

import pytest
import os
import json
from src.recommenders.engine import (
    ContentBasedRecommender, ItemCollaborativeRecommender,
    SafetyRuleEngine, HybridRecommender
)
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))


@pytest.fixture
def recommender_setup():
    catalog_path = os.path.join(BASE_DIR, "data", "raw", "health_resources.json")
    with open(catalog_path, "r", encoding="utf-8") as f:
        resources = json.load(f)
    interactions_path = os.path.join(BASE_DIR, "data", "synthetic", "interactions.csv")
    interactions_df = pd.read_csv(interactions_path)
    
    item_ids = [r["item_id"] for r in resources]
    content_engine = ContentBasedRecommender(resources)
    collab_engine = ItemCollaborativeRecommender(interactions_df, item_ids)
    safety_engine = SafetyRuleEngine()
    hybrid_engine = HybridRecommender(content_engine, collab_engine, safety_engine)

    return hybrid_engine, content_engine, collab_engine


def test_content_relevance_matching(recommender_setup):
    hybrid_engine, content_engine, _ = recommender_setup
    scores = content_engine.score_profile("hypertension blood pressure salt sodium reduction", preferred_categories=["Nutrition Education"])
    assert "RES-NUT-001" in scores
    # DASH Diet should rank high for hypertension and sodium
    assert scores["RES-NUT-001"] > 0.3


def test_cold_start_fallback(recommender_setup):
    _, _, collab_engine = recommender_setup
    empty_history = {}
    scores = collab_engine.score_user(empty_history)
    # Should return non-empty popularity dictionary without error
    assert len(scores) > 0
    for item_id, score in scores.items():
        assert 0.0 <= score <= 1.0


def test_hybrid_ranking_weights(recommender_setup):
    hybrid_engine, _, _ = recommender_setup
    profile = {
        "interests": ["mediterranean", "lipids"],
        "preferred_categories": ["Nutrition Education"],
        "trestbps": 125,
        "chol": 245
    }
    recs = hybrid_engine.recommend(profile, predicted_risk=0.30, top_k=3, apply_safety=True)
    assert len(recs) == 3
    assert recs[0]["hybrid_rank_score"] >= recs[1]["hybrid_rank_score"]
    assert "component_scores" in recs[0]
