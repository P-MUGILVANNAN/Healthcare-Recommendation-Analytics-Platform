import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200/90 flex items-center justify-center space-x-2.5 shadow-sm">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        <strong className="font-semibold text-amber-300">Educational Decision-Support Prototype:</strong> This platform demonstrates hybrid machine learning, risk stratification, and safety filtering. It is not an approved medical device, diagnostic engine, or prescription tool. Always consult a licensed healthcare professional for medical diagnoses.
      </span>
    </div>
  );
};
