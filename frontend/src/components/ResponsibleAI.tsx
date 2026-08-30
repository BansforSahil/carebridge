import React from 'react';
import { ShieldAlert, BookOpen, Users } from 'lucide-react';

export default function ResponsibleAI() {
  return (
    <div className="py-8 md:py-16">
      <div className="bg-white border border-charcoal-200 rounded-3xl p-6 sm:p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-4">Awareness, not diagnosis.</h2>
        <p className="text-base sm:text-lg text-charcoal-600 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
          CareBridge provides educational healthcare information and helps users discover relevant healthcare resources. It does not replace a qualified healthcare professional.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="font-semibold text-charcoal-900 mb-2">Trusted Information</h3>
            <p className="text-sm text-charcoal-500 text-center">Based on reliable health guidelines and public awareness campaigns.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-semibold text-charcoal-900 mb-2">Safety First</h3>
            <p className="text-sm text-charcoal-500 text-center">Designed to recognize urgent terms and suggest immediate professional help.</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-charcoal-900 mb-2">Human Support</h3>
            <p className="text-sm text-charcoal-500 text-center">We always recommend consulting a real doctor for any medical decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
