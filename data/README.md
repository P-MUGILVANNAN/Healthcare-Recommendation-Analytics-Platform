# Dataset Documentation & Provenance

This directory contains the datasets utilized throughout the Personalized Healthcare Recommendation Analytics pipeline.

## 1. Directory Structure

```text
data/
├── raw/
│   ├── heart_disease_raw.csv    # 303 UCI Cleveland Clinic records
│   └── health_resources.json    # 16 verified educational health resources
├── processed/
│   ├── train.csv                # 70% Stratified training partition (zero leakage)
│   ├── val.csv                  # 15% Stratified validation partition (for probability calibration)
│   ├── test.csv                 # 15% Stratified test partition (held-out evaluation)
│   └── full_cleaned.csv         # Full cleaned dataset with imputed values
└── synthetic/
    └── interactions.csv         # 734 calibrated synthetic user-item interaction records
```

## 2. Dataset Descriptions

### UCI Cleveland Heart Disease Dataset (`data/raw/heart_disease_raw.csv`)
- **Source:** UCI Machine Learning Repository / Cleveland Clinic Foundation.
- **URL:** `https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data`
- **Samples:** 303 adult patients.
- **Attributes:** 13 clinical biomarkers + 1 binary angiographic target.
- **Missing Value Handling:** Columns `ca` (4 missing) and `thal` (2 missing) are imputed with training medians (0.0 and 3.0 respectively).

### Verified Educational Resources Catalog (`data/raw/health_resources.json`)
- **Categories:** Nutrition Education, Physical Activity, Stress Management, Sleep Hygiene, Preventive Health.
- **Evidence Grading:** Level A (RCTs / Meta-analyses), Level B (Systematic Cohorts / Practice Guidelines), Level C (Consensus).
- **Sources:** NIH NHLBI, American Heart Association (AHA), American College of Sports Medicine (ACSM), American Academy of Sleep Medicine (AASM), CDC NDPP, and WHO.

### Synthetic Interactions (`data/synthetic/interactions.csv`)
- **Explicit Labeling:** All records are generated synthetically for offline collaborative filtering research and benchmark comparisons.
- **Size:** 734 interaction records across 150 simulated user personas with actions: `view`, `bookmark`, `helpful`, `completed`.
