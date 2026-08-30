import React from 'react';
import { Activity } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex max-w-[85%] flex-row">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white mr-3 flex items-center justify-center">
          <Activity size={16} />
        </div>
        <div className="px-4 py-4 rounded-2xl rounded-tl-sm bg-white border border-charcoal-200 flex items-center space-x-1.5 h-[46px]">
          <div className="w-1.5 h-1.5 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
