import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Check,
  FileCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { SafetyBadge } from './SafetyBadge';
import { api } from '../services/api';

interface RecommendationCardProps {
  item: RecommendationItem;
  rank: number;
  sessionId?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  rank,
  sessionId
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleRating = async (stars: number) => {
    setRating(stars);
    try {
      await api.submitFeedback({
        item_id: item.item_id,
        rating: stars,
        session_id: sessionId
      });
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (e) {
      console.error('Failed to submit feedback:', e);
    }
  };

  const scorePct = Math.round(item.hybrid_rank_score * 100);

  return (
    <div className="rounded-2xl glass-panel border border-slate-700/80 bg-slate-900/70 p-5 shadow-lg hover:border-slate-600 transition-all duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs border border-sky-500/30 font-mono shrink-0">
            #{rank}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 text-[11px] sm:text-xs font-semibold border border-slate-700">
                {item.category}
              </span>
              {item.evidence_level && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 text-[11px] sm:text-xs font-medium border border-emerald-800/40 flex items-center space-x-1">
                  <FileCheck className="w-3 h-3 inline mr-1" />
                  {item.evidence_level}
                </span>
              )}
              <SafetyBadge evaluation={item.safety_evaluation} />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">{item.title}</h4>
          </div>
        </div>

        {/* Hybrid Rank Score Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60 shrink-0">
          <div className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">{scorePct}%</div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Suitability</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
        {item.description}
      </p>

      {/* Source & Action Links */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex flex-wrap items-center space-x-2 text-slate-400">
          <span className="text-[11px]">Source:</span>
          <span className="text-slate-200 font-medium">{item.source}</span>
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 ml-1"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Explainability & Feedback toggles */}
        <div className="flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto">
          {/* Quick Feedback Stars */}
          <div className="flex items-center space-x-1 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 mr-1">Rate:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`transition-colors ${
                  (rating && rating >= star) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'
                }`}
                title={`Rate ${star} star`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
            {feedbackSent && <Check className="w-3 h-3 text-emerald-400 ml-1" />}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-[11px]">Explain</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Explanation & Score Breakdown Drawer */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-5 -mb-5 p-5 rounded-b-2xl space-y-3">
          {/* Component Scores Breakdown */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Hybrid Score Decomposition</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Content Match</span>
                <span className="text-sm font-bold text-sky-400">
                  {Math.round(item.component_scores.content_relevance * 100)}%
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Collaborative</span>
                <span className="text-sm font-bold text-purple-400">
                  {Math.round(item.component_scores.collaborative_score * 100)}%
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Category Match</span>
                <span className="text-sm font-bold text-emerald-400">
                  {Math.round(item.component_scores.preference_match * 100)}%
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Evidence Tier</span>
                <span className="text-sm font-bold text-amber-400">
                  {Math.round(item.component_scores.quality_evidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Explainability Tags and Audit Notes */}
          <div className="pt-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explainable AI Insights</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              {item.explainability.rationales.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            {item.safety_evaluation.audit_message && (
              <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                Safety Audit: {item.safety_evaluation.audit_message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
