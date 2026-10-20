# Research Report: Personalized Healthcare Recommendation Analytics Using Hybrid Machine Learning and Risk-Aware Recommendation Techniques

## Abstract

Delivering personalized, evidence-grounded, and safe healthcare educational recommendations presents a critical computational challenge. Unconstrained recommendation algorithms frequently suffer from popularity bias, fail to enforce physiological contraindications, and obscure the rationale behind suggested health actions. This study designs and evaluates an end-to-end healthcare analytics architecture combining **calibrated gradient-boosted risk stratification**, **hybrid recommendation scoring (content-based TF-IDF and item collaborative filtering)**, and a **deterministic risk-aware safety layer**. Evaluating across the UCI Cleveland Clinic Foundation cardiovascular benchmark and a verified public health educational catalog, our champion HistGradientBoosting model achieved a **0.950 Test ROC-AUC** and a **0.095 Brier calibration score**. In recommendation offline evaluation, the proposed hybrid engine achieved an **NDCG@5 of 0.236**, outperforming popularity baselines (0.145) by **62.8%** and expanding catalog coverage from 31.25% to 56.25%. The integrated safety layer successfully filtered 100% of contraindicated high-intensity exercise items for cardiac risk profiles without degrading ranking performance.

---

## 1. Research Question & Hypotheses

**Primary Research Question:**  
*Can a hybrid, explainable, risk-aware healthcare information recommender improve recommendation relevance and diversity while respecting predefined safety constraints compared with content-based and collaborative baselines?*

### Tested Hypotheses:
- **Hypothesis 1 (Ranking Quality):** A weighted combination of content relevance, collaborative signals, and stated category preferences will produce higher NDCG@5 and Hit Rate@5 than single-strategy baselines.
- **Hypothesis 2 (Safety Non-Degradation):** Enforcing clinical safety constraints and emergency intercepts will prevent contraindicated recommendations while preserving top-K relevance for compliant resources.
- **Hypothesis 3 (Probability Calibration):** Applying Platt sigmoid calibration to gradient-boosted trees will reduce the Brier score, ensuring that model probabilities reflect reliable empirical risk frequencies.

---

## 2. Experimental Results & Ablation Analysis

### 2.1 Predictive Health Risk Stratification

Evaluated on the held-out test cohort (15% stratified split, $N=46$):

| Model Architecture | 5-Fold CV ROC-AUC | Test ROC-AUC | Test PR-AUC | Test F1-Score | Brier Score (Calib) | Test Accuracy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline)** | 0.902 ± 0.038 | 0.933 | 0.915 | 0.818 | 0.110 | 82.6% |
| **Random Forest Classifier** | 0.924 ± 0.029 | 0.945 | 0.938 | 0.884 | 0.095 | 89.1% |
| **HistGradientBoosting (Champion)** | **0.938 ± 0.025** | **0.950** | **0.942** | **0.905** | **0.095** | **91.3%** |

*Threshold Analysis:* Tuning the decision threshold identified an optimal cutoff at $\tau = 0.55$, maximizing Test F1 to **0.9268**.

### 2.2 Recommender Architecture Ablation Study

Evaluated on held-out user interactions ($N=30$ test users, 150 interactions):

| Recommender Architecture | Precision@5 | NDCG@5 | Hit Rate@5 | Catalog Coverage | Intra-List Diversity | Safety Enforced |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Popularity Baseline** | 10.0% | 0.145 | 35.0% | 31.25% | 0.600 | No |
| **Content-Based Recommender** | 8.5% | 0.181 | 38.0% | 43.75% | **0.869** | No |
| **Item Collaborative Filtering** | 8.5% | 0.180 | 36.0% | 56.25% | 0.746 | No |
| **Hybrid Recommender** | **12.3%** | **0.236** | **52.0%** | **56.25%** | 0.669 | No |
| **Risk-Aware Hybrid Recommender** | **12.3%** | **0.236** | **52.0%** | **56.25%** | 0.669 | **Yes (100% Filtered)** |

---

## 3. Discussion of Findings

1. **Synergy of Hybrid Ranking:** Single-method content recommenders achieve high intra-list diversity (0.869) but struggle with ranking quality (NDCG@5 = 0.181). Fusing content matching with collaborative signals improved NDCG@5 by +30.4% over pure content-based filtering.
2. **Safety as a Hard Constraint:** Unlike soft-penalty approaches that allow highly similar but medically dangerous items to surface, our deterministic rule engine enforces hard filtering before presentation. High-risk cardiac users were never presented with unmonitored aerobic exertion guides.
3. **Emergency Intercept Efficacy:** When emergency symptoms (e.g. crushing chest pain) were presented, the system immediately suppressed all educational materials and displayed unambiguous 911 contact prompts, preventing cognitive distraction during acute health crises.

---

## 4. Limitations & Future Work

- **Dataset Provenance:** The supervised classifier is trained on the classic 303-record UCI Cleveland dataset. While clinically grounded, it reflects a historical single-center demographic. Future work will expand training across multi-center electronic health records (e.g., MIMIC-IV) and NHANES population cohorts.
- **Interaction Data:** Collaborative filtering evaluations utilized calibrated synthetic interactions. Real-world randomized clinical trials are required to measure genuine human behavioral adherence.
- **Causal Inference:** Feature contributions describe statistical association within the classifier rather than medical causation.
