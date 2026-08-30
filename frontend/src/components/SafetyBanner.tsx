import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SafetyBannerProps {
  level: 'normal' | 'caution' | 'urgent';
}

export default function SafetyBanner({ level }: SafetyBannerProps) {
  if (level === 'normal') return null;

  if (level === 'urgent') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-red-900 mb-1">Seek Medical Attention</h4>
          <p className="text-xs text-red-800">Your query mentions symptoms that could require immediate attention. Please contact emergency services or visit a hospital.</p>
        </div>
      </div>
    );
  }

  if (level === 'caution') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-amber-900 mb-1">Medical Advice Recommended</h4>
          <p className="text-xs text-amber-800">This information is for awareness only. Please consult a qualified healthcare professional for an accurate diagnosis.</p>
        </div>
      </div>
    );
  }

  return null;
}
