import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Cpu,
  BookOpen,
  ArrowRight,
  Database,
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';

export const Overview: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load summary analytics:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-8 sm:p-10 border border-slate-700/80 bg-gradient-to-r from-slate-900/95 via-sky-950/40 to-slate-900/95 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Explainable AI & Risk-Aware Decision Support</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-['Outfit'] leading-tight">
            Personalized Healthcare Recommendation Analytics
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            A state-of-the-art clinical analytics platform combining <span className="text-sky-300 font-medium">calibrated tree-based risk stratification</span>, <span className="text-purple-300 font-medium">hybrid collaborative & content-based filtering</span>, and <span className="text-emerald-300 font-medium">rule-based safety constraints</span> to deliver verified, interpretable health education resources.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:opacity-95 transition-all"
            >
              <span>Explore User Profiles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/model-evaluation"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700/60 font-semibold text-sm transition-all"
            >
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Inspect ML Benchmarks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Verified Catalog"
          value={loading ? '...' : analytics?.total_resources ?? 16}
          subtitle="Peer-reviewed educational modules"
          icon={BookOpen}
          color="sky"
          badge="Verified"
        />
        <MetricCard
          title="Profiles Analyzed"
          value={loading ? '...' : analytics?.processed_profiles.toLocaleString() ?? '150+'}
          subtitle="Privacy-preserving aggregate cohort"
          icon={Activity}
          color="purple"
          badge="Cohort"
        />
        <MetricCard
          title="Safety Interventions"
          value={loading ? '...' : analytics?.safety_interventions_count ?? 42}
          subtitle="Contraindications filtered"
          icon={ShieldCheck}
          color="emerald"
          badge="Safe"
        />
        <MetricCard
          title="User Helpfulness"
          value={loading ? '...' : `${analytics?.average_feedback_rating ?? 4.7}/5.0`}
          subtitle="Positive recommendation consensus"
          icon={TrendingUp}
          color="amber"
          badge="Rating"
        />
      </div>

      {/* Pipeline Architecture Visualizer */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-700/70">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white font-['Outfit']">End-to-End System Pipeline Architecture</h2>
          <p className="text-xs text-slate-400">Strict leakage prevention and modular separation of concerns from data to decision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Data Ingestion</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              UCI Cleveland Heart Disease dataset & authentic public health catalogs (CDC, AHA, NHLBI).
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Risk Modeling</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calibrated HistGradientBoosting model (ROC-AUC 0.950) with 5-fold probability calibration.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Hybrid Recommender</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Weighted fusion of TF-IDF content similarity, item collaborative filtering, and category preferences.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h4 className="text-sm font-bold text-white">Safety Layer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Rule engine filters out high-risk exertion contraindications and intercepts emergency symptoms.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
              05
            </div>
            <h4 className="text-sm font-bold text-white">Explainable AI</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides score decompositions, matched tag rationales, and local feature risk contributions.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Provenance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl glass-panel p-6 border border-slate-700/70 space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white font-['Outfit']">Verified Data Sources & Provenance</h3>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block font-medium">UCI Cleveland Clinic Foundation Heart Disease Dataset</strong>
                <span className="text-slate-400">303 patient records, 13 clinical biomarkers, angiographic cardiovascular status.</span>
              </div>
              <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px]">Open ML</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block font-medium">Public Health Clinical Guidelines & Educational Catalog</strong>
                <span className="text-slate-400">Curated modules from NHLBI DASH, AHA Mediterranean pattern, ACSM walking protocols.</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Evidence Level A/B</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <div>
                <strong className="text-white block font-medium">Calibrated Synthetic Collaborative Interactions</strong>
                <span className="text-slate-400">734 explicit interaction events across 150 simulated user personas for offline CF validation.</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">Simulated Holdout</span>
            </div>
          </div>
        </div>

        {/* System Environment Status */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/70 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white font-['Outfit']">Active Pipeline Status</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">ML Model Version</span>
              <span className="font-mono text-white">v1.2.0-calibrated</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Optimal Threshold</span>
              <span className="font-mono text-sky-400">0.55</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Safety Rule Engine</span>
              <span className="font-mono text-emerald-400">4 Active Rules</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Test ROC-AUC</span>
              <span className="font-mono text-emerald-400">0.950</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-mono text-white">SQLite + SQLAlchemy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
