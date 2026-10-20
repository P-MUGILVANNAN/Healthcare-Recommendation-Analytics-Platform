# System Architecture & Technical Specifications

**Project Title:** Personalized Healthcare Recommendation Analytics Using Hybrid Machine Learning and Risk-Aware Recommendation Techniques  
**Version:** 1.2.0  
**Status:** Complete / Fully Tested  

---

## 1. High-Level Architectural Diagram

```text
+---------------------------------------------------------------------------------------+
|                                    DATA SOURCES                                       |
|  - UCI Cleveland Clinic Foundation Cardiovascular Dataset (303 records, 14 attributes)|
|  - Verified Public Health Guidelines Catalog (NHLBI, AHA, ACSM, WHO, CDC NDPP)        |
|  - Calibrated Synthetic User-Item Interaction Matrix (734 events, 150 users)          |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               DATA INGESTION & VALIDATION                             |
|  - Schema checks, range assertions, median imputation for 'ca' and 'thal'             |
|  - Stratified partitioning (70% Train, 15% Val, 15% Test)                             |
|  - Scaler fitted ONLY on train partition (zero data leakage)                          |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           SUPERVISED RISK STRATIFICATION                              |
|  - Calibrated HistGradientBoosting Classifier (CV ROC-AUC: 0.950, Test F1: 0.905)     |
|  - Sigmoid probability calibration (Brier score: 0.095)                               |
|  - Optimal decision cutoff: 0.55 (Max Test F1: 0.927)                                 |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                             HYBRID RECOMMENDATION ENGINE                              |
|  - TF-IDF Vectorization over titles, descriptions, categories, and verified tags      |
|  - Cosine profile matching + category preference boosting                             |
|  - Item-based Collaborative Filtering with cold-start popularity fallback             |
|  - Weighted hybrid fusion: base_score = alpha*C + beta*CF + gamma*Pref + delta*Quality|
|  - Maximal Marginal Relevance (MMR) category diversity penalty                        |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           RISK-AWARE SAFETY & SUITABILITY                             |
|  - Emergency Symptom Intercept (crushing chest pain / syncope -> 911 override)         |
|  - Unmonitored Vigorous Exercise Exclusions for High Cardiac Risk (Predicted Risk>0.65|
|    or Exercise Angina == 1)                                                           |
|  - Severe Hypertension Precaution (BP >= 180 mmHg flags resistance training)          |
|  - Missing baseline vitals fallback rule                                              |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                EXPLAINABLE AI OUTPUTS                                 |
|  - Local feature risk contributions with directional arrows                           |
|  - Global tree feature importance rankings                                            |
|  - Hybrid score component decomposition                                               |
|  - Matched tag rationales & transparent safety audit trail                            |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                          FASTAPI BACKEND & REACT 18 DASHBOARD                         |
|  - REST endpoints for validation, inference, ranking, feedback, and aggregate metrics |
|  - 7 dashboard views: Overview, Profile, Recommendations, Risk, Rec Analytics,        |
|    Model Evaluation, and Governance/Safety                                            |
+---------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Responsibilities

```text
Healthcare Recommendation Analytics/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI lifespan, CORS, and route mounting
│   │   ├── config.py                   # Pydantic environment configurations
│   │   ├── api/
│   │   │   ├── routes.py               # REST endpoints implementation
│   │   │   └── schemas.py              # Pydantic schemas for request/response payloads
│   │   ├── services/
│   │   │   ├── prediction_service.py   # Model artifact inference & local explanations
│   │   │   ├── recommendation_service.py # Pipeline coordination & session management
│   │   │   └── analytics_service.py    # Aggregate metrics, coverage, feedback
│   │   ├── models/
│   │   │   └── db_models.py            # SQLAlchemy relational schemas
│   │   ├── database/
│   │   │   └── connection.py           # SQLite connection & sessionmaker
│   │   └── safety/
│   │       ├── rules.py                # Formal safety rule taxonomies & actions
│   │       └── filters.py              # Rule evaluation and emergency intercept logic
│   ├── tests/
│   │   ├── test_api.py                 # Integration tests for all endpoints
│   │   ├── test_recommender.py         # TF-IDF, CF, and cold-start unit tests
│   │   └── test_safety.py              # Safety contraindication rule unit tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, MetricCard, RiskGauge, SafetyBadge, etc.
│   │   ├── pages/                      # 7 full dashboard views
│   │   ├── services/api.ts             # Axios API client
│   │   ├── types/index.ts              # TypeScript interfaces
│   │   ├── App.tsx                     # React Router layout
│   │   └── main.tsx                    # React 18 DOM root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/
│   ├── raw/                            # UCI Heart Disease CSV & verified resources catalog
│   ├── processed/                      # Cleaned train/val/test splits
│   └── synthetic/                      # Calibrated synthetic interaction logs
├── models/                             # Serialized joblib artifacts
├── reports/
│   ├── figures/                        # High-resolution EDA and ROC curves
│   └── metrics/                        # JSON performance metrics
├── scripts/
│   ├── download_data.py                # Dataset acquisition & catalog generation
│   ├── preprocess_data.py              # Preprocessing & publication-grade EDA
│   ├── train_models.py                 # Model training, calibration, and tuning
│   └── evaluate_system.py              # Offline recommendation benchmark evaluation
├── src/
│   └── recommenders/
│       └── engine.py                   # Reusable recommender engine classes
├── docs/                               # Comprehensive research and technical documentation
├── Dockerfile
├── docker-compose.yml
└── README.md
```
