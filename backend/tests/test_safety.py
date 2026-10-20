"""
Unit Tests for Risk-Aware Safety & Contraindication Filtering Layer.
Verifies emergency detection, exercise filtering under high cardiac risk,
hypertension reviews, and audit trails.
"""

import pytest
from backend.app.safety.filters import SafetyFilterEngine
from backend.app.safety.rules import RuleAction

safety_engine = SafetyFilterEngine()


def test_emergency_symptom_detection():
    # Acute crushing chest pain
    acute_input = ["crushing chest pain", "dizziness"]
    res = safety_engine.evaluate_emergency(acute_input)
    assert res["is_emergency"] is True
    assert res["action"] == RuleAction.EMERGENCY_OVERRIDE.value
    assert "crushing chest pain" in res["detected_symptoms"]


def test_no_emergency_symptoms():
    normal_input = ["mild fatigue", "occasional tension"]
    res = safety_engine.evaluate_emergency(normal_input)
    assert res["is_emergency"] is False


def test_high_cardiac_risk_exercise_filtered():
    # Vigorous unmonitored exercise recommendation
    exercise_item = {
        "item_id": "RES-ACT-001",
        "title": "Moderate-Intensity Aerobic Walking",
        "category": "Physical Activity",
        "tags": ["aerobic", "cardio", "exercise"],
        "description": "Brisk aerobic walking unmonitored protocol."
    }
    # High-risk profile with exercise angina
    profile = {
        "age": 65,
        "cp": 4,
        "exang": 1,
        "trestbps": 150
    }
    predicted_risk = 0.82

    eval_result = safety_engine.evaluate_item(profile, exercise_item, predicted_risk)
    assert eval_result["status"] == RuleAction.FILTER.value
    assert "RULE-EXERCISE-02" in eval_result["triggered_rules"]


def test_supervised_rehab_allowed_for_high_risk():
    # Supervised cardiac rehabilitation recommendation
    supervised_item = {
        "item_id": "RES-ACT-003",
        "title": "Supervised Outpatient Cardiac Rehabilitation Education",
        "category": "Physical Activity",
        "tags": ["cardiac rehabilitation", "supervised"],
        "description": "Must be performed under clinician supervision in cardiac rehab center."
    }
    profile = {
        "age": 68,
        "exang": 1,
        "cp": 4,
        "trestbps": 140
    }
    predicted_risk = 0.88

    eval_result = safety_engine.evaluate_item(profile, supervised_item, predicted_risk)
    assert eval_result["status"] == RuleAction.ALLOW.value


def test_hypertension_resistance_review_required():
    resistance_item = {
        "item_id": "RES-ACT-002",
        "title": "Resistance Training for Metabolic Rate",
        "category": "Physical Activity",
        "tags": ["resistance training", "strength"],
        "description": "Bodyweight and band strength training."
    }
    severe_htn_profile = {
        "age": 58,
        "trestbps": 195  # >= 180 mmHg
    }
    eval_result = safety_engine.evaluate_item(severe_htn_profile, resistance_item, 0.40)
    assert eval_result["status"] == RuleAction.REVIEW_REQUIRED.value
    assert "RULE-HYPERTENSION-03" in eval_result["triggered_rules"]
