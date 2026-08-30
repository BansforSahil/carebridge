import React from 'react';
import { ShieldCheck, Syringe, Apple, MapPin, HeartHandshake, ChevronRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: ShieldCheck, title: "Prevention", desc: "Everyday health habits" },
    { icon: Syringe, title: "Vaccination", desc: "Understand immunization" },
    { icon: Apple, title: "Nutrition", desc: "Practical awareness" },
    { icon: MapPin, title: "Find Resources", desc: "Healthcare access" },
    { icon: HeartHandshake, title: "Maternal Health", desc: "Preventive guidance" },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-charcoal-900">Quick Actions</h2>
        <p className="text-sm text-charcoal-500">Explore common healthcare topics.</p>
      </div>

      <div className="grid gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className="group flex items-center justify-between p-4 bg-white border border-charcoal-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-charcoal-900 group-hover:text-primary-700 transition-colors truncate">{action.title}</h3>
                  <p className="text-xs text-charcoal-500 truncate">{action.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="flex-shrink-0 text-charcoal-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all ml-2" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
