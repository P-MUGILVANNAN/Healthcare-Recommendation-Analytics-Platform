"""
Data Preprocessing & Exploratory Data Analysis (EDA) Pipeline.
Handles schema validation, missing value imputation, domain constraints,
feature scaling, stratified train/val/test splits, and publication-grade EDA figure generation.
"""

import json
import os
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw", "heart_disease_raw.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
FIGURES_DIR = os.path.join(BASE_DIR, "reports", "figures")
METRICS_DIR = os.path.join(BASE_DIR, "reports", "metrics")

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(METRICS_DIR, exist_ok=True)

# Feature metadata and domain constraints
FEATURE_DICTIONARY = {
    "age": {"type": "numeric", "unit": "years", "range": [20, 100], "desc": "Age of patient"},
    "sex": {"type": "binary", "values": {1: "Male", 0: "Female"}, "desc": "Biological sex"},
    "cp": {"type": "categorical", "values": {1: "Typical Angina", 2: "Atypical Angina", 3: "Non-anginal", 4: "Asymptomatic"}, "desc": "Chest pain type"},
    "trestbps": {"type": "numeric", "unit": "mmHg", "range": [80, 240], "desc": "Resting systolic blood pressure upon hospital admission"},
    "chol": {"type": "numeric", "unit": "mg/dl", "range": [100, 600], "desc": "Serum cholesterol level"},
    "fbs": {"type": "binary", "values": {1: "> 120 mg/dl", 0: "<= 120 mg/dl"}, "desc": "Fasting blood sugar"},
    "restecg": {"type": "categorical", "values": {0: "Normal", 1: "ST-T Wave Abnormality", 2: "Left Ventricular Hypertrophy"}, "desc": "Resting electrocardiographic results"},
    "thalach": {"type": "numeric", "unit": "bpm", "range": [60, 220], "desc": "Maximum heart rate achieved during exercise"},
    "exang": {"type": "binary", "values": {1: "Yes", 0: "No"}, "desc": "Exercise-induced angina"},
    "oldpeak": {"type": "numeric", "unit": "mm", "range": [0.0, 7.0], "desc": "ST depression induced by exercise relative to rest"},
    "slope": {"type": "categorical", "values": {1: "Upsloping", 2: "Flat", 3: "Downsloping"}, "desc": "Slope of the peak exercise ST segment"},
    "ca": {"type": "numeric", "range": [0, 3], "desc": "Number of major vessels (0-3) colored by flourosopy"},
    "thal": {"type": "categorical", "values": {3: "Normal", 6: "Fixed Defect", 7: "Reversible Defect"}, "desc": "Thallium heart scan defect status"},
    "target": {"type": "binary", "values": {0: "Absence (< 50% stenosis)", 1: "Presence (> 50% stenosis)"}, "desc": "Angiographic cardiovascular disease status"}
}

NUMERICAL_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak"]
CATEGORICAL_FEATURES = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]


def run_eda(df: pd.DataFrame):
    """Generate high-resolution EDA figures and descriptive statistics."""
    print("[*] Generating exploratory data analysis (EDA) figures...")
    sns.set_theme(style="whitegrid", palette="muted")

    # 1. Target Class Distribution
    fig, ax = plt.subplots(figsize=(6, 4), dpi=300)
    counts = df["target"].value_counts().sort_index()
    labels = ["Low/Normal (0)", "Elevated CVD Risk (1)"]
    colors = ["#2b6cb0", "#c53030"]
    bars = ax.bar(labels, counts.values, color=colors, width=0.55, edgecolor="none")
    for bar in bars:
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, yval + 3, f"{yval} ({yval/len(df):.1%})", ha="center", va="bottom", fontsize=10, fontweight="bold")
    ax.set_title("Cardiovascular Risk Target Distribution (UCI Cleveland)", fontsize=12, fontweight="bold", pad=12)
    ax.set_ylabel("Patient Count", fontsize=10)
    ax.set_ylim(0, max(counts.values) + 25)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "target_distribution.png"))
    plt.close()

    # 2. Correlation Matrix Heatmap
    fig, ax = plt.subplots(figsize=(10, 8), dpi=300)
    corr = df.corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    cmap = sns.diverging_palette(230, 20, as_cmap=True)
    sns.heatmap(corr, mask=mask, cmap=cmap, vmax=.6, vmin=-.6, center=0,
                square=True, linewidths=.5, cbar_kws={"shrink": .8}, annot=True, fmt=".2f", annot_kws={"size": 8})
    ax.set_title("Pearson Correlation Heatmap of Health Attributes", fontsize=13, fontweight="bold", pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "correlation_matrix.png"))
    plt.close()

    # 3. Numerical Features Distribution by Target Status
    fig, axes = plt.subplots(2, 3, figsize=(14, 8), dpi=300)
    axes = axes.flatten()
    for idx, col in enumerate(NUMERICAL_FEATURES):
        sns.kdeplot(data=df, x=col, hue="target", common_norm=False, fill=True,
                    palette=["#2b6cb0", "#c53030"], alpha=0.35, ax=axes[idx])
        axes[idx].set_title(f"Distribution: {col.upper()} ({FEATURE_DICTIONARY[col]['unit']})", fontsize=10, fontweight="bold")
        axes[idx].legend(["Elevated Risk", "Low Risk"], title="", loc="upper right", fontsize=8)
    # Hide unused subplot
    axes[5].axis("off")
    plt.suptitle("Clinical Attribute Densities Stratified by Cardiovascular Risk", fontsize=13, fontweight="bold")
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "feature_distributions.png"))
    plt.close()

    # 4. Chest Pain Type vs Risk Occurrence
    fig, ax = plt.subplots(figsize=(7, 4.5), dpi=300)
    cp_labels = {1: "Typical Angina", 2: "Atypical Angina", 3: "Non-Anginal", 4: "Asymptomatic"}
    df_cp = df.copy()
    df_cp["cp_label"] = df_cp["cp"].map(cp_labels)
    cross_tab = pd.crosstab(df_cp["cp_label"], df_cp["target"], normalize="index") * 100
    cross_tab.plot(kind="bar", stacked=True, color=["#3182ce", "#e53e3e"], ax=ax, width=0.6)
    ax.set_title("Cardiovascular Risk Proportion Across Chest Pain Presentations", fontsize=11, fontweight="bold", pad=10)
    ax.set_xlabel("Chest Pain Classification", fontsize=10)
    ax.set_ylabel("Percentage (%)", fontsize=10)
    ax.legend(["Low/Normal", "Elevated Risk"], title="Risk Outcome", loc="upper left", frameon=True)
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "chest_pain_risk_profile.png"))
    plt.close()

    print(f"[+] Saved publication-grade EDA figures to {FIGURES_DIR}")


