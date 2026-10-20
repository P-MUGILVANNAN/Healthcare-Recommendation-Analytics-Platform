# REST API Documentation

Base URL: `http://localhost:8000/api`

Interactive OpenAPI Documentation: `http://localhost:8000/docs`

---

## Endpoints Summary

### 1. Health Check
- **Route:** `GET /health`
- **Description:** Verifies application status, database connectivity, and loaded ML model artifacts.
- **Sample Response:**
```json
{
  "status": "HEALTHY",
  "app_name": "Personalized Healthcare Recommendation Analytics",
  "version": "1.0.0",
  "database_connected": true,
  "model_loaded": true,
  "recommender_loaded": true
}
```

---

### 2. Get Educational Catalog
- **Route:** `GET /resources`
- **Description:** Retrieves all verified educational resources in catalog.

---

### 3. Validate Profile
- **Route:** `POST /profiles/validate`
- **Request Body:**
```json
{
  "age": 56,
  "trestbps": 148,
  "chol": 252,
  "interests": ["hypertension", "dash diet"],
  "acute_symptoms": []
}
```
- **Response:**
```json
{
  "is_valid": true,
  "data_quality_score": 0.8,
  "missing_fields": ["ca", "thal"],
  "warnings": [],
  "detected_emergency": false,
  "emergency_message": null
}
```

---

### 4. Cardiovascular Risk Inference
- **Route:** `POST /predictions`
- **Request Body:**
```json
{
  "profile": {
    "age": 62,
    "sex": 1,
    "cp": 4,
    "trestbps": 150,
    "chol": 260,
    "fbs": 1,
    "exang": 1,
    "oldpeak": 2.5
  }
}
```
- **Response:**
```json
{
  "predicted_probability": 0.8842,
  "predicted_label": 1,
  "risk_tier": "Elevated",
  "decision_threshold": 0.55,
  "local_feature_contributions": [
    {
      "feature": "Resting Blood Pressure",
      "patient_value": "150 mmHg",
      "baseline_importance": 0.125,
      "impact_direction": "Increases Risk",
      "clinical_note": "Elevated resting blood pressure increases systemic vascular resistance."
    }
  ],
  "model_version": "v1.2.0-calibrated",
  "disclaimer": "Educational research demonstration. Model probabilities reflect statistical association on benchmark data, NOT a validated clinical diagnosis."
}
```

---

### 5. Generate Recommendations
- **Route:** `POST /recommendations`
- **Request Body:**
```json
{
  "profile": {
    "age": 56,
    "trestbps": 148,
    "chol": 252,
    "interests": ["hypertension", "dash diet"],
    "preferred_categories": ["Nutrition Education"],
    "acute_symptoms": []
  },
  "top_k": 4,
  "apply_safety": true,
  "weights": {
    "alpha": 0.45,
    "beta": 0.20,
    "gamma": 0.20,
    "delta": 0.15
  }
}
```
- **Response:**
```json
{
  "session_id": "REC-SES-A1B2C3D4",
  "recommendations": [
    {
      "item_id": "RES-NUT-001",
      "title": "DASH Eating Plan for Cardiovascular & Blood Pressure Management",
      "category": "Nutrition Education",
      "description": "Evidence-based dietary approaches to stop hypertension...",
      "source": "NIH NHLBI",
      "source_url": "https://www.nhlbi.nih.gov/education/dash-eating-plan",
      "evidence_level": "Level A (Meta-analyses and randomized clinical trials)",
      "base_score": 0.8825,
      "hybrid_rank_score": 0.8825,
      "component_scores": {
        "content_relevance": 0.825,
        "collaborative_score": 0.75,
        "preference_match": 1.0,
        "quality_evidence": 1.0
      },
      "safety_evaluation": {
        "status": "ALLOW",
        "triggered_rules": [],
        "audit_message": "Verified educational resource complies with safety and suitability guidelines."
      },
      "explainability": {
        "matched_tags": ["hypertension", "blood pressure"],
        "rationales": ["Matched 2 profile interest tags (hypertension, blood pressure)"]
      }
    }
  ],
  "total_generated": 1,
  "total_filtered": 15,
  "predicted_risk": 0.584,
  "risk_tier": "Moderate",
  "emergency_alert": null,
  "safety_applied": true,
  "disclaimer": "Educational support system. Recommendations are for informational literacy only and do not replace personalized physician care."
}
```

---

### 6. Record Feedback
- **Route:** `POST /feedback`
- **Request Body:**
```json
{
  "item_id": "RES-NUT-001",
  "rating": 5,
  "usefulness_score": 1.0,
  "comments": "Highly informative guidelines.",
  "session_id": "REC-SES-A1B2C3D4"
}
```

---

### 7. Retrieve Analytics Summary
- **Route:** `GET /analytics/summary`
- **Description:** Returns aggregate catalog counts, processed profile counts, category distributions, and top recommended resources.
