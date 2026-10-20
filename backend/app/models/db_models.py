"""
SQLAlchemy Relational Database Schema.
Normalized, privacy-preserving models for educational resources, pseudo-anonymized profiles,
synthetic interactions, audit events, feedback, and model registry.
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func
from backend.app.database.connection import Base


class ResourceModel(Base):
    __tablename__ = "resources"

    item_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(128), nullable=False, index=True)
    tags_json = Column(Text, nullable=False)  # JSON-encoded array of tags
    source = Column(String(255), nullable=False)
    source_url = Column(String(512), nullable=False)
    intended_audience = Column(String(255), nullable=True)
    relevant_context = Column(Text, nullable=True)
    contraindication_notes = Column(Text, nullable=True)
    evidence_level = Column(String(64), nullable=True)
    last_verified_at = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=func.now())


class ProfileModel(Base):
    __tablename__ = "profiles"

    profile_id = Column(String(64), primary_key=True, index=True)
    age = Column(Integer, nullable=True)
    sex = Column(Integer, nullable=True)
    interests_json = Column(Text, nullable=True)
    preferred_categories_json = Column(Text, nullable=True)
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())


class InteractionModel(Base):
    __tablename__ = "interactions"

    interaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), index=True, nullable=False)
    item_id = Column(String(64), index=True, nullable=False)
    interaction_type = Column(String(64), nullable=False)  # view, bookmark, helpful, completed
    rating = Column(Float, nullable=False)
    is_synthetic = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())


class RecommendationEventModel(Base):
    __tablename__ = "recommendation_events"

    event_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=False)
    predicted_risk = Column(Float, nullable=True)
    risk_tier = Column(String(32), nullable=True)
    recommended_items_json = Column(Text, nullable=False)
    filtered_items_count = Column(Integer, default=0)
    safety_override = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=func.now())


class FeedbackModel(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(64), index=True, nullable=False)
    session_id = Column(String(64), index=True, nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars or binary 1/0
    usefulness_score = Column(Float, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class ModelRegistryModel(Base):
    __tablename__ = "model_registry"

    model_version = Column(String(64), primary_key=True)
    model_name = Column(String(128), nullable=False)
    algorithm = Column(String(128), nullable=False)
    test_roc_auc = Column(Float, nullable=True)
    test_f1 = Column(Float, nullable=True)
    test_brier = Column(Float, nullable=True)
    optimal_threshold = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    disclaimer = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=func.now())


class SafetyRuleVersionModel(Base):
    __tablename__ = "safety_rule_versions"

    rule_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False)
    action = Column(String(64), nullable=False)
    version = Column(String(32), default="v1.0")
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=func.now())
