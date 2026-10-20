import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  probability: number;
  threshold?: number;
  tier?: 'Low' | 'Moderate' | 'Elevated';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  probability,
  threshold = 0.55,
  tier = 'Low'
}) => {
  const pct = Math.round(probability * 100);
  const thresholdPct = Math.round(threshold * 100);

  const getTierConfig = () => {
    if (probability < 0.35) {
      return {
        label: 'Low Risk Tier',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        barColor: 'bg-emerald-500',
        icon: ShieldCheck,
        desc: 'Cardiovascular risk profile within typical baseline boundaries.'
      };
    } else if (probability < 0.60) {
      return {
        label: 'Moderate Risk Tier',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-500',
        icon: AlertTriangle,
        desc: 'Borderline elevated biomarkers. Preventive lifestyle modifications indicated.'
      };
    } else {
      return {
        label: 'Elevated Risk Tier',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        barColor: 'bg-rose-500',
        icon: ShieldAlert,
        desc: 'Significant clinical risk markers detected. Clinical assessment strongly recommended.'
      };
    }
  };

  const config = getTierConfig();
  const Icon = config.icon;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 bg-slate-900/60 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Cardiovascular Risk Stratification</h3>
          <p className="text-xs text-slate-500">Calibrated HistGradientBoosting Classifier</p>
        </div>
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${config.bg} ${config.color}`}>
          <Icon className="w-4 h-4" />
          <span>{config.label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between my-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-extrabold text-white font-['Outfit']">{pct}%</span>
          <span className="text-xs text-slate-400">Predicted Probability</span>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400">Decision Threshold: </span>
          <span className="font-mono font-bold text-sky-400">{thresholdPct}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80 my-3">
        {/* Fill bar */}
        <div
          className={`h-full transition-all duration-700 rounded-full ${config.barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
        />
        {/* Decision threshold indicator needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
          style={{ left: `${thresholdPct}%` }}
          title={`Optimal Decision Threshold: ${thresholdPct}%`}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
        <span>0% (Low)</span>
        <span className="text-sky-300">▲ Threshold ({thresholdPct}%)</span>
        <span>100% (High)</span>
      </div>

      <p className="mt-4 text-xs text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
        {config.desc}
      </p>
    </div>
  );
};
