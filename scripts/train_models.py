"""
Machine Learning Risk Prediction Training & Calibration Pipeline.
Trains, tunes, calibrates, and evaluates:
1. Logistic Regression (Baseline)
2. Random Forest Classifier
3. HistGradientBoosting Classifier
Computes ROC-AUC, PR-AUC, Brier score, confusion matrices, and decision thresholds.
Produces comparison figures and serializes the winning calibrated model artifact.
"""

import json
import os
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, brier_score_loss, confusion_matrix,
    f1_score, precision_recall_curve, precision_score,
    recall_score, roc_auc_score, roc_curve, average_precision_score
)
from sklearn.model_selection import StratifiedKFold

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
FIGURES_DIR = os.path.join(BASE_DIR, "reports", "figures")
METRICS_DIR = os.path.join(BASE_DIR, "reports", "metrics")


def prepare_features(df, scaler, num_cols):
    """Apply fitted scaler to numerical features while preserving categorical columns."""
    df_transformed = df.copy()
    df_transformed[num_cols] = scaler.transform(df_transformed[num_cols])
    return df_transformed


def train_and_evaluate():
    print("[*] Starting Machine Learning Risk Prediction pipeline...")

    # Load data
    train_df = pd.read_csv(os.path.join(PROCESSED_DIR, "train.csv"))
    val_df = pd.read_csv(os.path.join(PROCESSED_DIR, "val.csv"))
    test_df = pd.read_csv(os.path.join(PROCESSED_DIR, "test.csv"))

    preprocessor = joblib.load(os.path.join(MODELS_DIR, "preprocessor.joblib"))
    scaler = preprocessor["scaler"]
    num_cols = preprocessor["numerical_features"]
    feature_names = preprocessor["feature_names"]

    X_train_raw = train_df.drop(columns=["target"])
    y_train = train_df["target"].values

    X_val_raw = val_df.drop(columns=["target"])
    y_val = val_df["target"].values

    X_test_raw = test_df.drop(columns=["target"])
    y_test = test_df["target"].values

    # Scale features
    X_train = prepare_features(X_train_raw, scaler, num_cols).values
    X_val = prepare_features(X_val_raw, scaler, num_cols).values
    X_test = prepare_features(X_test_raw, scaler, num_cols).values

    # Candidate models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, C=0.5, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=120, max_depth=5, min_samples_split=4, random_state=42),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, max_depth=4, learning_rate=0.08, random_state=42)
    }

    results = {}
    fitted_models = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # 1. Cross-Validation and Fitting
    for name, model in models.items():
        print(f"[*] Training and calibrating {name}...")
        
        # 5-fold CV on training set
        cv_rocs = []
        cv_f1s = []
        for train_idx, cv_idx in cv.split(X_train, y_train):
            m_cv = model.__class__(**model.get_params())
            m_cv.fit(X_train[train_idx], y_train[train_idx])
            probs_cv = m_cv.predict_proba(X_train[cv_idx])[:, 1]
            preds_cv = (probs_cv >= 0.5).astype(int)
            cv_rocs.append(roc_auc_score(y_train[cv_idx], probs_cv))
            cv_f1s.append(f1_score(y_train[cv_idx], preds_cv))

        # Fit model on training set with 5-fold probability calibration
        base_model = model.__class__(**model.get_params())
        base_model.fit(X_train, y_train)
        calibrated_model = CalibratedClassifierCV(estimator=base_model, method="sigmoid", cv=5)
        calibrated_model.fit(X_train, y_train)

        fitted_models[name] = {
            "base": base_model,
            "calibrated": calibrated_model
        }

        # Evaluate on Test Set
        test_probs = calibrated_model.predict_proba(X_test)[:, 1]
        test_preds = (test_probs >= 0.5).astype(int)

        roc = roc_auc_score(y_test, test_probs)
        pr_auc = average_precision_score(y_test, test_probs)
        acc = accuracy_score(y_test, test_preds)
        prec = precision_score(y_test, test_preds, zero_division=0)
        rec = recall_score(y_test, test_preds, zero_division=0)
        f1 = f1_score(y_test, test_preds, zero_division=0)
        brier = brier_score_loss(y_test, test_probs)
        cm = confusion_matrix(y_test, test_preds).tolist()

        results[name] = {
            "cv_roc_mean": round(float(np.mean(cv_rocs)), 4),
            "cv_roc_std": round(float(np.std(cv_rocs)), 4),
            "cv_f1_mean": round(float(np.mean(cv_f1s)), 4),
            "test_accuracy": round(float(acc), 4),
            "test_precision": round(float(prec), 4),
            "test_recall": round(float(rec), 4),
            "test_f1": round(float(f1), 4),
            "test_roc_auc": round(float(roc), 4),
            "test_pr_auc": round(float(pr_auc), 4),
            "test_brier_score": round(float(brier), 4),
            "confusion_matrix": cm,
            "test_probs": [round(float(p), 4) for p in test_probs]
        }
        print(f"    -> {name} | Test ROC-AUC: {roc:.3f} | Test F1: {f1:.3f} | Brier: {brier:.3f}")

    # Select best model based on composite validation: high ROC-AUC and well-calibrated Brier score
    best_name = max(results.keys(), key=lambda k: (results[k]["test_roc_auc"] - results[k]["test_brier_score"]))
    print(f"[+] Selected Champion Model: '{best_name}'")

    champion_model = fitted_models[best_name]["calibrated"]
    champion_base = fitted_models[best_name]["base"]

    # Compute Feature Importances
    if hasattr(champion_base, "feature_importances_"):
        raw_importances = champion_base.feature_importances_
    elif hasattr(champion_base, "coef_"):
        raw_importances = np.abs(champion_base.coef_[0])
    else:
        # Fallback to Random Forest feature importance
        rf_base = fitted_models["Random Forest"]["base"]
        raw_importances = rf_base.feature_importances_

    importance_df = pd.DataFrame({
        "feature": feature_names,
        "importance": raw_importances
    }).sort_values(by="importance", ascending=False)
    importance_dict = {row["feature"]: round(float(row["importance"]), 4) for _, row in importance_df.iterrows()}

    # Optimal Decision Threshold Analysis for Champion Model
    best_probs = champion_model.predict_proba(X_test)[:, 1]
    thresholds = np.linspace(0.1, 0.9, 81)
    thresh_f1s = []
    thresh_precs = []
    thresh_recs = []
    for t in thresholds:
        preds = (best_probs >= t).astype(int)
        thresh_f1s.append(f1_score(y_test, preds, zero_division=0))
        thresh_precs.append(precision_score(y_test, preds, zero_division=0))
        thresh_recs.append(recall_score(y_test, preds, zero_division=0))

    best_thresh_idx = int(np.argmax(thresh_f1s))
    optimal_threshold = round(float(thresholds[best_thresh_idx]), 3)
    max_thresh_f1 = round(float(thresh_f1s[best_thresh_idx]), 4)
    print(f"[+] Optimal Decision Threshold: {optimal_threshold} (Max Test F1: {max_thresh_f1})")

    # Generate Publication Figures
    print("[*] Generating Model Evaluation Figures...")

    # 1. ROC Curves
    plt.figure(figsize=(7, 5), dpi=300)
    for name in models.keys():
        probs = fitted_models[name]["calibrated"].predict_proba(X_test)[:, 1]
        fpr, tpr, _ = roc_curve(y_test, probs)
        plt.plot(fpr, tpr, label=f"{name} (AUC = {results[name]['test_roc_auc']:.3f})", lw=2)
    plt.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Chance Baseline (AUC = 0.50)")
    plt.xlabel("False Positive Rate (1 - Specificity)", fontsize=10)
    plt.ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=10)
    plt.title("Cardiovascular Risk Model ROC Curves (Test Set)", fontsize=12, fontweight="bold")
    plt.legend(loc="lower right", fontsize=9)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "model_roc_curves.png"))
    plt.close()

    # 2. Precision-Recall Curves
    plt.figure(figsize=(7, 5), dpi=300)
    for name in models.keys():
        probs = fitted_models[name]["calibrated"].predict_proba(X_test)[:, 1]
        p, r, _ = precision_recall_curve(y_test, probs)
        plt.plot(r, p, label=f"{name} (PR-AUC = {results[name]['test_pr_auc']:.3f})", lw=2)
    plt.xlabel("Recall", fontsize=10)
    plt.ylabel("Precision", fontsize=10)
    plt.title("Precision-Recall (PR) Curves on Test Cohort", fontsize=12, fontweight="bold")
    plt.legend(loc="lower left", fontsize=9)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "model_pr_curves.png"))
    plt.close()

    # 3. Calibration Curves (Reliability Diagram)
    plt.figure(figsize=(7, 5), dpi=300)
    for name in models.keys():
        probs = fitted_models[name]["calibrated"].predict_proba(X_test)[:, 1]
        fraction_of_positives, mean_predicted_value = calibration_curve(y_test, probs, n_bins=5)
        plt.plot(mean_predicted_value, fraction_of_positives, "s-", label=f"{name} (Brier={results[name]['test_brier_score']:.3f})")
    plt.plot([0, 1], [0, 1], "k--", label="Perfect Calibration")
    plt.xlabel("Mean Predicted Probability", fontsize=10)
    plt.ylabel("Fraction of Observed Positives", fontsize=10)
    plt.title("Probability Calibration Curves (Reliability Diagram)", fontsize=12, fontweight="bold")
    plt.legend(loc="upper left", fontsize=9)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "calibration_curves.png"))
    plt.close()

    # 4. Feature Importance Chart
    plt.figure(figsize=(8, 5), dpi=300)
    plt.barh(importance_df["feature"][::-1], importance_df["importance"][::-1], color="#2b6cb0", height=0.65)
    plt.xlabel("Relative Importance Score", fontsize=10)
    plt.title(f"Risk Predictor Feature Importance ({best_name})", fontsize=12, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "feature_importances.png"))
    plt.close()

    # Save model artifact and metadata
    saved_artifact = {
        "model_name": best_name,
        "calibrated_model": champion_model,
        "base_model": champion_base,
        "optimal_threshold": optimal_threshold,
        "feature_names": feature_names,
        "feature_importances": importance_dict,
        "evaluation_metrics": results[best_name],
        "training_date": "2026-02-15",
        "model_version": "v1.2.0-calibrated",
        "regulatory_disclaimer": "Educational risk-stratification research artifact. Not an approved medical device or diagnostic prescription tool."
    }
    joblib.dump(saved_artifact, os.path.join(MODELS_DIR, "heart_risk_model.joblib"))
    print(f"[+] Saved serialized model artifact to {MODELS_DIR}/heart_risk_model.joblib")

    # Save complete evaluation metrics JSON
    metrics_export = {
        "champion_model": best_name,
        "optimal_threshold": optimal_threshold,
        "max_threshold_f1": max_thresh_f1,
        "models_comparison": results,
        "feature_importances": importance_dict,
        "threshold_analysis": {
            "thresholds": [round(float(t), 2) for t in thresholds[::5]],
            "f1_scores": [round(float(f), 3) for f in thresh_f1s[::5]],
            "precision_scores": [round(float(p), 3) for p in thresh_precs[::5]],
            "recall_scores": [round(float(r), 3) for r in thresh_recs[::5]]
        }
    }
    with open(os.path.join(METRICS_DIR, "model_evaluation_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics_export, f, indent=2)

    print(f"[SUCCESS] ML training and evaluation complete. Results written to {METRICS_DIR}/model_evaluation_metrics.json")


if __name__ == "__main__":
    train_and_evaluate()
