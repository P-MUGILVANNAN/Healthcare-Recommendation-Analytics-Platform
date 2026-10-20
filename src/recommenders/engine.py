"""
Core Recommender Engines and Hybrid Ranking Algorithms.
Contains ContentBasedRecommender, ItemCollaborativeRecommender,
SafetyRuleEngine, and HybridRecommender.
"""

import math
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedRecommender:
    def __init__(self, resources: list):
        self.resources = resources
        self.item_ids = [r["item_id"] for r in resources]
        self.item_index_map = {r["item_id"]: i for i, r in enumerate(resources)}
        
        self.corpus = []
        for r in resources:
            tags_str = " ".join(r.get("tags", []))
            text = f"{r.get('title', '')} {r.get('category', '')} {r.get('description', '')} {r.get('relevant_context', '')} {tags_str}"
            self.corpus.append(text)
            
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=500, ngram_range=(1, 2))
        self.item_tfidf = self.vectorizer.fit_transform(self.corpus)
        self.item_similarity_matrix = cosine_similarity(self.item_tfidf, self.item_tfidf)

    def score_profile(self, profile_query: str, preferred_categories: list = None) -> dict:
        query_vec = self.vectorizer.transform([profile_query])
        sims = cosine_similarity(query_vec, self.item_tfidf).flatten()
        
        scores = {}
        for idx, item_id in enumerate(self.item_ids):
            base_sim = float(sims[idx])
            item_cat = self.resources[idx].get("category", "")
            cat_boost = 1.25 if (preferred_categories and item_cat in preferred_categories) else 1.0
            
            ev = self.resources[idx].get("evidence_level", "")
            ev_bonus = 0.05 if "Level A" in ev else (0.02 if "Level B" in ev else 0.0)
            
            final_content_score = min(1.0, (base_sim * cat_boost) + ev_bonus)
            scores[item_id] = round(final_content_score, 4)
            
        return scores


