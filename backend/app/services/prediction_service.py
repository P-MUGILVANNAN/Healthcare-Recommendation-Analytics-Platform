"""
Machine Learning Risk Prediction Service.
Loads the calibrated champion model and preprocessing pipeline.
Provides risk inference, risk stratification, and local feature contribution explanations.
"""

import os
import joblib
import numpy as np
import pandas as pd
from backend.app.config import settings
from backend.app.api.schemas import FeatureContribution, ProfileInput, RiskPredictionResponse


class PredictionService:
    def __init__(self):
        self.model_artifact = None
        self.preprocessor = None
        self.calibrated_model = None
        self.feature_names = []
        self.feature_importances = {}
        self.optimal_threshold = 0.5
        self.load_artifacts()

    def load_artifacts(self):
        model_path = os.path.join(settings.MODELS_DIR, "heart_risk_model.joblib")
        prep_path = os.path.join(settings.MODELS_DIR, "preprocessor.joblib")

        if os.path.exists(model_path) and os.path.exists(prep_path):
            self.model_artifact = joblib.load(model_path)
            self.preprocessor = joblib.load(prep_path)
            self.calibrated_model = self.model_artifact["calibrated_model"]
            self.feature_names = self.model_artifact["feature_names"]
            self.feature_importances = self.model_artifact.get("feature_importances", {})
            self.optimal_threshold = self.model_artifact.get("optimal_threshold", 0.5)
            print("[+] PredictionService: ML artifacts loaded successfully.")
        else:
            print("[!] PredictionService: ML artifacts not found. Inference will run in fallback mode.")

    def predict_risk(self, profile: ProfileInput) -> RiskPredictionResponse:
        # Impute default clinical medians if fields are omitted
        p_dict = profile.model_dump()
        age = p_dict.get("age") or 54
        sex = p_dict.get("sex") if p_dict.get("sex") is not None else 1
        cp = p_dict.get("cp") or 2
        trestbps = p_dict.get("trestbps") or 130
        chol = p_dict.get("chol") or 240
        fbs = p_dict.get("fbs") or 0
        restecg = p_dict.get("restecg") or 0
        thalach = p_dict.get("thalach") or (200 - int(0.8 * age))
        exang = p_dict.get("exang") or 0
        oldpeak = p_dict.get("oldpeak") or 0.5
        slope = p_dict.get("slope") or 2
        ca = p_dict.get("ca") or 0
        thal = p_dict.get("thal") or 3

        df_input = pd.DataFrame([{
            "age": age, "sex": sex, "cp": cp, "trestbps": trestbps,
            "chol": chol, "fbs": fbs, "restecg": restecg, "thalach": thalach,
            "exang": exang, "oldpeak": oldpeak, "slope": slope, "ca": ca, "thal": thal
        }])

        if self.calibrated_model and self.preprocessor:
            scaler = self.preprocessor["scaler"]
            num_cols = self.preprocessor["numerical_features"]
            df_scaled = df_input.copy()
            df_scaled[num_cols] = scaler.transform(df_scaled[num_cols])
            
            prob = float(self.calibrated_model.predict_proba(df_scaled[self.feature_names].values)[:, 1][0])
        else:
            # Domain-weighted clinical index approximation fallback
            z = 0.03 * (age - 50) + 0.5 * sex + 0.6 * (cp == 4) + 0.02 * (trestbps - 120) + 0.005 * (chol - 200) + 0.6 * exang + 0.4 * oldpeak - 2.0
            prob = float(1 / (1 + np.exp(-z)))

        pred_label = 1 if prob >= self.optimal_threshold else 0
        
        # Risk tiering
        if prob < 0.35:
            risk_tier = "Low"
        elif prob < 0.60:
            risk_tier = "Moderate"
        else:
            risk_tier = "Elevated"

        # Compute local feature contributions
        local_contributions = []
        feature_explanations = {
            "trestbps": ("Resting Blood Pressure", 120, "mmHg", "Elevated resting blood pressure increases systemic vascular resistance."),
            "chol": ("Serum Cholesterol", 200, "mg/dl", "Serum cholesterol above 200 mg/dl is associated with atherosclerotic plaque burden."),
            "thalach": ("Max Heart Rate", 150, "bpm", "Lower peak exercise heart rate can reflect reduced cardiovascular aerobic reserve."),
            "oldpeak": ("ST Depression", 1.0, "mm", "ST-segment depression indicates exercise-induced myocardial ischemia."),
            "cp": ("Chest Pain Severity", 2, "index", "Asymptomatic or typical anginal presentations significantly influence risk weighting."),
            "exang": ("Exercise Angina", 0, "binary", "Anginal chest discomfort induced by exercise strongly indicates coronary insufficiency.")
        }

        for feat, (label, normal_val, unit, note) in feature_explanations.items():
            val = p_dict.get(feat)
            if val is not None:
                importance = self.feature_importances.get(feat, 0.1)
                if feat == "thalach":
                    direction = "Increases Risk" if val < normal_val else "Decreases Risk"
                else:
                    direction = "Increases Risk" if val > normal_val else ("Decreases Risk" if val < normal_val else "Neutral")

                local_contributions.append(FeatureContribution(
                    feature=label,
                    patient_value=f"{val} {unit}".strip(),
                    baseline_importance=round(float(importance), 3),
                    impact_direction=direction,
                    clinical_note=note
                ))

        return RiskPredictionResponse(
            predicted_probability=round(prob, 4),
            predicted_label=pred_label,
            risk_tier=risk_tier,
            decision_threshold=self.optimal_threshold,
            local_feature_contributions=local_contributions,
            model_version=self.model_artifact.get("model_version", "v1.2.0") if self.model_artifact else "v1.2.0-fallback",
            disclaimer="Educational research demonstration. Model probabilities reflect statistical association on benchmark data, NOT a validated clinical diagnosis."
        )


prediction_service = PredictionService()
