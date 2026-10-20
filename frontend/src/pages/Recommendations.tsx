import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  PhoneCall,
  Info,
  CheckCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';
import { api } from '../services/api';
import { RecommendationResponse, ProfileInput } from '../types';

export const Recommendations: React.FC = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weight customization state
  const [showWeightTuner, setShowWeightTuner] = useState(false);
  const [alpha, setAlpha] = useState(0.45);
  const [beta, setBeta] = useState(0.20);
  const [gamma, setGamma] = useState(0.20);
  const [delta, setDelta] = useState(0.15);
  const [topK, setTopK] = useState(5);
  const [applySafety, setApplySafety] = useState(true);

  const fetchRecommendations = () => {
    setLoading(true);
    setError(null);

    const saved = sessionStorage.getItem('active_health_profile');
    const profile: ProfileInput = saved ? JSON.parse(saved) : {
      age: 56,
      sex: 1,
      trestbps: 148,
      chol: 252,
      interests: ['hypertension', 'blood pressure', 'dash diet'],
      preferred_categories: ['Nutrition Education', 'Preventive Health'],
      acute_symptoms: []
    };

    api.getRecommendations(
      profile,
      topK,
      applySafety,
      { alpha, beta, gamma, delta }
    )
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to generate recommendations. Please check API server connection.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendations();
  }, [applySafety, topK]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hybrid Recommender Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Personalized Health Education</h1>
          <p className="text-xs text-slate-400">Educational resources ranked via weighted multi-criteria relevance and filtered by clinical safety constraints.</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowWeightTuner(!showWeightTuner)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-xs font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>{showWeightTuner ? 'Hide Weight Tuner' : 'Tune Weights'}</span>
          </button>

          <button
            onClick={fetchRecommendations}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-md shadow-sky-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-rank</span>
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner if Emergency Symptoms Detected */}
      {data?.emergency_alert?.is_emergency && (
        <div className="rounded-3xl bg-red-950/70 border-2 border-red-500 p-6 sm:p-8 text-red-100 shadow-2xl animate-pulse space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                CRITICAL EMERGENCY PROTOCOL ACTIVATED
              </h2>
              <p className="text-sm font-semibold text-red-200">
                {data.emergency_alert.guidance_message}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="font-semibold text-white">Reported Acute Symptoms:</span>
                {data.emergency_alert.detected_symptoms.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-red-900/80 border border-red-700 text-red-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="tel:911"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-red-900 font-bold text-sm shadow-lg hover:bg-red-50 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Emergency Services (911)</span>
            </a>
            <Link
              to="/profile"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-900/60 border border-red-700 text-white font-semibold text-sm hover:bg-red-800/60 transition-colors"
            >
              <span>Adjust Simulation Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Weight Tuner Drawer */}
      {showWeightTuner && (
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-5 bg-slate-900/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
                Hybrid Ranking Scoring Coefficients
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Weight: {(alpha + beta + gamma + delta).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Content Relevance (α)</span>
                <span className="font-mono font-bold text-sky-400">{alpha.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Collaborative Score (β)</span>
                <span className="font-mono font-bold text-purple-400">{beta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Category Match (γ)</span>
                <span className="font-mono font-bold text-emerald-400">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Evidence Quality (δ)</span>
                <span className="font-mono font-bold text-amber-400">{delta.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={delta}
                onChange={(e) => setDelta(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySafety}
                  onChange={(e) => setApplySafety(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-slate-300 font-medium">Apply Risk-Aware Safety Constraints</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Top-K:</span>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchRecommendations}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-colors"
            >
              Apply & Re-Score
            </button>
          </div>
        </div>
      )}

      {/* Recommender Metadata Status Bar */}
      {data && !data.emergency_alert?.is_emergency && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-300">
            <div>
              <span className="text-slate-500">Predicted Risk: </span>
              <span className="font-bold font-mono text-white">
                {Math.round((data.predicted_risk ?? 0) * 100)}% ({data.risk_tier} Tier)
              </span>
            </div>
            <div>
              <span className="text-slate-500">Items Shown: </span>
              <span className="font-bold text-white">{data.total_generated}</span>
            </div>
            <div>
              <span className="text-slate-500">Filtered for Safety: </span>
              <span className="font-bold text-rose-400">{data.total_filtered}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-[11px] font-mono">Session ID: {data.session_id}</span>
          </div>
        </div>
      )}

      {/* Recommendations Card List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Generating hybrid personalized recommendations...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-center">
          <p>{error}</p>
          <button onClick={fetchRecommendations} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
            Retry
          </button>
        </div>
      ) : data?.recommendations && data.recommendations.length > 0 ? (
        <div className="space-y-4">
          {data.recommendations.map((item, idx) => (
            <RecommendationCard
              key={item.item_id}
              item={item}
              rank={idx + 1}
              sessionId={data.session_id}
            />
          ))}
        </div>
      ) : !data?.emergency_alert?.is_emergency ? (
        <div className="py-16 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Educational Resources</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All candidate items were filtered by the current constraints or no items matched the profile preferences.
          </p>
        </div>
      ) : null}
    </div>
  );
};
