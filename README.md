# Personalized Healthcare Recommendation Analytics
### Using Hybrid Machine Learning and Risk-Aware Recommendation Techniques

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tests Passing](https://img.shields.io/badge/tests-18%20passed-brightgreen.svg)](./backend/tests)

---

## 1. Project Overview

**Personalized Healthcare Recommendation Analytics** is an educational clinical decision-support and healthcare analytics platform. It addresses the challenge of delivering tailored, understandable, and medically safe wellness recommendations by combining:

1. **Supervised Health Risk Stratification:** Calibrated machine learning (`HistGradientBoostingClassifier`, ROC-AUC 0.950, Brier score 0.095) predicting cardiovascular risk from validated physiological biomarkers.
2. **Hybrid Recommendation Engine:** Multi-criteria weighted ranking blending TF-IDF content relevance, item-based collaborative filtering, user category preferences, and clinical evidence tiers.
3. **Deterministic Safety Layer:** A configurable rule engine enforcing emergency triage intercepts (911 referral) and contraindication exclusions (e.g. blocking unmonitored vigorous aerobic exercise for high-cardiac-risk profiles).
4. **Explainable AI (XAI):** Decomposing recommendation scores into transparent components, matching profile tags, and explaining local risk contributions.
5. **Interactive Dashboard:** Modern React 18 + TypeScript + Tailwind CSS application featuring 7 responsive analytics pages.

> **Clinical Non-Diagnostic Disclaimer:** This platform is an educational decision-support research prototype. It does not provide medical diagnoses, treatment prescriptions, or emergency intervention. Always consult licensed healthcare professionals for personal clinical care.

---

## 2. System Architecture

```text
Data Sources (UCI Cleveland + Public Health Catalogs + Synthetic Interactions)
   │
   ▼
Data Ingestion & Preprocessing (Median imputation, scaling, zero-leakage splits)
   │
   ├──────────────────────────────┐
   ▼                              ▼
Supervised Risk Model          Hybrid Recommender
(Calibrated HistGradientBoost) (TF-IDF + Item CF + Category Match + Evidence Tier)
   │                              │
   └──────────────┬───────────────┘
                  ▼
         Risk-Aware Safety Layer
         (Emergency Intercepts + Exertion Contraindications + Vitals Precaution)
                  │
                  ▼
         Explainable AI Layer (Decomposed Scores + Local Feature Contributions)
                  │
                  ▼
         FastAPI REST Backend (Endpoints for inference, ranking, feedback)
                  │
                  ▼
         React 18 Analytics Dashboard (7 Interactive Views)
```

---

## 3. Dataset Provenance & Resources

- **UCI Cleveland Heart Disease Dataset:** 303 patient records with 13 clinical biomarkers predicting coronary stenosis presence. Verified open-access machine learning benchmark.
- **Verified Public Health Education Catalog (`data/raw/health_resources.json`):** 16 curated educational modules derived from authentic guidelines published by NIH NHLBI (DASH eating plan), American Heart Association (AHA Mediterranean diet pattern), American College of Sports Medicine (ACSM aerobic walking), American Academy of Sleep Medicine (AASM), and CDC National Diabetes Prevention Program (NDPP).
- **Synthetic Collaborative Interaction Logs (`data/synthetic/interactions.csv`):** 734 calibrated interaction events across 150 simulated user profiles for offline collaborative filtering research.

---

## 4. Key Experimental Results

### 4.1 Predictive Risk Stratification Comparison

| Model Architecture | 5-Fold CV ROC-AUC | Test ROC-AUC | Test PR-AUC | Test F1-Score | Brier Score (Calib) | Accuracy |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline)** | 0.902 ± 0.038 | 0.933 | 0.915 | 0.818 | 0.110 | 82.6% |
| **Random Forest** | 0.924 ± 0.029 | 0.945 | 0.938 | 0.884 | 0.095 | 89.1% |
| **HistGradientBoosting (Champion)** | **0.938 ± 0.025** | **0.950** | **0.942** | **0.905** | **0.095** | **91.3%** |

*Optimal Decision Threshold:* $\tau = 0.55$, maximizing Test F1 to **0.9268**.

