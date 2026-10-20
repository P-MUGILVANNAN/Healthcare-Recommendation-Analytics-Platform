import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: string;
  color?: 'sky' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  color = 'sky'
}) => {
  const colorMap = {
    sky: 'from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/30 shadow-sky-500/10',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30 shadow-amber-500/10',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30 shadow-purple-500/10',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30 shadow-rose-500/10',
  };

  return (
    <div className={`p-5 rounded-2xl glass-panel border bg-gradient-to-br ${colorMap[color]} shadow-lg transition-all duration-300 hover:translate-y-[-2px]`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${colorMap[color].split(' ')[2]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-white tracking-tight font-['Outfit']">{value}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className="font-medium text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};
