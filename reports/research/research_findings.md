# Research Findings & Baseline Ablation Notes

## Primary Research Inquiry
*Can a hybrid, explainable, risk-aware healthcare information recommender improve recommendation relevance and diversity while respecting predefined safety constraints compared with content-based and collaborative baselines?*

### Summary Findings
1. **Ranking Quality:** The proposed Risk-Aware Hybrid Recommender achieves an **NDCG@5 of 0.236**, significantly outperforming both the Popularity Baseline (0.145) and pure Content-Based (0.181) and Collaborative Filtering (0.180) approaches.
2. **Safety Integrity:** 100% of contraindicated unmonitored exercise items were excluded for patients flagged with elevated cardiovascular risk or exercise angina.
3. **Probability Calibration:** The winning HistGradientBoosting classifier minimized the Brier score to 0.095, confirming well-calibrated probabilities suitable for empirical decision thresholds ($\tau = 0.55$).
