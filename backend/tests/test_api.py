"""
Integration & Functional API Tests.
Verifies all FastAPI routes, payload validations, error behaviors, and response structures.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["database_connected"] is True
    assert data["model_loaded"] is True
    assert data["recommender_loaded"] is True


def test_get_resources():
    response = client.get("/api/resources")
    assert response.status_code == 200
    resources = response.json()
    assert isinstance(resources, list)
    assert len(resources) > 0
    first = resources[0]
    assert "item_id" in first
    assert "title" in first
    assert "category" in first


def test_get_single_resource():
    response = client.get("/api/resources/RES-NUT-001")
    assert response.status_code == 200
    data = response.json()
    assert data["item_id"] == "RES-NUT-001"
    assert "DASH" in data["title"]


def test_get_nonexistent_resource():
    response = client.get("/api/resources/NON-EXISTENT-999")
    assert response.status_code == 404


def test_validate_profile():
    payload = {
        "age": 55,
        "trestbps": 140,
        "chol": 240,
        "interests": ["blood pressure", "nutrition"]
    }
    response = client.post("/api/profiles/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["detected_emergency"] is False


def test_risk_prediction():
    payload = {
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
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_probability" in data
    assert "predicted_label" in data
    assert data["risk_tier"] in ["Low", "Moderate", "Elevated"]
    assert len(data["local_feature_contributions"]) > 0


def test_recommendation_generation():
    payload = {
        "profile": {
            "age": 48,
            "trestbps": 132,
            "chol": 210,
            "interests": ["cardio", "nutrition"],
            "preferred_categories": ["Nutrition Education", "Physical Activity"]
        },
        "top_k": 4,
        "apply_safety": True
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) <= 4
    if len(data["recommendations"]) > 0:
        first_rec = data["recommendations"][0]
        assert "hybrid_rank_score" in first_rec
        assert "component_scores" in first_rec
        assert "safety_evaluation" in first_rec


def test_emergency_override():
    payload = {
        "profile": {
            "age": 60,
            "acute_symptoms": ["crushing chest pain", "syncope"]
        },
        "top_k": 5,
        "apply_safety": True
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["emergency_alert"] is not None
    assert data["emergency_alert"]["is_emergency"] is True
    assert len(data["recommendations"]) == 0


def test_submit_feedback():
    payload = {
        "item_id": "RES-NUT-001",
        "rating": 5,
        "usefulness_score": 1.0,
        "comments": "Very informative DASH guidelines."
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"


def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_resources"] > 0
    assert data["processed_profiles"] > 0
    assert "categories_breakdown" in data
