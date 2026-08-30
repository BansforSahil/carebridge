import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onAskCareBridge?: () => void;
  onFindResources?: () => void;
}

export default function Hero({ onAskCareBridge, onFindResources }: HeroProps) {
  return (
    <div className="relative pt-10 pb-20 lg:pt-16 lg:pb-24 overflow-hidden">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
          <ShieldCheck size={16} />
          <span>Awareness • Accessibility • Responsible AI</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.1] mb-6">
          Healthcare information,<br />
          <span className="text-primary-600">made easier to reach.</span>
        </h1>
        
        <p className="text-base md:text-lg text-charcoal-600 mb-10 max-w-2xl leading-relaxed">
          Ask questions in your language. Get clear health awareness information and help finding relevant healthcare resources.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto justify-center">
          <button 
            onClick={onAskCareBridge}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3.5 md:py-3 rounded-xl md:rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm cursor-pointer">
            Ask CareBridge
            <ArrowRight size={18} className="ml-2" />
          </button>
          <button 
            onClick={onFindResources}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3.5 md:py-3 rounded-xl md:rounded-lg bg-white border border-charcoal-200 text-charcoal-800 font-medium hover:bg-charcoal-50 hover:border-charcoal-300 focus:outline-none focus:ring-2 focus:ring-charcoal-400 focus:ring-offset-2 transition-colors shadow-sm cursor-pointer">
            Find Healthcare Resources
          </button>
        </div>
      </div>
    </div>
  );
}