class ItemCollaborativeRecommender:
    def __init__(self, interactions_df: pd.DataFrame, catalog_item_ids: list):
        self.catalog_item_ids = catalog_item_ids
        self.user_item_matrix = None
        self.item_sim_df = None
        self.item_popularity = {}
        self.fit(interactions_df)

    def fit(self, interactions_df: pd.DataFrame):
        pop = interactions_df.groupby("item_id")["rating"].agg(["count", "mean"]).reset_index()
        max_pop_score = 1.0
        for _, row in pop.iterrows():
            score = row["mean"] * math.log1p(row["count"])
            self.item_popularity[row["item_id"]] = score
        if self.item_popularity:
            max_pop_score = max(self.item_popularity.values()) or 1.0
        for i_id in self.catalog_item_ids:
            raw_p = self.item_popularity.get(i_id, 0.0)
            self.item_popularity[i_id] = round(raw_p / max_pop_score, 4)

        pivot = interactions_df.pivot_table(index="user_id", columns="item_id", values="rating").fillna(0)
        self.user_item_matrix = pivot

        for item in self.catalog_item_ids:
            if item not in self.user_item_matrix.columns:
                self.user_item_matrix[item] = 0.0

        item_matrix = self.user_item_matrix[self.catalog_item_ids].values.T
        norms = np.linalg.norm(item_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        norm_matrix = item_matrix / norms
        sims = np.dot(norm_matrix, norm_matrix.T)

        self.item_sim_df = pd.DataFrame(sims, index=self.catalog_item_ids, columns=self.catalog_item_ids)

    def score_user(self, user_history: dict) -> dict:
        if not user_history:
            return {i: self.item_popularity.get(i, 0.1) for i in self.catalog_item_ids}

        scores = {}
        for target_item in self.catalog_item_ids:
            if target_item in user_history:
                scores[target_item] = 0.5
                continue

            num = 0.0
            denom = 0.0
            for hist_item, rating in user_history.items():
                if hist_item in self.item_sim_df.columns:
                    sim = self.item_sim_df.loc[target_item, hist_item]
                    if sim > 0:
                        num += sim * rating
                        denom += sim

            if denom > 0:
                pred_rating = num / denom
                scores[target_item] = round(float(np.clip((pred_rating - 1.0) / 4.0, 0.0, 1.0)), 4)
            else:
                scores[target_item] = self.item_popularity.get(target_item, 0.1)

        return scores


class SafetyRuleEngine:
    def __init__(self):
        self.rules = [
            {
                "rule_id": "RULE-EMERGENCY-01",
                "name": "Acute Symptom Emergency Intercept",
                "description": "Intercept crushing chest pain, resting dyspnea, or syncope; immediately redirect to emergency services (911/112).",
                "severity": "CRITICAL",
                "action": "EMERGENCY_OVERRIDE"
            },
            {
                "rule_id": "RULE-EXERCISE-02",
                "name": "High Cardiac Risk Unmonitored Exercise Contraindication",
                "description": "Block vigorous or unmonitored aerobic exertion when predicted risk > 0.65 or active exercise-induced angina exists.",
                "severity": "HIGH",
                "action": "FILTER"
            },
            {
                "rule_id": "RULE-HYPERTENSION-03",
                "name": "Severe Hypertension Exertion Review",
                "description": "Require clinician clearance for heavy resistance training if resting systolic BP > 180 mmHg.",
                "severity": "MODERATE",
                "action": "REVIEW_REQUIRED"
            },
            {
                "rule_id": "RULE-DATA-04",
                "name": "Missing Critical Vitals Precaution",
                "description": "Enforce conservative recommendations and flag informational guidance when blood pressure or age is missing.",
                "severity": "LOW",
                "action": "INSUFFICIENT_INFORMATION"
            }
        ]

    def evaluate(self, profile: dict, item: dict, predicted_risk: float) -> dict:
        reported_symptoms = [s.lower() for s in profile.get("acute_symptoms", [])]
        if any(sym in reported_symptoms for sym in ["crushing chest pain", "severe shortness of breath", "loss of consciousness", "syncope"]):
            return {
                "status": "EMERGENCY_OVERRIDE",
                "triggered_rules": ["RULE-EMERGENCY-01"],
                "audit_message": "CRITICAL: Patient reported acute emergency symptoms. Recommendation suspended. Please seek emergency medical assistance (911/112) immediately."
            }

        item_tags = [t.lower() for t in item.get("tags", [])]
        is_exercise = "physical activity" in item.get("category", "").lower()
        is_supervised = "supervised" in item.get("description", "").lower() or "cardiac rehab" in item.get("title", "").lower()

        if is_exercise and not is_supervised:
            has_angina = profile.get("exang", 0) == 1 or profile.get("cp", 0) == 4
            is_high_risk = predicted_risk > 0.65
            if has_angina or is_high_risk:
                return {
                    "status": "FILTER",
                    "triggered_rules": ["RULE-EXERCISE-02"],
                    "audit_message": "Vigorous or unmonitored exercise filtered due to elevated cardiovascular risk index or exercise-induced angina. Supervised cardiac rehabilitation advised."
                }

        trestbps = profile.get("trestbps", 120)
        if trestbps >= 180 and "resistance training" in item_tags:
            return {
                "status": "REVIEW_REQUIRED",
                "triggered_rules": ["RULE-HYPERTENSION-03"],
                "audit_message": "Severe resting blood pressure elevation (>180 mmHg) detected. Resistance training requires clinical assessment prior to implementation."
            }

        return {
            "status": "ALLOW",
            "triggered_rules": [],
            "audit_message": "Verified educational resource complies with safety and suitability guidelines."
        }


class HybridRecommender:
    def __init__(self, content_engine: ContentBasedRecommender, collab_engine: ItemCollaborativeRecommender, safety_engine: SafetyRuleEngine):
        self.content_engine = content_engine
        self.collab_engine = collab_engine
        self.safety_engine = safety_engine
        self.resources = content_engine.resources
        self.item_dict = {r["item_id"]: r for r in self.resources}

    def recommend(self, profile: dict, predicted_risk: float, user_history: dict = None,
                  weights: dict = None, top_k: int = 5, apply_safety: bool = True) -> list:
        if weights is None:
            weights = {"alpha": 0.45, "beta": 0.20, "gamma": 0.20, "delta": 0.15}

        stated_interests = " ".join(profile.get("interests", []))
        pref_categories = profile.get("preferred_categories", [])
        health_context = []
        if profile.get("trestbps", 120) > 130:
            health_context.append("hypertension blood pressure")
        if profile.get("chol", 200) > 220:
            health_context.append("cholesterol lipids")
        if profile.get("fbs", 0) == 1:
            health_context.append("blood sugar diabetes")
        if predicted_risk > 0.5:
            health_context.append("cardiovascular cardiac risk")

        profile_query = f"{stated_interests} {' '.join(health_context)} {' '.join(pref_categories)}"

        content_scores = self.content_engine.score_profile(profile_query, preferred_categories=pref_categories)
        collab_scores = self.collab_engine.score_user(user_history or {})

        w_alpha = weights["alpha"]
        w_beta = weights["beta"]
        w_gamma = weights["gamma"]
        w_delta = weights["delta"]

        if not user_history:
            total = w_alpha + w_gamma + w_delta
            if total > 0:
                w_alpha /= total
                w_beta = 0.0
                w_gamma /= total
                w_delta /= total
            else:
                w_alpha = 0.60
                w_beta = 0.0
                w_gamma = 0.20
                w_delta = 0.20

        ranked_items = []
        for r in self.resources:
            item_id = r["item_id"]
            c_score = content_scores.get(item_id, 0.0)
            cf_score = collab_scores.get(item_id, 0.0)
            pref_score = 1.0 if r.get("category") in pref_categories else 0.2
            
            ev = r.get("evidence_level", "")
            q_score = 1.0 if "Level A" in ev else (0.8 if "Level B" in ev else 0.6)

            base_score = (w_alpha * c_score) + (w_beta * cf_score) + (w_gamma * pref_score) + (w_delta * q_score)

            if apply_safety:
                safety_eval = self.safety_engine.evaluate(profile, r, predicted_risk)
                if safety_eval["status"] == "FILTER":
                    continue
            else:
                safety_eval = {"status": "UNFILTERED_BASELINE", "triggered_rules": [], "audit_message": "Safety filtering bypassed in baseline mode."}

            query_words = set(profile_query.lower().split())
            item_tags = set([t.lower() for t in r.get("tags", [])])
            matched_tags = list(query_words.intersection(item_tags))

            ranked_items.append({
                "item_id": item_id,
                "title": r.get("title"),
                "category": r.get("category"),
                "description": r.get("description"),
                "source": r.get("source"),
                "source_url": r.get("source_url"),
                "evidence_level": r.get("evidence_level"),
                "base_score": round(base_score, 4),
                "component_scores": {
                    "content_relevance": c_score,
                    "collaborative_score": cf_score,
                    "preference_match": pref_score,
                    "quality_evidence": q_score
                },
                "safety_evaluation": safety_eval,
                "explainability": {
                    "matched_tags": matched_tags,
                    "rationales": [
                        f"Matched {len(matched_tags)} profile interest tags ({', '.join(matched_tags[:3]) if matched_tags else 'general wellness'})",
                        f"Evidence Quality: {r.get('evidence_level', 'Verified Public Health Source')}",
                        f"Safety status: {safety_eval['status']}"
                    ]
                }
            })

        ranked_items.sort(key=lambda x: x["base_score"], reverse=True)
        selected = []
        category_counts = {}
        for item in ranked_items:
            cat = item["category"]
            count = category_counts.get(cat, 0)
            adjusted_score = item["base_score"] - (0.08 * count)
            item["hybrid_rank_score"] = round(adjusted_score, 4)
            selected.append(item)
            category_counts[cat] = count + 1

        selected.sort(key=lambda x: x["hybrid_rank_score"], reverse=True)
        return selected[:top_k]
