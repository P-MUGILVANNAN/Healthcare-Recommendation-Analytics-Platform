import React from 'react';
import { CheckCircle2, AlertOctagon, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SafetyEvaluation } from '../types';

interface SafetyBadgeProps {
  evaluation: SafetyEvaluation;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ evaluation }) => {
  const getBadgeConfig = () => {
    switch (evaluation.status) {
      case 'ALLOW':
        return {
          label: 'Safety Cleared',
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: ShieldCheck,
        };
      case 'FILTER':
        return {
          label: 'Contraindicated & Filtered',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: AlertOctagon,
        };
      case 'REVIEW_REQUIRED':
        return {
          label: 'Clinician Review Required',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: AlertTriangle,
        };
      case 'EMERGENCY_OVERRIDE':
        return {
          label: 'Emergency Intercept',
          bg: 'bg-red-600/25 text-red-200 border-red-500',
          icon: AlertOctagon,
        };
      case 'INSUFFICIENT_INFORMATION':
      default:
        return {
          label: 'Precautionary Guidance',
          bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: HelpCircle,
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-wide ${config.bg}`}
      title={evaluation.audit_message}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
};
