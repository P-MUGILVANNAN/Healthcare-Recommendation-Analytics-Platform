"""
Model Training & Probability Calibration Interface.
Exposes modular functions to train and calibrate candidate risk models.
"""

from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier


def train_calibrated_champion(X_train, y_train):
    """Fit and calibrate the champion HistGradientBoosting model."""
    base_model = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=4,
        learning_rate=0.08,
        random_state=42
    )
    base_model.fit(X_train, y_train)

    calibrated_model = CalibratedClassifierCV(
        estimator=base_model,
        method="sigmoid",
        cv=5
    )
    calibrated_model.fit(X_train, y_train)
    return calibrated_model, base_model
