import React from 'react';
import {
  ShieldAlert,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const AboutSafety: React.FC = () => {
  const safetyRules = [
    {
      id: 'RULE-EMERGENCY-01',
      name: 'Acute Symptom Emergency Intercept',
      severity: 'CRITICAL',
      action: 'EMERGENCY_OVERRIDE',
      desc: 'Detects crushing chest pain, resting dyspnea, or syncope. Immediately suspends recommendation and outputs 911 emergency referral.'
    },
    {
      id: 'RULE-EXERCISE-02',
      name: 'High Cardiac Risk Unmonitored Exercise Contraindication',
      severity: 'HIGH',
      action: 'FILTER',
      desc: 'Excludes unmonitored aerobic exertion if predicted risk > 0.65 or active exercise-induced angina exists. Recommends supervised rehabilitation.'
    },
    {
      id: 'RULE-HYPERTENSION-03',
      name: 'Severe Resting Hypertension Resistance Precaution',
      severity: 'MODERATE',
      action: 'REVIEW_REQUIRED',
      desc: 'Flags strenuous resistance training for clinical review when resting systolic blood pressure >= 180 mmHg.'
    },
    {
      id: 'RULE-DATA-04',
      name: 'Missing Critical Vitals Precaution',
      severity: 'LOW',
      action: 'INSUFFICIENT_INFORMATION',
      desc: 'Enforces conservative baseline educational recommendations when vital indicators (e.g., blood pressure or age) are omitted.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Governance & Safety Framework</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Safety Rules & Research Methodology</h1>
        <p className="text-xs text-slate-400">Documentation of risk-aware guardrails, evidence rubrics, privacy safeguards, and clinical boundaries.</p>
      </div>

      {/* Safety Rules Registry Table */}
      <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-['Outfit']">Safety & Suitability Rule Engine</h3>
          <p className="text-xs text-slate-400">Formal rules executed prior to recommendation rendering to prevent unsafe lifestyle advice</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-2">Rule ID</th>
                <th className="pb-3 px-2">Rule Name</th>
                <th className="pb-3 px-2">Severity</th>
                <th className="pb-3 px-2">Action Code</th>
                <th className="pb-3 px-2">Clinical Logic & Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {safetyRules.map((rule) => {
                const isCrit = rule.severity === 'CRITICAL';
                const isHigh = rule.severity === 'HIGH';

                return (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 font-mono text-sky-400">{rule.id}</td>
                    <td className="py-3 px-2 font-medium text-white">{rule.name}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-300">{rule.action}</td>
                    <td className="py-3 px-2 text-slate-400 leading-relaxed">{rule.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Hierarchy & Privacy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evidence Hierarchy */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Evidence-Based Medicine Rubric</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-emerald-400 font-bold block mb-1">Level A (Gold Standard)</strong>
              <p className="text-slate-400 leading-snug">
                Multiple randomized controlled clinical trials (RCTs) or meta-analyses (e.g., DASH Trial, PREDIMED Mediterranean diet trial).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-sky-400 font-bold block mb-1">Level B (Systematic Observational)</strong>
              <p className="text-slate-400 leading-snug">
                Prospective cohort studies, case-control analyses, or institutional clinical guidelines (e.g., CDC National Diabetes Prevention Program).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <strong className="text-amber-400 font-bold block mb-1">Level C (Expert Consensus)</strong>
              <p className="text-slate-400 leading-snug">
                Expert committee reports, specialized professional opinions, and standard-of-care clinical consensus panels.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy by Design Safeguards */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/80 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Privacy-by-Design Architecture</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Zero PII Collection</strong>
                <span className="text-slate-400">No names, emails, phone numbers, government IDs, or IP addresses are stored.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Session-Scoped Temporary Processing</strong>
                <span className="text-slate-400">Profile simulation parameters exist purely in client session memory during evaluation.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">Synthetic Interaction Transparency</strong>
                <span className="text-slate-400">Collaborative filtering benchmarks explicitly label synthetic signals to avoid false clinical claims.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Non-Diagnostic Disclaimer */}
      <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Formal Educational Research Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          The Personalized Healthcare Recommendation Analytics system is an educational research software demonstration. It is not approved by the U.S. FDA, European EMA, or equivalent medical device authorities. The predictions generated by the machine learning risk classifier represent exploratory statistical patterns on public training sets and must never be interpreted as individual medical diagnoses, treatment plans, or prescriptions. Individuals with cardiovascular symptoms must seek consultation from qualified physicians.
        </p>
      </div>
    </div>
  );
};
