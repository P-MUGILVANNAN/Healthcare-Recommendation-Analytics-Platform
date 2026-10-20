import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Award,
  Layers,
  ThumbsUp,
  FileCheck,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';

export const RecommendationAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary()
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load recommendation analytics:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const categoryData = analytics?.categories_breakdown
    ? Object.entries(analytics.categories_breakdown).map(([name, value]) => ({ name, value }))
    : [];

  const evidenceData = analytics?.evidence_distribution
    ? Object.entries(analytics.evidence_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Recommender Performance & Population Distribution</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Recommendation Analytics</h1>
        <p className="text-xs text-slate-400">Auditing catalog coverage, category diversity, and user feedback signals across recommendation events.</p>
      </div>

      {/* Simulated Notice */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Synthetic Simulation Protocol:</strong> Interaction trends and collaborative filtering benchmarks reflect a calibrated synthetic user-item matrix of 734 events across 150 simulated user profiles.
        </span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <PieIcon className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Catalog Category Breakdown</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-300">{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Level Distribution */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Evidence Tier Distribution</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split(' ')[0] + ' ' + val.split(' ')[1]} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]}>
                  {evidenceData.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={index === 0 ? '#10b981' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Evidence ranking prioritizes Level A (RCTs and Clinical Guidelines) to maximize recommendation safety and efficacy.
          </p>
        </div>
      </div>

      {/* Top Recommended Resources Table */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">Most Frequently Recommended Resources</h3>
            <p className="text-xs text-slate-400">Based on aggregate profile-matching frequency and hybrid ranking consensus</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-2">Item ID</th>
                <th className="pb-3 px-2">Resource Title</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">Evidence Level</th>
                <th className="pb-3 px-2 text-right">Cohort Affinity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {analytics?.top_recommended_resources.map((item) => (
                <tr key={item.item_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-mono text-sky-400">{item.item_id}</td>
                  <td className="py-3 px-2 font-medium text-white">{item.title}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 font-medium">
                      {item.evidence}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-emerald-400">
                    {item.popularity_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
