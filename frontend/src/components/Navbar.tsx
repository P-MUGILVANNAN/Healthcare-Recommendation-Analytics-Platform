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
  HeartPulse
} from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState<'HEALTHY' | 'CONNECTING' | 'OFFLINE'>('CONNECTING');

  useEffect(() => {
    api.getHealth()
      .then(() => setHealthStatus('HEALTHY'))
      .catch(() => setHealthStatus('OFFLINE'));
  }, []);

  const navItems = [
    { name: 'Overview', path: '/', icon: Activity },
    { name: 'User Profile', path: '/profile', icon: User },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Health-Risk', path: '/risk-analytics', icon: ShieldAlert },
    { name: 'Rec Analytics', path: '/recommendation-analytics', icon: BarChart3 },
    { name: 'Model Evaluation', path: '/model-evaluation', icon: Cpu },
    { name: 'About & Safety', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-300">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent font-['Outfit']">
                HealthAnalytics<span className="text-emerald-400">.AI</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Risk-Aware Recommendation Engine</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Health Status Pill */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  healthStatus === 'HEALTHY' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  healthStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </span>
              <span className="text-slate-300 text-[11px] font-mono tracking-tight">API: {healthStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
