export interface ProfileInput {
  age?: number;
  sex?: number;
  cp?: number;
  trestbps?: number;
  chol?: number;
  fbs?: number;
  restecg?: number;
  thalach?: number;
  exang?: number;
  oldpeak?: number;
  slope?: number;
  ca?: number;
  thal?: number;
  interests: string[];
  preferred_categories: string[];
  acute_symptoms: string[];
}

export interface ProfileValidationResponse {
  is_valid: boolean;
  data_quality_score: number;
  missing_fields: string[];
  warnings: string[];
  detected_emergency: boolean;
  emergency_message?: string;
}

export interface FeatureContribution {
  feature: string;
  patient_value: string;
  baseline_importance: number;
  impact_direction: 'Increases Risk' | 'Decreases Risk' | 'Neutral';
  clinical_note: string;
}

export interface RiskPredictionResponse {
  predicted_probability: number;
  predicted_label: number;
  risk_tier: 'Low' | 'Moderate' | 'Elevated';
  decision_threshold: number;
  local_feature_contributions: FeatureContribution[];
  model_version: string;
  disclaimer: string;
}

export interface ComponentScores {
  content_relevance: number;
  collaborative_score: number;
  preference_match: number;
  quality_evidence: number;
}

export interface SafetyEvaluation {
  status: 'ALLOW' | 'FILTER' | 'REVIEW_REQUIRED' | 'INSUFFICIENT_INFORMATION' | 'EMERGENCY_OVERRIDE';
  triggered_rules: string[];
  audit_message: string;
}

export interface RecommendationExplainability {
  matched_tags: string[];
  rationales: string[];
}

export interface RecommendationItem {
  item_id: string;
  title: string;
  category: string;
  description: string;
  source: string;
  source_url: string;
  evidence_level?: string;
  base_score: number;
  hybrid_rank_score: number;
  component_scores: ComponentScores;
  safety_evaluation: SafetyEvaluation;
  explainability: RecommendationExplainability;
}

export interface EmergencyAlertPayload {
  is_emergency: boolean;
  guidance_message: string;
  detected_symptoms: string[];
}

export interface RecommendationResponse {
  session_id: string;
  recommendations: RecommendationItem[];
  total_generated: number;
  total_filtered: number;
  predicted_risk?: number;
  risk_tier?: string;
  emergency_alert?: EmergencyAlertPayload;
  safety_applied: boolean;
  disclaimer: string;
}

export interface Resource {
  item_id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  source: string;
  source_url: string;
  intended_audience?: string;
  relevant_context?: string;
  contraindication_notes?: string;
  evidence_level?: string;
  last_verified_at?: string;
}

export interface ModelMetricsResponse {
  champion_model: string;
  optimal_threshold: number;
  max_threshold_f1: number;
  models_comparison: Record<string, any>;
  feature_importances: Record<string, number>;
  threshold_analysis: Record<string, any>;
  disclaimer: string;
}

export interface AnalyticsSummary {
  total_resources: number;
  processed_profiles: number;
  recommendation_events: number;
  average_feedback_rating: number;
  categories_breakdown: Record<string, number>;
  evidence_distribution: Record<string, number>;
  safety_interventions_count: number;
  top_recommended_resources: Array<{
    item_id: string;
    title: string;
    category: string;
    evidence: string;
    popularity_pct: number;
  }>;
}
