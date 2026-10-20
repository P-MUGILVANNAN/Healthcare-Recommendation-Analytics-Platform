"""
Pydantic Request & Response Schemas.
Enforces strict input validation, data minimization, and standardized API payloads.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database_connected: bool
    model_loaded: bool
    recommender_loaded: bool


class ProfileInput(BaseModel):
    age: Optional[int] = Field(None, ge=18, le=105, description="Age in years")
    sex: Optional[int] = Field(None, ge=0, le=1, description="1: Male, 0: Female")
    cp: Optional[int] = Field(None, ge=1, le=4, description="1: Typical Angina, 2: Atypical, 3: Non-anginal, 4: Asymptomatic")
    trestbps: Optional[int] = Field(None, ge=70, le=260, description="Resting systolic blood pressure (mmHg)")
    chol: Optional[int] = Field(None, ge=100, le=600, description="Serum cholesterol (mg/dl)")
    fbs: Optional[int] = Field(0, ge=0, le=1, description="Fasting blood sugar > 120 mg/dl")
    restecg: Optional[int] = Field(0, ge=0, le=2, description="Resting ECG results")
    thalach: Optional[int] = Field(None, ge=60, le=220, description="Maximum heart rate achieved")
    exang: Optional[int] = Field(0, ge=0, le=1, description="Exercise-induced angina (1: Yes, 0: No)")
    oldpeak: Optional[float] = Field(0.0, ge=0.0, le=7.0, description="ST depression induced by exercise")
    slope: Optional[int] = Field(1, ge=1, le=3, description="Slope of peak exercise ST segment")
    ca: Optional[int] = Field(0, ge=0, le=3, description="Number of major vessels colored by flourosopy")
    thal: Optional[int] = Field(3, description="Thalassemia status: 3 (normal), 6 (fixed), 7 (reversible)")
    
    interests: List[str] = Field(default_factory=list, description="Stated wellness interests (e.g., blood pressure, cardio)")
    preferred_categories: List[str] = Field(default_factory=list, description="Target education categories")
    acute_symptoms: List[str] = Field(default_factory=list, description="Reported acute symptoms for emergency triage")


class ProfileValidationResponse(BaseModel):
    is_valid: bool
    data_quality_score: float
    missing_fields: List[str]
    warnings: List[str]
    detected_emergency: bool = False
    emergency_message: Optional[str] = None


class RiskPredictionRequest(BaseModel):
    profile: ProfileInput


class FeatureContribution(BaseModel):
    feature: str
    patient_value: Any
    baseline_importance: float
    impact_direction: str  # "Increases Risk" | "Decreases Risk" | "Neutral"
    clinical_note: str


class RiskPredictionResponse(BaseModel):
    predicted_probability: float
    predicted_label: int
    risk_tier: str  # "Low", "Moderate", "Elevated"
    decision_threshold: float
    local_feature_contributions: List[FeatureContribution]
    model_version: str
    disclaimer: str


class CustomWeights(BaseModel):
    alpha: float = Field(0.45, ge=0.0, le=1.0, description="Content relevance weight")
    beta: float = Field(0.20, ge=0.0, le=1.0, description="Collaborative score weight")
    gamma: float = Field(0.20, ge=0.0, le=1.0, description="Preference match weight")
    delta: float = Field(0.15, ge=0.0, le=1.0, description="Evidence quality weight")


class RecommendationRequest(BaseModel):
    profile: ProfileInput
    user_id: Optional[str] = None
    top_k: int = Field(5, ge=1, le=16)
    apply_safety: bool = True
    weights: Optional[CustomWeights] = None


class ComponentScores(BaseModel):
    content_relevance: float
    collaborative_score: float
    preference_match: float
    quality_evidence: float


class SafetyEvaluation(BaseModel):
    status: str
    triggered_rules: List[str]
    audit_message: str


class RecommendationExplainability(BaseModel):
    matched_tags: List[str]
    rationales: List[str]


class RecommendationItemResponse(BaseModel):
    item_id: str
    title: str
    category: str
    description: str
    source: str
    source_url: str
    evidence_level: Optional[str]
    base_score: float
    hybrid_rank_score: float
    component_scores: ComponentScores
    safety_evaluation: SafetyEvaluation
    explainability: RecommendationExplainability


class EmergencyAlertPayload(BaseModel):
    is_emergency: bool
    guidance_message: str
    detected_symptoms: List[str]


class RecommendationResponse(BaseModel):
    session_id: str
    recommendations: List[RecommendationItemResponse]
    total_generated: int
    total_filtered: int
    predicted_risk: Optional[float]
    risk_tier: Optional[str]
    emergency_alert: Optional[EmergencyAlertPayload] = None
    safety_applied: bool
    disclaimer: str


class FeedbackRequest(BaseModel):
    item_id: str
    rating: int = Field(..., ge=1, le=5)
    usefulness_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    comments: Optional[str] = None
    session_id: Optional[str] = None


class FeedbackResponse(BaseModel):
    status: str
    message: str
    feedback_id: int


class ModelMetricsResponse(BaseModel):
    champion_model: str
    optimal_threshold: float
    max_threshold_f1: float
    models_comparison: Dict[str, Any]
    feature_importances: Dict[str, float]
    threshold_analysis: Dict[str, Any]
    disclaimer: str


class ResourceSchema(BaseModel):
    item_id: str
    title: str
    category: str
    description: str
    tags: List[str]
    source: str
    source_url: str
    intended_audience: Optional[str]
    relevant_context: Optional[str]
    contraindication_notes: Optional[str]
    evidence_level: Optional[str]
    last_verified_at: Optional[str]


class AnalyticsSummaryResponse(BaseModel):
    total_resources: int
    processed_profiles: int
    recommendation_events: int
    average_feedback_rating: float
    categories_breakdown: Dict[str, int]
    evidence_distribution: Dict[str, int]
    safety_interventions_count: int
    top_recommended_resources: List[Dict[str, Any]]