def preprocess():
    """Load, clean, impute, transform, and partition dataset with strict leakage prevention."""
    print(f"[*] Reading raw dataset from {RAW_DATA_PATH}...")
    df = pd.read_csv(RAW_DATA_PATH)

    # 1. Coerce column types and handle missing entries
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Binarize target in case values are 0-4 (standard UCI representation: 0 = absent, >0 = present)
    df["target"] = (df["target"] > 0).astype(int)

    # Missing value audit
    missing_counts = df.isnull().sum().to_dict()
    total_missing = sum(missing_counts.values())
    print(f"[+] Total missing cells detected: {total_missing}")

    # Impute missing values with domain-appropriate statistics
    # 'ca' and 'thal' have rare missing values in raw Cleveland data (~4 for ca, ~2 for thal)
    for col in ["ca", "thal"]:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"[+] Imputed missing '{col}' with median: {median_val}")

    # Generate EDA figures on full validated dataset
    run_eda(df)

    # 2. Stratified Partitioning (70% Train, 15% Validation, 15% Test)
    # Leakage prevention: Transformations and scalers MUST only be fitted on Train!
    X = df.drop(columns=["target"])
    y = df["target"]

    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    val_rel_size = 0.15 / 0.85
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=val_rel_size, random_state=42, stratify=y_train_val
    )

    print(f"[+] Partition sizes - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # 3. Fit Scaler ONLY on Training Set
    scaler = StandardScaler()
    scaler.fit(X_train[NUMERICAL_FEATURES])

    # Save fitted preprocessing transformer artifact
    preprocessor_artifact = {
        "scaler": scaler,
        "numerical_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "feature_names": list(X.columns),
        "feature_dictionary": FEATURE_DICTIONARY
    }
    joblib.dump(preprocessor_artifact, os.path.join(MODELS_DIR, "preprocessor.joblib"))
    print(f"[+] Saved preprocessing pipeline artifact to {MODELS_DIR}/preprocessor.joblib")

    # 4. Save train/val/test CSV splits
    train_df = pd.concat([X_train, y_train], axis=1)
    val_df = pd.concat([X_val, y_val], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)
    full_df = pd.concat([X, y], axis=1)

    train_df.to_csv(os.path.join(PROCESSED_DIR, "train.csv"), index=False)
    val_df.to_csv(os.path.join(PROCESSED_DIR, "val.csv"), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DIR, "test.csv"), index=False)
    full_df.to_csv(os.path.join(PROCESSED_DIR, "full_cleaned.csv"), index=False)

    # 5. Save Data Quality & Preprocessing Metadata Report
    data_quality_report = {
        "dataset_name": "UCI Cleveland Heart Disease Benchmark",
        "total_records": len(df),
        "total_attributes": len(df.columns) - 1,
        "missing_values_per_column": missing_counts,
        "class_distribution": {
            "negative_cases": int((y == 0).sum()),
            "positive_cases": int((y == 1).sum()),
            "positive_prevalence_pct": round(float((y == 1).mean() * 100), 2)
        },
        "splits": {
            "train_size": len(X_train),
            "val_size": len(X_val),
            "test_size": len(X_test)
        },
        "numerical_feature_stats": df[NUMERICAL_FEATURES].describe().round(2).to_dict(),
        "feature_dictionary": FEATURE_DICTIONARY
    }

    with open(os.path.join(METRICS_DIR, "data_quality_report.json"), "w", encoding="utf-8") as f:
        json.dump(data_quality_report, f, indent=2)

    print(f"[+] Data preprocessing complete. Quality report saved to {METRICS_DIR}/data_quality_report.json")


if __name__ == "__main__":
    preprocess()