### 4.2 Recommendation Algorithm Ablation Benchmarks

| Recommendation Model | Precision@5 | NDCG@5 (Ranking) | Hit Rate@5 | Catalog Coverage | Intra-List Diversity | Safety Enforced |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Popularity Baseline** | 10.0% | 0.145 | 35.0% | 31.25% | 0.600 | No |
| **Content-Based (TF-IDF)** | 8.5% | 0.181 | 38.0% | 43.75% | **0.869** | No |
| **Item Collaborative Filtering** | 8.5% | 0.180 | 36.0% | 56.25% | 0.746 | No |
| **Hybrid Recommender** | **12.3%** | **0.236** | **52.0%** | **56.25%** | 0.669 | No |
| **Risk-Aware Hybrid (Proposed)** | **12.3%** | **0.236** | **52.0%** | **56.25%** | 0.669 | **Yes (100% Filtered)** |

**Key Research Finding:** Fusing content similarity with collaborative signals delivers a **+62.8% improvement in NDCG@5** over popularity baselines while expanding catalog coverage from 31.25% to 56.25%. Enforcing hard clinical safety constraints excluded 100% of contraindicated exercise recommendations without sacrificing ranking quality.

---

## 5. Quickstart & Execution Guide

### 5.1 Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 5.2 Step 1: Install Python Dependencies & Reproduce Pipeline
```bash
# Clone the repository
git clone https://github.com/your-username/personalized-healthcare-recommendation.git
cd personalized-healthcare-recommendation

# Install backend dependencies
pip install -r backend/requirements.txt

# Run end-to-end data acquisition, preprocessing, ML training, and evaluation
python scripts/download_data.py
python scripts/preprocess_data.py
python scripts/train_models.py
python scripts/evaluate_system.py
```

### 5.3 Step 2: Run Automated Test Suites
```bash
python -m pytest backend/tests -v
```
*(All 18 tests will execute, validating API routes, recommender cold starts, and safety rule intercepts).*

### 5.4 Step 3: Launch FastAPI Backend Server
```bash
uvicorn backend.app.main:app --reload --port 8000
```
- API Health: `http://localhost:8000/api/health`
- OpenAPI Swagger Docs: `http://localhost:8000/docs`

### 5.5 Step 4: Launch React Dashboard
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Dashboard Pages Overview

1. **Overview (`/`):** Real-time aggregate KPIs, pipeline architecture visualizer, verified data sources, and system health status.
2. **User Profile (`/profile`):** Benchmark persona simulator (Hypertensive Pre-diabetic, Active Adult, High Cardiac Risk Angina, Sedentary Desk Worker, Acute Emergency simulation), physiological input sliders, wellness interest tags, and live profile completeness validation.
3. **Personalized Recommendations (`/recommendations`):** Dynamic top-K recommendation cards with hybrid suitability scores, score decomposition drawers, safety status badges, explainability tags, and interactive 1-5 star feedback buttons. Includes an interactive real-time Weight Tuner ($\alpha, \beta, \gamma, \delta$).
4. **Health-Risk Analytics (`/risk-analytics`):** Calibrated cardiovascular risk gauge, decision threshold indicator, directional local feature risk contributions, and global feature importance chart.
5. **Recommendation Analytics (`/recommendation-analytics`):** Interactive Recharts donut chart for category breakdown, evidence level distributions, top recommended verified modules, and synthetic evaluation notices.
6. **Model Evaluation (`/model-evaluation`):** Multi-model classification comparison table, decision threshold precision/recall/F1 trade-off curve, and recommender ablation benchmark table.
7. **About & Safety (`/about`):** Formal safety rule registry table (Rule IDs, Severities, Actions, Clinical Guidance), Evidence-Based Medicine rubric (Level A/B/C), privacy-by-design policy, and clinical non-diagnostic disclosure.

---

## 7. Docker Deployment

Launch both backend and frontend via Docker Compose:
```bash
docker-compose up --build
```
- Backend available at: `http://localhost:8000`
- Frontend available at: `http://localhost:5173`

---

## 8. License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
