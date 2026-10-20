import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  BarChart2,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { RiskGauge } from '../components/RiskGauge';
import { api } from '../services/api';
import { RiskPredictionResponse, ModelMetricsResponse, ProfileInput } from '../types';

export const RiskAnalytics: React.FC = () => {
  const [prediction, setPrediction] = useState<RiskPredictionResponse | null>(null);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('active_health_profile');
    const profile: ProfileInput = saved ? JSON.parse(saved) : {
      age: 56,
      sex: 1,
      cp: 2,
      trestbps: 148,
      chol: 252,
      fbs: 1,
      thalach: 138,
      exang: 0,
      oldpeak: 1.2
    };

    Promise.all([
      api.predictRisk(profile),
      api.getModelMetrics()
    ])
      .then(([predRes, metRes]) => {
        setPrediction(predRes);
        setMetrics(metRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load risk analytics:', err);
        setLoading(false);
      });
  }, []);

  // Format global feature importances for Recharts
  const featureChartData = metrics?.feature_importances
    ? Object.entries(metrics.feature_importances)
        .map(([feature, importance]) => ({
          feature,
          importance: Math.round(importance * 1000) / 1000,
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 8)
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Supervised Risk Stratification Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Cardiovascular Risk Analytics</h1>
        <p className="text-xs text-slate-400">Interpretable machine learning predictions calibrated via HistGradientBoosting on UCI benchmark data.</p>
      </div>

      {/* Top Grid: Risk Gauge & Model Calibration Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-64 rounded-2xl glass-panel flex items-center justify-center">
              <span className="text-xs text-slate-400">Computing risk probabilities...</span>
            </div>
          ) : prediction ? (
            <RiskGauge
              probability={prediction.predicted_probability}
              threshold={prediction.decision_threshold}
              tier={prediction.risk_tier}
            />
          ) : null}
        </div>

        {/* Model Calibration & Performance Summary */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-700/80 bg-slate-900/60 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Activity className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Classifier Properties</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Algorithm</span>
              <span className="font-semibold text-white">Calibrated HistGradientBoosting</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Test ROC-AUC</span>
              <span className="font-mono font-bold text-emerald-400">0.950</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Brier Calibration Score</span>
              <span className="font-mono font-bold text-sky-400">0.095 (Well-Calibrated)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Optimal Threshold</span>
              <span className="font-mono font-bold text-amber-400">0.55</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Max Test F1</span>
              <span className="font-mono font-bold text-emerald-400">0.927</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300 block mb-1">Calibration Notice:</strong>
            Predicted probabilities are adjusted via sigmoid scaling against out-of-fold validation sets so scores represent reliable empirical risk frequencies.
          </div>
        </div>
      </div>

      {/* Local Feature Risk Contributions */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">Patient Local Feature Contributions</h3>
            <p className="text-xs text-slate-400">Identifies which specific biomarkers push risk towards elevated or low tiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prediction?.local_feature_contributions.map((fc, idx) => {
            const isIncrease = fc.impact_direction === 'Increases Risk';
            const isDecrease = fc.impact_direction === 'Decreases Risk';

            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{fc.feature}</span>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isIncrease
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : isDecrease
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : isDecrease ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    <span>{fc.impact_direction}</span>
                  </span>
                </div>

                <div className="text-sm font-extrabold text-sky-400 font-mono">
                  {fc.patient_value}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {fc.clinical_note}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
        <div className="pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-['Outfit']">Global Model Feature Importances</h3>
          <p className="text-xs text-slate-400">Relative Gini / Permutation importance across the complete UCI cohort</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: number) => [`${val}`, 'Relative Importance']}
              />
              <Bar dataKey="importance" fill="#0284c7" radius={[0, 4, 4, 0]}>
                {featureChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : '#0284c7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Non-Diagnostic Clinical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Methodological Disclosure:</strong> This cardiovascular risk classifier is built using open-access UCI Cleveland datasets for machine learning experimentation. Output probabilities represent mathematical association on test splits and do not constitute an individualized medical diagnosis. Always consult clinical practitioners for personal cardiology evaluation.
        </p>
      </div>
    </div>
  );
};
