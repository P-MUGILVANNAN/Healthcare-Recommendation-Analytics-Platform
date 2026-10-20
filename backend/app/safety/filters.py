"""
Safety Filter Execution Engine.
Evaluates candidate recommendations against user health state, vital signs, and safety rules.
"""

from typing import Any, Dict, List
from backend.app.safety.rules import DEFAULT_SAFETY_RULES, RuleAction


class SafetyFilterEngine:
    def __init__(self, rules=None):
        self.rules = rules or DEFAULT_SAFETY_RULES

    def evaluate_emergency(self, acute_symptoms: List[str]) -> Dict[str, Any]:
        """Check for acute emergency presentations."""
        emergency_terms = {
            "crushing chest pain", "severe chest pressure",
            "loss of consciousness", "syncope", "severe shortness of breath at rest"
        }
        reported = [s.strip().lower() for s in acute_symptoms if s]
        detected = [sym for sym in reported if sym in emergency_terms]

        if detected:
            return {
                "is_emergency": True,
                "action": RuleAction.EMERGENCY_OVERRIDE.value,
                "rule_id": "RULE-EMERGENCY-01",
                "detected_symptoms": detected,
                "guidance_message": "CRITICAL EMERGENCY ALERT: You have reported acute emergency symptoms that require urgent medical evaluation. Do not delay care or rely on educational apps. Call 911 (or your local emergency number) or go to the nearest emergency room immediately."
            }
        return {"is_emergency": False}

    def evaluate_item(self, profile: Dict[str, Any], item: Dict[str, Any], predicted_risk: float) -> Dict[str, Any]:
        """
        Evaluate a single candidate recommendation item against profile constraints.
        Returns: {
            "status": "ALLOW" | "FILTER" | "REVIEW_REQUIRED" | "INSUFFICIENT_INFORMATION",
            "triggered_rules": [...],
            "audit_message": "..."
        }
        """
        category = item.get("category", "").lower()
        title = item.get("title", "").lower()
        desc = item.get("description", "").lower()
        tags = [t.lower() for t in item.get("tags", [])]

        # 1. High cardiac risk & unmonitored exercise contraindication
        is_exercise = "physical activity" in category or "exercise" in tags
        is_supervised = "supervised" in desc or "cardiac rehab" in title

        has_angina = profile.get("exang", 0) == 1 or profile.get("cp", 0) == 4
        is_high_risk = predicted_risk > 0.65

        if is_exercise and not is_supervised and (has_angina or is_high_risk):
            return {
                "status": RuleAction.FILTER.value,
                "triggered_rules": ["RULE-EXERCISE-02"],
                "audit_message": "Filtered unmonitored vigorous aerobic exercise due to high cardiovascular risk index or exercise-induced angina. Supervised rehabilitation advised."
            }

        # 2. Severe resting hypertension precaution
        trestbps = profile.get("trestbps")
        if trestbps is not None and trestbps >= 180 and ("resistance training" in tags or "strength" in tags):
            return {
                "status": RuleAction.REVIEW_REQUIRED.value,
                "triggered_rules": ["RULE-HYPERTENSION-03"],
                "audit_message": "Severe resting blood pressure (>=180 mmHg) detected. Resistance training requires clinical consultation before initiation."
            }

        # 3. Missing critical fields check
        if trestbps is None or profile.get("age") is None:
            return {
                "status": RuleAction.INSUFFICIENT_INFORMATION.value,
                "triggered_rules": ["RULE-DATA-04"],
                "audit_message": "Baseline vital signs incomplete; safe standard educational resource provided with precaution."
            }

        # Default: ALLOW
        return {
            "status": RuleAction.ALLOW.value,
            "triggered_rules": [],
            "audit_message": "Verified educational content passed safety checks."
        }
