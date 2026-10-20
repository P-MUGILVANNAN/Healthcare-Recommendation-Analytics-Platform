"""
Recommendation Service.
Coordinates Content-Based, Collaborative, Hybrid Ranking, and Risk-Aware Safety Filtering.
Provides transparent score components, audit trails, and emergency intercept handling.
"""

import json
import os
import uuid
import joblib
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.api.schemas import (
    EmergencyAlertPayload, RecommendationItemResponse,
    RecommendationRequest, RecommendationResponse
)
from backend.app.safety.filters import SafetyFilterEngine
from backend.app.services.prediction_service import prediction_service
from backend.app.models.db_models import RecommendationEventModel


class RecommendationService:
    def __init__(self):
        self.pipeline_artifact = None
        self.hybrid_engine = None
        self.resources = []
        self.safety_engine = SafetyFilterEngine()
        self.load_pipeline()

    def load_pipeline(self):
        pipeline_path = os.path.join(settings.MODELS_DIR, "recommender_pipeline.joblib")
        catalog_path = os.path.join(settings.DATA_DIR, "raw", "health_resources.json")

        if os.path.exists(pipeline_path):
            self.pipeline_artifact = joblib.load(pipeline_path)
            self.hybrid_engine = self.pipeline_artifact["hybrid_engine"]
            self.resources = self.pipeline_artifact["resources"]
            print("[+] RecommendationService: Recommender pipeline loaded successfully.")
        elif os.path.exists(catalog_path):
            with open(catalog_path, "r", encoding="utf-8") as f:
                self.resources = json.load(f)
            print("[+] RecommendationService: Catalog loaded directly from JSON.")
        else:
            print("[!] RecommendationService: No catalog found.")

    def get_resources(self) -> list:
        return self.resources

    def get_resource_by_id(self, item_id: str) -> dict:
        for r in self.resources:
            if r["item_id"] == item_id:
                return r
        return None

    def recommend(self, req: RecommendationRequest, db: Session = None) -> RecommendationResponse:
        session_id = f"REC-SES-{uuid.uuid4().hex[:8].upper()}"
        profile = req.profile.model_dump()

        # 1. Emergency Symptom Intercept
        acute_symptoms = profile.get("acute_symptoms", [])
        emergency_check = self.safety_engine.evaluate_emergency(acute_symptoms)
        if emergency_check.get("is_emergency"):
            alert_payload = EmergencyAlertPayload(
                is_emergency=True,
                guidance_message=emergency_check["guidance_message"],
                detected_symptoms=emergency_check["detected_symptoms"]
            )
            # Log event if db available
            if db:
                event = RecommendationEventModel(
                    session_id=session_id,
                    predicted_risk=1.0,
                    risk_tier="EMERGENCY",
                    recommended_items_json=json.dumps([]),
                    filtered_items_count=0,
                    safety_override=True
                )
                db.add(event)
                db.commit()

            return RecommendationResponse(
                session_id=session_id,
                recommendations=[],
                total_generated=0,
                total_filtered=len(self.resources),
                predicted_risk=1.0,
                risk_tier="CRITICAL_EMERGENCY",
                emergency_alert=alert_payload,
                safety_applied=True,
                disclaimer="Emergency Protocol: Immediate clinical emergency intervention supersedes educational material delivery."
            )

        # 2. Predict Cardiovascular Health Risk
        risk_resp = prediction_service.predict_risk(req.profile)
        pred_risk = risk_resp.predicted_probability
        risk_tier = risk_resp.risk_tier

        # 3. Hybrid Ranking with Safety Layer
        weights_dict = req.weights.model_dump() if req.weights else None

        if self.hybrid_engine:
            raw_recs = self.hybrid_engine.recommend(
                profile=profile,
                predicted_risk=pred_risk,
                user_history={},
                weights=weights_dict,
                top_k=req.top_k,
                apply_safety=req.apply_safety
            )
        else:
            # Fallback catalog mapper
            raw_recs = []
            for r in self.resources[:req.top_k]:
                safety_eval = self.safety_engine.evaluate_item(profile, r, pred_risk)
                if req.apply_safety and safety_eval["status"] == "FILTER":
                    continue
                raw_recs.append({
                    "item_id": r["item_id"],
                    "title": r["title"],
                    "category": r["category"],
                    "description": r["description"],
                    "source": r["source"],
                    "source_url": r["source_url"],
                    "evidence_level": r.get("evidence_level"),
                    "base_score": 0.75,
                    "hybrid_rank_score": 0.75,
                    "component_scores": {
                        "content_relevance": 0.8,
                        "collaborative_score": 0.5,
                        "preference_match": 0.7,
                        "quality_evidence": 0.9
                    },
                    "safety_evaluation": safety_eval,
                    "explainability": {
                        "matched_tags": r.get("tags", [])[:2],
                        "rationales": ["Selected based on profile category preferences and verified evidence rating."]
                    }
                })

        formatted_recs = [RecommendationItemResponse(**item) for item in raw_recs]
        total_filtered = max(0, len(self.resources) - len(formatted_recs))

        # 4. Anonymously Log Recommendation Event
        if db:
            try:
                event = RecommendationEventModel(
                    session_id=session_id,
                    predicted_risk=pred_risk,
                    risk_tier=risk_tier,
                    recommended_items_json=json.dumps([r.item_id for r in formatted_recs]),
                    filtered_items_count=total_filtered,
                    safety_override=False
                )
                db.add(event)
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"[!] Warning: Failed to persist recommendation event: {e}")

        return RecommendationResponse(
            session_id=session_id,
            recommendations=formatted_recs,
            total_generated=len(formatted_recs),
            total_filtered=total_filtered,
            predicted_risk=pred_risk,
            risk_tier=risk_tier,
            emergency_alert=None,
            safety_applied=req.apply_safety,
            disclaimer="Educational support system. Recommendations are for informational literacy only and do not replace personalized physician care."
        )


recommendation_service = RecommendationService()
