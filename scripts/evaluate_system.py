"""
Recommendation Engine, Hybrid Ranking, Safety Layer & Benchmark Evaluation Pipeline.
Evaluates:
1. Popularity Baseline
2. TF-IDF Content-Based Recommender
3. Item-Based Collaborative Filtering with Cold-Start Handling
4. Hybrid Recommender
5. Risk-Aware Hybrid Recommender
Produces recommender model artifacts and saves evaluation metrics.
"""

import json
import math
import os
import sys
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.recommenders.engine import (
    ContentBasedRecommender,
    ItemCollaborativeRecommender,
    SafetyRuleEngine,
    HybridRecommender
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
SYNTHETIC_DIR = os.path.join(BASE_DIR, "data", "synthetic")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METRICS_DIR = os.path.join(BASE_DIR, "reports", "metrics")


def evaluate_recommendation_models():
    print("[*] Starting offline leakage-safe recommendation engine evaluation...")
    with open(os.path.join(RAW_DATA_DIR, "health_resources.json"), "r", encoding="utf-8") as f:
        resources = json.load(f)

    interactions_df = pd.read_csv(os.path.join(SYNTHETIC_DIR, "interactions.csv"))
    item_ids = [r["item_id"] for r in resources]

    # Temporal / User-Group Holdout Split (80% Train Interactions, 20% Test Interactions)
    np.random.seed(42)
    users = interactions_df["user_id"].unique()
    test_users = np.random.choice(users, size=int(len(users) * 0.20), replace=False)
    train_users = [u for u in users if u not in test_users]

    train_interactions = interactions_df[interactions_df["user_id"].isin(train_users)]
    test_interactions = interactions_df[interactions_df["user_id"].isin(test_users)]

    # Instantiate engines
    content_engine = ContentBasedRecommender(resources)
    collab_engine = ItemCollaborativeRecommender(train_interactions, item_ids)
    safety_engine = SafetyRuleEngine()
    hybrid_engine = HybridRecommender(content_engine, collab_engine, safety_engine)

    # Benchmark architectures to compare:
    models_to_test = [
        "Popularity Baseline",
        "Content-Based",
        "Collaborative Filtering",
        "Hybrid Recommender",
        "Risk-Aware Hybrid Recommender"
    ]

    metrics = {m: {"P@3": [], "R@3": [], "NDCG@3": [], "P@5": [], "R@5": [], "NDCG@5": [], "HitRate@5": [], "recommended_items": set(), "diversities": []} for m in models_to_test}

    # Evaluate on test user cohort
    for user_id in test_users:
        u_records = test_interactions[test_interactions["user_id"] == user_id]
        ground_truth_items = set(u_records[u_records["rating"] >= 3.0]["item_id"])
        if not ground_truth_items:
            continue

        user_pref_cat = np.random.choice(["Nutrition Education", "Physical Activity", "Preventive Health"])
        user_profile = {
            "interests": ["blood pressure", "cholesterol", "wellness"],
            "preferred_categories": [user_pref_cat],
            "trestbps": 135,
            "chol": 230,
            "fbs": 0,
            "cp": 2,
            "exang": 0
        }
        sim_risk = 0.45

        u_train = train_interactions[train_interactions["user_id"] == user_id]
        history = dict(zip(u_train["item_id"], u_train["rating"]))

        for m_name in models_to_test:
            if m_name == "Popularity Baseline":
                top_items = sorted(item_ids, key=lambda i: collab_engine.item_popularity.get(i, 0), reverse=True)[:5]
            elif m_name == "Content-Based":
                recs = hybrid_engine.recommend(user_profile, sim_risk, user_history={},
                                               weights={"alpha": 1.0, "beta": 0.0, "gamma": 0.0, "delta": 0.0}, top_k=5, apply_safety=False)
                top_items = [r["item_id"] for r in recs]
            elif m_name == "Collaborative Filtering":
                recs = hybrid_engine.recommend(user_profile, sim_risk, user_history=history,
                                               weights={"alpha": 0.0, "beta": 1.0, "gamma": 0.0, "delta": 0.0}, top_k=5, apply_safety=False)
                top_items = [r["item_id"] for r in recs]
            elif m_name == "Hybrid Recommender":
                recs = hybrid_engine.recommend(user_profile, sim_risk, user_history=history, top_k=5, apply_safety=False)
                top_items = [r["item_id"] for r in recs]
            elif m_name == "Risk-Aware Hybrid Recommender":
                recs = hybrid_engine.recommend(user_profile, sim_risk, user_history=history, top_k=5, apply_safety=True)
                top_items = [r["item_id"] for r in recs]

            metrics[m_name]["recommended_items"].update(top_items)

            for k in [3, 5]:
                k_items = top_items[:k]
                hits = [1 if item in ground_truth_items else 0 for item in k_items]
                p_at_k = sum(hits) / k
                r_at_k = sum(hits) / len(ground_truth_items)
                
                dcg = sum((hit / math.log2(idx + 2)) for idx, hit in enumerate(hits))
                idcg = sum((1.0 / math.log2(idx + 2)) for idx in range(min(len(ground_truth_items), k)))
                ndcg = (dcg / idcg) if idcg > 0 else 0.0

                metrics[m_name][f"P@{k}"].append(p_at_k)
                metrics[m_name][f"R@{k}"].append(r_at_k)
                metrics[m_name][f"NDCG@{k}"].append(ndcg)

            hit_rate = 1.0 if any(i in ground_truth_items for i in top_items[:5]) else 0.0
            metrics[m_name]["HitRate@5"].append(hit_rate)

            recom_cats = [hybrid_engine.item_dict[i]["category"] for i in top_items if i in hybrid_engine.item_dict]
            unique_ratio = len(set(recom_cats)) / max(1, len(recom_cats))
            metrics[m_name]["diversities"].append(unique_ratio)

    summary = {}
    for m_name in models_to_test:
        cov = len(metrics[m_name]["recommended_items"]) / len(item_ids) * 100
        summary[m_name] = {
            "Precision@3": round(float(np.mean(metrics[m_name]["P@3"])), 4),
            "Recall@3": round(float(np.mean(metrics[m_name]["R@3"])), 4),
            "NDCG@3": round(float(np.mean(metrics[m_name]["NDCG@3"])), 4),
            "Precision@5": round(float(np.mean(metrics[m_name]["P@5"])), 4),
            "Recall@5": round(float(np.mean(metrics[m_name]["R@5"])), 4),
            "NDCG@5": round(float(np.mean(metrics[m_name]["NDCG@5"])), 4),
            "HitRate@5": round(float(np.mean(metrics[m_name]["HitRate@5"])), 4),
            "CatalogCoverage_Pct": round(float(cov), 2),
            "IntraListDiversity": round(float(np.mean(metrics[m_name]["diversities"])), 4)
        }
        print(f"[{m_name}] -> P@5: {summary[m_name]['Precision@5']} | NDCG@5: {summary[m_name]['NDCG@5']} | Coverage: {summary[m_name]['CatalogCoverage_Pct']}% | Diversity: {summary[m_name]['IntraListDiversity']}")

    pipeline_artifact = {
        "content_engine": content_engine,
        "collab_engine": collab_engine,
        "safety_engine": safety_engine,
        "hybrid_engine": hybrid_engine,
        "resources": resources,
        "summary_metrics": summary
    }
    joblib.dump(pipeline_artifact, os.path.join(MODELS_DIR, "recommender_pipeline.joblib"))
    print(f"[+] Serialized recommendation pipeline to {MODELS_DIR}/recommender_pipeline.joblib")

    with open(os.path.join(METRICS_DIR, "recommendation_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"[SUCCESS] Recommender benchmark evaluation complete. Metrics saved to {METRICS_DIR}/recommendation_metrics.json")


if __name__ == "__main__":
    evaluate_recommendation_models()
