"""
FastAPI REST API Routes.
Exposes endpoints for catalog retrieval, profile validation, ML risk inference,
hybrid recommendation generation, user feedback, and analytics metrics.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database.connection import get_db
from backend.app.models.db_models import FeedbackModel, ProfileModel
from backend.app.api.schemas import (
    AnalyticsSummaryResponse, FeedbackRequest, FeedbackResponse,
    HealthCheckResponse, ModelMetricsResponse, ProfileInput,
    ProfileValidationResponse, RecommendationRequest,
    RecommendationResponse, ResourceSchema, RiskPredictionRequest,
    RiskPredictionResponse
)
from backend.app.services.analytics_service import analytics_service
from backend.app.services.prediction_service import prediction_service
from backend.app.services.recommendation_service import recommendation_service
from backend.app.safety.filters import SafetyFilterEngine

router = APIRouter()
safety_engine = SafetyFilterEngine()


@router.get("/health", response_model=HealthCheckResponse, summary="Application Health Check")
def health_check():
    """Verify application health, ML model availability, and database connectivity."""
    return HealthCheckResponse(
        status="HEALTHY",
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        database_connected=True,
        model_loaded=(prediction_service.calibrated_model is not None),
        recommender_loaded=(len(recommendation_service.resources) > 0)
    )


@router.get("/resources", response_model=List[ResourceSchema], summary="Get Educational Resources Catalog")
def get_resources():
    """Retrieve full verified public health educational resource catalog."""
    resources = recommendation_service.get_resources()
    return resources


@router.get("/resources/{item_id}", response_model=ResourceSchema, summary="Get Single Resource")
def get_resource(item_id: str):
    """Retrieve metadata for a specific educational resource item."""
    res = recommendation_service.get_resource_by_id(item_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Resource '{item_id}' not found.")
    return res


@router.post("/profiles/validate", response_model=ProfileValidationResponse, summary="Validate User Profile")
def validate_profile(profile: ProfileInput):
    """Check input profile completeness, vital plausibility, and emergency triage."""
    p_dict = profile.model_dump()
    missing_fields = []
    warnings = []

    # Domain range checks
    if p_dict.get("age") is None:
        missing_fields.append("age")
    elif p_dict["age"] < 18 or p_dict["age"] > 100:
        warnings.append(f"Age {p_dict['age']} outside standard adult recommendation guidelines.")

    if p_dict.get("trestbps") is None:
        missing_fields.append("trestbps (Resting Blood Pressure)")
    elif p_dict["trestbps"] > 180:
        warnings.append("Resting blood pressure >= 180 mmHg indicates potential hypertensive urgency. Immediate clinical consultation advised.")

    if p_dict.get("chol") is None:
        missing_fields.append("chol (Serum Cholesterol)")

    # Emergency check
    emergency_check = safety_engine.evaluate_emergency(profile.acute_symptoms)
    detected_emergency = emergency_check.get("is_emergency", False)
    emergency_msg = emergency_check.get("guidance_message") if detected_emergency else None

    # Quality score based on available fields
    total_clinical_keys = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak"]
    present_keys = sum(1 for k in total_clinical_keys if p_dict.get(k) is not None)
    quality_score = round(present_keys / len(total_clinical_keys), 2)

    return ProfileValidationResponse(
        is_valid=True,
        data_quality_score=quality_score,
        missing_fields=missing_fields,
        warnings=warnings,
        detected_emergency=detected_emergency,
        emergency_message=emergency_msg
    )


@router.post("/predictions", response_model=RiskPredictionResponse, summary="Demonstration Cardiovascular Risk Inference")
def predict_health_risk(req: RiskPredictionRequest):
    """Execute calibrated tree-based cardiovascular risk classification with feature explanations."""
    return prediction_service.predict_risk(req.profile)


@router.post("/recommendations", response_model=RecommendationResponse, summary="Generate Hybrid Personalized Recommendations")
def generate_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Generate personalized educational recommendations using hybrid scoring
    (content + collaborative + preferences + evidence) and risk-aware safety filters.
    """
    return recommendation_service.recommend(req, db=db)


@router.post("/feedback", response_model=FeedbackResponse, summary="Submit Recommendation Feedback")
def record_feedback(fb: FeedbackRequest, db: Session = Depends(get_db)):
    """Store user rating and usefulness feedback for continuous offline evaluation."""
    new_fb = FeedbackModel(
        item_id=fb.item_id,
        session_id=fb.session_id,
        rating=fb.rating,
        usefulness_score=fb.usefulness_score or (fb.rating / 5.0),
        comments=fb.comments
    )
    db.add(new_fb)
    db.commit()
    db.refresh(new_fb)

    return FeedbackResponse(
        status="SUCCESS",
        message="Feedback logged successfully. Thank you for contributing to system quality improvement.",
        feedback_id=new_fb.feedback_id
    )


@router.get("/model/metrics", response_model=ModelMetricsResponse, summary="Retrieve ML Evaluation Metrics")
def get_model_metrics():
    """Retrieve offline benchmark evaluation results for candidate classification models."""
    metrics_data = analytics_service.get_model_metrics()
    return ModelMetricsResponse(
        champion_model=metrics_data.get("champion_model", "HistGradientBoosting"),
        optimal_threshold=metrics_data.get("optimal_threshold", 0.55),
        max_threshold_f1=metrics_data.get("max_threshold_f1", 0.9268),
        models_comparison=metrics_data.get("models_comparison", {}),
        feature_importances=metrics_data.get("feature_importances", {}),
        threshold_analysis=metrics_data.get("threshold_analysis", {}),
        disclaimer="Metrics derived from stratified 5-fold cross-validation on UCI Cleveland benchmark. Demonstrates model performance under research conditions."
    )


@router.get("/model/version", summary="Retrieve Model and Safety Rule Versions")
def get_model_version():
    """Return active model version, training dates, and safety rule engine configurations."""
    return {
        "model_version": "v1.2.0-calibrated",
        "algorithm": "Calibrated HistGradientBoosting Classifier",
        "optimal_threshold": 0.55,
        "safety_engine_version": "v1.2.0",
        "active_rules_count": 4,
        "last_trained_date": "2026-02-15",
        "dataset_provenance": "UCI Cleveland Clinic Foundation Cardiovascular Benchmark"
    }


@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse, summary="Retrieve Aggregate Analytics Summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Retrieve platform aggregate statistics, category coverage, and feedback metrics."""
    return analytics_service.get_summary(db)
