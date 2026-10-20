import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Sliders,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ProfileInput } from '../types';
import { api } from '../services/api';

const PRESETS: Record<string, { label: string; desc: string; data: ProfileInput }> = {
  hypertensive: {
    label: 'Hypertensive & Pre-Diabetic',
    desc: 'Adult aged 56, BP 148 mmHg, elevated cholesterol, interest in DASH nutrition and blood pressure control.',
    data: {
      age: 56,
      sex: 1,
      cp: 2,
      trestbps: 148,
      chol: 252,
      fbs: 1,
      restecg: 1,
      thalach: 138,
      exang: 0,
      oldpeak: 1.2,
      slope: 2,
      ca: 1,
      thal: 3,
      interests: ['hypertension', 'blood pressure', 'sodium reduction', 'dash diet'],
      preferred_categories: ['Nutrition Education', 'Preventive Health'],
      acute_symptoms: []
    }
  },
  healthy: {
    label: 'Healthy Active Adult',
    desc: 'Adult aged 32, normal blood pressure (118 mmHg), low cholesterol, looking for fitness and sleep hygiene.',
    data: {
      age: 32,
      sex: 0,
      cp: 3,
      trestbps: 118,
      chol: 185,
      fbs: 0,
      restecg: 0,
      thalach: 172,
      exang: 0,
      oldpeak: 0.1,
      slope: 1,
      ca: 0,
      thal: 3,
      interests: ['aerobic', 'circadian rhythm', 'sleep', 'endurance'],
      preferred_categories: ['Physical Activity', 'Sleep Hygiene'],
      acute_symptoms: []
    }
  },
  highRiskAngina: {
    label: 'High Cardiac Risk with Angina',
    desc: 'Adult aged 68, BP 162 mmHg, exercise-induced angina. Tests exercise contraindication safety filter.',
    data: {
      age: 68,
      sex: 1,
      cp: 4,
      trestbps: 162,
      chol: 288,
      fbs: 1,
      restecg: 2,
      thalach: 108,
      exang: 1,
      oldpeak: 2.8,
      slope: 2,
      ca: 2,
      thal: 7,
      interests: ['cardiovascular', 'angina', 'supervised cardiac rehab'],
      preferred_categories: ['Physical Activity', 'Preventive Health'],
      acute_symptoms: []
    }
  },
  deskWorker: {
    label: 'Sedentary Desk Worker',
    desc: 'Adult aged 44, mild stress, high resting tension, seeks ergonomics, mindfulness, and sleep optimization.',
    data: {
      age: 44,
      sex: 1,
      cp: 2,
      trestbps: 128,
      chol: 215,
      fbs: 0,
      restecg: 0,
      thalach: 145,
      exang: 0,
      oldpeak: 0.4,
      slope: 1,
      ca: 0,
      thal: 3,
      interests: ['stress reduction', 'ergonomics', 'mindfulness', 'posture'],
      preferred_categories: ['Stress Management', 'Physical Activity', 'Sleep Hygiene'],
      acute_symptoms: []
    }
  },
  emergency: {
    label: 'Acute Emergency Simulation',
    desc: 'Simulates reporting crushing chest pain to test the emergency intercept protocol.',
    data: {
      age: 60,
      sex: 1,
      cp: 4,
      trestbps: 170,
      chol: 260,
      fbs: 0,
      restecg: 1,
      thalach: 110,
      exang: 1,
      oldpeak: 3.0,
      slope: 2,
      ca: 1,
      thal: 7,
      interests: ['emergency awareness'],
      preferred_categories: ['Preventive Health'],
      acute_symptoms: ['crushing chest pain', 'shortness of breath']
    }
  }
};

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileInput>(PRESETS.hypertensive.data);
  const [activePreset, setActivePreset] = useState<string>('hypertensive');
  const [validation, setValidation] = useState<{ is_valid: boolean; data_quality_score: number; warnings: string[] }>({
    is_valid: true,
    data_quality_score: 1.0,
    warnings: []
  });

  useEffect(() => {
    // Save current profile in sessionStorage so recommendations & risk pages access it
    sessionStorage.setItem('active_health_profile', JSON.stringify(profile));
    api.validateProfile(profile)
      .then(res => setValidation(res))
      .catch(err => console.error(err));
  }, [profile]);

  const loadPreset = (key: string) => {
    setActivePreset(key);
    setProfile(PRESETS[key].data);
  };

  const handleInterestToggle = (tag: string) => {
    const current = profile.interests;
    if (current.includes(tag)) {
      setProfile({ ...profile, interests: current.filter(t => t !== tag) });
    } else {
      setProfile({ ...profile, interests: [...current, tag] });
    }
  };

  const handleCategoryToggle = (cat: string) => {
    const current = profile.preferred_categories;
    if (current.includes(cat)) {
      setProfile({ ...profile, preferred_categories: current.filter(c => c !== cat) });
    } else {
      setProfile({ ...profile, preferred_categories: [...current, cat] });
    }
  };

  const handleProceed = () => {
    sessionStorage.setItem('active_health_profile', JSON.stringify(profile));
    navigate('/recommendations');
  };

  const availableCategories = [
    'Nutrition Education',
    'Physical Activity',
    'Stress Management',
    'Sleep Hygiene',
    'Preventive Health'
  ];

  const popularInterests = [
    'hypertension', 'blood pressure', 'dash diet', 'cholesterol', 'omega 3',
    'aerobic', 'walking', 'resistance training', 'stress reduction', 'mindfulness',
    'sleep apnea', 'circadian rhythm', 'cardiac rehab', 'ergonomics'
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Profile Configuration & Triage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Simulate Clinical & Wellness Profile</h1>
          <p className="text-xs text-slate-400">Configure physiological parameters and personal wellness interests to test recommender behavior.</p>
        </div>

        {/* Data Quality Completeness Badge */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Completeness</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {Math.round(validation.data_quality_score * 100)}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Preset Personas Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Select Benchmark Persona:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(PRESETS).map(([key, p]) => {
            const isSelected = activePreset === key;
            const isEmerg = key === 'emergency';
            return (
              <button
                key={key}
                type="button"
                onClick={() => loadPreset(key)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 ${
                  isSelected
                    ? isEmerg
                      ? 'bg-rose-950/60 border-rose-500/80 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-500'
                      : 'bg-sky-500/15 border-sky-500/60 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? (isEmerg ? 'text-rose-400' : 'text-sky-400') : 'text-slate-200'}`}>
                    {p.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Clinical Biomarkers */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/70 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Cardiovascular Vitals</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Age (Years)</label>
              <input
                type="number"
                value={profile.age ?? ''}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Biological Sex</label>
              <select
                value={profile.sex ?? 1}
                onChange={(e) => setProfile({ ...profile, sex: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              >
                <option value={1}>Male</option>
                <option value={0}>Female</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Resting Systolic BP (mmHg)</label>
              <input
                type="number"
                value={profile.trestbps ?? ''}
                onChange={(e) => setProfile({ ...profile, trestbps: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Standard: 90 - 130 mmHg</span>
            </div>

            <div className="col-span-2">
              <label className="text-slate-400 block mb-1">Serum Cholesterol (mg/dl)</label>
              <input
                type="number"
                value={profile.chol ?? ''}
                onChange={(e) => setProfile({ ...profile, chol: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Desirable: &lt; 200 mg/dl</span>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Max Heart Rate (bpm)</label>
              <input
                type="number"
                value={profile.thalach ?? ''}
                onChange={(e) => setProfile({ ...profile, thalach: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">ST Depression (mm)</label>
              <input
                type="number"
                step="0.1"
                value={profile.oldpeak ?? 0}
                onChange={(e) => setProfile({ ...profile, oldpeak: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Column 2: Clinical Angina & Symptom History */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/70 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Anginal Presentation</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Chest Pain Classification (cp)</label>
              <select
                value={profile.cp ?? 2}
                onChange={(e) => setProfile({ ...profile, cp: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value={1}>1: Typical Angina</option>
                <option value={2}>2: Atypical Angina</option>
                <option value={3}>3: Non-Anginal Discomfort</option>
                <option value={4}>4: Asymptomatic (High CVD Correlation)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Exercise-Induced Angina (exang)</label>
              <select
                value={profile.exang ?? 0}
                onChange={(e) => setProfile({ ...profile, exang: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1 - Triggers Exercise Safety Filter)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Fasting Blood Sugar &gt; 120 mg/dl</label>
              <select
                value={profile.fbs ?? 0}
                onChange={(e) => setProfile({ ...profile, fbs: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value={0}>Normal / Negative (0)</option>
                <option value={1}>Elevated &gt; 120 mg/dl (1)</option>
              </select>
            </div>

            {/* Acute Symptoms Emergency Checkbox */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.acute_symptoms.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProfile({ ...profile, acute_symptoms: ['crushing chest pain', 'syncope'] });
                    } else {
                      setProfile({ ...profile, acute_symptoms: [] });
                    }
                  }}
                  className="rounded text-rose-500 focus:ring-rose-400 mt-0.5"
                />
                <div>
                  <span className="text-rose-300 font-semibold block text-xs">Simulate Acute Emergency Symptoms</span>
                  <span className="text-[11px] text-rose-400/80 leading-tight block">
                    Check to report crushing chest pain and test the automated 911 emergency intercept.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Column 3: Wellness Preferences & Target Categories */}
        <div className="rounded-3xl glass-panel p-6 border border-slate-700/70 space-y-4">
          <div className="flex items-center space-x-2 text-white pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-['Outfit']">Target Categories & Tags</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-2 font-medium">Preferred Educational Categories:</label>
              <div className="flex flex-wrap gap-1.5">
                {availableCategories.map((cat) => {
                  const active = profile.preferred_categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-2 font-medium">Wellness Interest Tags:</label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {popularInterests.map((tag) => {
                  const active = profile.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInterestToggle(tag)}
                      className={`px-2 py-0.5 rounded-md text-[11px] border transition-colors ${
                        active
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warnings / Feedback */}
      {validation.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <strong className="font-semibold block text-amber-300">Profile Precautionary Notices:</strong>
          <ul className="list-disc list-inside space-y-0.5 text-amber-300/80">
            {validation.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Proceed CTA */}
      <div className="flex flex-col sm:flex-row justify-end pt-2">
        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 hover:opacity-95 transition-all"
        >
          <span>Generate Personalized Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
