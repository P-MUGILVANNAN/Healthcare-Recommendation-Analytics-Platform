import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Overview } from './pages/Overview';
import { UserProfile } from './pages/UserProfile';
import { Recommendations } from './pages/Recommendations';
import { RiskAnalytics } from './pages/RiskAnalytics';
import { RecommendationAnalytics } from './pages/RecommendationAnalytics';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { AboutSafety } from './pages/AboutSafety';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans">
        {/* Navigation Sidebar (Desktop fixed, Mobile sliding drawer) */}
        <Sidebar />

        {/* Content Wrapper offset by sidebar on desktop */}
        <div className="md:pl-64 flex flex-col flex-1 min-w-0">
          <DisclaimerBanner />

          <main className="flex-1 pb-16 px-3 sm:px-6 lg:px-8 max-w-full">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/risk-analytics" element={<RiskAnalytics />} />
              <Route path="/recommendation-analytics" element={<RecommendationAnalytics />} />
              <Route path="/model-evaluation" element={<ModelEvaluation />} />
              <Route path="/about" element={<AboutSafety />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-800 bg-slate-950/70 text-slate-400 text-xs py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-300">HealthAnalytics.AI</span>
                <span>— Personalized Healthcare Recommendation Analytics</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                MySQL Backend Active • Hybrid Machine Learning & Risk-Aware Safety
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;
