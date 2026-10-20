"""
Data Loading Utilities.
Provides structured loaders for raw, processed, and synthetic healthcare datasets.
"""

import json
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_raw_heart_disease() -> pd.DataFrame:
    """Load raw UCI Cleveland Heart Disease dataset."""
    path = os.path.join(DATA_DIR, "raw", "heart_disease_raw.csv")
    return pd.read_csv(path)


def load_processed_splits() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load train, validation, and test processed partitions."""
    train_df = pd.read_csv(os.path.join(DATA_DIR, "processed", "train.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "processed", "val.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "processed", "test.csv"))
    return train_df, val_df, test_df


def load_catalog_resources() -> list:
    """Load verified educational resources catalog."""
    path = os.path.join(DATA_DIR, "raw", "health_resources.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_synthetic_interactions() -> pd.DataFrame:
    """Load calibrated synthetic user-item interaction matrix."""
    path = os.path.join(DATA_DIR, "synthetic", "interactions.csv")
    return pd.read_csv(path)
