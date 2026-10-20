"""
Feature Engineering & Transformation Utilities.
Applies fitted transformations to clinical biomarkers while preventing data leakage.
"""

import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "models", "preprocessor.joblib")


def transform_features(df: pd.DataFrame) -> pd.DataFrame:
    """Transform input features using serialized preprocessor artifact."""
    if not os.path.exists(PREPROCESSOR_PATH):
        raise FileNotFoundError(f"Preprocessor artifact not found at {PREPROCESSOR_PATH}")
    
    preprocessor = joblib.load(PREPROCESSOR_PATH)
    scaler = preprocessor["scaler"]
    num_cols = preprocessor["numerical_features"]

    df_out = df.copy()
    df_out[num_cols] = scaler.transform(df_out[num_cols])
    return df_out
