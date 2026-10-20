"""
Safety and Suitability Rule Definitions and Registry.
Defines rule identifiers, action taxonomies, severities, and clinical-precaution descriptions.
"""

from enum import Enum
from typing import List
from pydantic import BaseModel


class RuleSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"


class RuleAction(str, Enum):
    ALLOW = "ALLOW"
    FILTER = "FILTER"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"
    EMERGENCY_OVERRIDE = "EMERGENCY_OVERRIDE"


class SafetyRuleDefinition(BaseModel):
    rule_id: str
    name: str
    description: str
    severity: RuleSeverity
    action: RuleAction
    category: str
    version: str = "v1.2.0"
    audit_guidance: str


DEFAULT_SAFETY_RULES: List[SafetyRuleDefinition] = [
    SafetyRuleDefinition(
        rule_id="RULE-EMERGENCY-01",
        name="Acute Symptom Emergency Intercept",
        description="Detects acute symptoms (crushing chest pain, severe dyspnea, syncope) and immediately routes the user to emergency services without recommendation delay.",
        severity=RuleSeverity.CRITICAL,
        action=RuleAction.EMERGENCY_OVERRIDE,
        category="Emergency Protocol",
        audit_guidance="Immediate 911/112 referral. All self-management educational content is suppressed during acute symptoms."
    ),
    SafetyRuleDefinition(
        rule_id="RULE-EXERCISE-02",
        name="High Cardiovascular Risk Vigorous Exercise Contraindication",
        description="Excludes unmonitored vigorous aerobic programs for users with high cardiovascular risk (>0.65) or documented exercise angina.",
        severity=RuleSeverity.HIGH,
        action=RuleAction.FILTER,
        category="Cardiovascular Exercise",
        audit_guidance="High-risk cardiac individuals must engage exclusively with supervised outpatient cardiac rehabilitation."
    ),
    SafetyRuleDefinition(
        rule_id="RULE-HYPERTENSION-03",
        name="Severe Resting Hypertension Resistance Training Precaution",
        description="Flags heavy resistance exercise as requiring clinical clearance if resting systolic blood pressure >= 180 mmHg.",
        severity=RuleSeverity.MODERATE,
        action=RuleAction.REVIEW_REQUIRED,
        category="Hypertension Precaution",
        audit_guidance="Valsalva-inducing strenuous resistance exercises are flagged for physician review when blood pressure exceeds stage 2 hypertensive crisis threshold."
    ),
    SafetyRuleDefinition(
        rule_id="RULE-DATA-04",
        name="Missing Critical Baseline Vitals Precaution",
        description="Identifies incomplete physiological baselines and applies conservative informational educational fallbacks.",
        severity=RuleSeverity.LOW,
        action=RuleAction.INSUFFICIENT_INFORMATION,
        category="Data Sufficiency",
        audit_guidance="Incomplete profile prevents personalized clinical risk scoring; provides safe baseline educational guides."
    )
]
