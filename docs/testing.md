# Testing & Quality Assurance Suite

## 1. Overview of Test Coverage

The testing framework covers unit tests, integration tests, safety constraint audits, and API endpoint verification:

| Test Suite | File Location | Tests | Status |
| :--- | :--- | :---: | :---: |
| **API Integration** | `backend/tests/test_api.py` | 10 | PASSED |
| **Recommender Algorithms** | `backend/tests/test_recommender.py` | 3 | PASSED |
| **Risk-Aware Safety Rules** | `backend/tests/test_safety.py` | 5 | PASSED |
| **Frontend Production Build** | `frontend/ (tsc + vite build)` | Full Bundle | PASSED |

Total Automated Tests: **18 passed, 0 failed**.

---

## 2. Test Execution Command

Run the complete test suite locally:
```bash
python -m pytest backend/tests -v
```

### Safety Rules Covered:
- **`test_emergency_symptom_detection`**: Verifies that acute crushing chest pain reports immediately trigger `EMERGENCY_OVERRIDE` and suppress recommendations.
- **`test_high_cardiac_risk_exercise_filtered`**: Verifies that unmonitored aerobic exertion is filtered when cardiovascular risk exceeds 0.65 or exercise angina is present.
- **`test_supervised_rehab_allowed_for_high_risk`**: Verifies that supervised cardiac rehabilitation modules remain accessible for high-risk patients.
- **`test_hypertension_resistance_review_required`**: Verifies that severe systolic hypertension ($\ge 180\text{ mmHg}$) flags resistance training as `REVIEW_REQUIRED`.

---

## 3. Frontend Type-Check & Bundler Verification

```bash
cd frontend
npm run build
```
- Transpiles all TypeScript files with zero errors.
- Packages production assets into `frontend/dist/`.
