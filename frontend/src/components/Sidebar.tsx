import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  User,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Cpu,
  Info,
  HeartPulse,
  Menu,
  X,
  Database,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'HEALTHY' | 'CONNECTING' | 'OFFLINE'>('CONNECTING');

  useEffect(() => {
    api.getHealth()
      .then(() => setHealthStatus('HEALTHY'))
      .catch(() => setHealthStatus('OFFLINE'));
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/', icon: Activity, desc: 'Dashboard & Pipeline' },
    { name: 'User Profile', path: '/profile', icon: User, desc: 'Triage & Biomarkers' },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles, desc: 'Personalized Resources' },
    { name: 'Health-Risk', path: '/risk-analytics', icon: ShieldAlert, desc: 'Cardiovascular Stratification' },
    { name: 'Rec Analytics', path: '/recommendation-analytics', icon: BarChart3, desc: 'Coverage & Diversity' },
    { name: 'Model Evaluation', path: '/model-evaluation', icon: Cpu, desc: 'ROC, F1 & Benchmark Ablations' },
    { name: 'About & Safety', path: '/about', icon: Info, desc: 'Rules & Governance' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/95 border-r border-slate-800 text-slate-100">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent font-['Outfit'] block leading-tight">
              HealthAnalytics<span className="text-emerald-400">.AI</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Risk-Aware Recommender</span>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/5'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="block leading-tight">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-normal hidden lg:block">{item.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Status Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                healthStatus === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                healthStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="text-slate-300 font-medium">API: {healthStatus}</span>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800/60 flex items-center space-x-1">
            <Database className="w-2.5 h-2.5 mr-0.5" />
            MySQL
          </span>
        </div>

        <div className="text-[10px] text-slate-400 leading-tight">
          Model: <span className="text-slate-200 font-mono">v1.2.0-calibrated</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile & Tablet Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-md">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-white font-['Outfit']">
            HealthAnalytics<span className="text-emerald-400">.AI</span>
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:text-white"
          aria-label="Open navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 w-64 shadow-xl">
        {sidebarContent}
      </aside>
    </>
  );
};
