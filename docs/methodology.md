# Methodology & Algorithm Design

## 1. Primary Health Risk Modeling Task

The supervised prediction module formulates cardiovascular risk stratification using the landmark UCI Cleveland Heart Disease benchmark.
- **Input Features (13 attributes):**
  - Demographic: Age, Biological Sex
  - Physiological: Resting Blood Pressure (`trestbps`), Serum Cholesterol (`chol`), Fasting Blood Sugar (`fbs`), Resting Electrocardiogram (`restecg`), Maximum Heart Rate Achieved (`thalach`)
  - Exercise Stress Symptoms: Exercise-Induced Angina (`exang`), ST Depression (`oldpeak`), Slope of Peak Exercise ST (`slope`)
  - Fluoroscopy & Thallium Scans: Major vessels colored (`ca`), Thallium heart scan defect (`thal`)
- **Target:** Angiographic coronary stenosis presence (`target = 1` if >50% diameter narrowing, `0` otherwise).
- **Leakage Prevention:** Numerical feature scalers (`StandardScaler`) are fit exclusively on the 70% stratified training partition.
- **Probability Calibration:** Base models are wrapped with `CalibratedClassifierCV` using sigmoid Platt scaling across 5 stratified folds to ensure output probabilities correspond directly to observed empirical event rates (Brier score minimized from 0.110 to 0.095).

---

## 2. Hybrid Recommendation Scoring Formulation

Candidate resources are scored and ranked via a convex combination of content, collaborative, preference, and evidence signals:

$$\text{Base Score} = \alpha \cdot S_{\text{content}} + \beta \cdot S_{\text{collab}} + \gamma \cdot S_{\text{pref}} + \delta \cdot S_{\text{quality}}$$

Where:
- $S_{\text{content}}$: Cosine similarity of user profile vector to item TF-IDF corpus vector.
- $S_{\text{collab}}$: Predicted user rating normalized between $[0, 1]$ via item-item collaborative cosine similarity. When no user history exists (cold-start), normalized popularity frequency is used and weights are automatically rebalanced ($\beta \to 0, \sum(\alpha, \gamma, \delta) = 1.0$).
- $S_{\text{pref}}$: Binary indicator (1.0 vs 0.2) reflecting user stated educational category preference.
- $S_{\text{quality}}$: Evidence hierarchy weighting (Level A = 1.0, Level B = 0.8, Level C = 0.6).
- **Default Weights:** $\alpha = 0.45, \beta = 0.20, \gamma = 0.20, \delta = 0.15$.

### Maximal Marginal Relevance (MMR) Diversity Penalty
To prevent a single topic (e.g. nutrition) from monopolizing the top-K list, an intra-list diversity penalty is applied during top-K extraction:

$$\text{Hybrid Rank Score}_i = \text{Base Score}_i - \lambda \cdot \text{Count}(\text{Category}_i)$$

Where $\lambda = 0.08$.

---

## 3. Risk-Aware Safety and Suitability Architecture

The safety layer operates as an independent constraint layer that **strictly overrides** relevance scores:
1. **Rule Action Taxonomy:**
   - `EMERGENCY_OVERRIDE`: Triggered when acute symptoms (crushing chest pain, severe resting shortness of breath, loss of consciousness) are entered. Educational cards are suppressed and emergency 911 guidance is returned immediately.
   - `FILTER`: Excludes candidate items whose physical demands conflict with patient health state (e.g., unmonitored vigorous aerobic exercise is completely blocked for patients with predicted cardiovascular risk $>0.65$ or active exercise angina).
   - `REVIEW_REQUIRED`: Requires clinician consultation before application (e.g., severe resting hypertension $\ge 180\text{ mmHg}$ flags strenuous resistance exercises).
   - `INSUFFICIENT_INFORMATION`: Applies conservative baseline educational fallbacks when key baseline vitals are missing.
