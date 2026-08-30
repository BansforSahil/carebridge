import React, { useState } from 'react';
import { HEALTH_TOPICS, HealthTopic } from '../data/healthTopics';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HealthTopics() {
  const [selectedTopic, setSelectedTopic] = useState<HealthTopic | null>(null);

  return (
    <div className="py-8">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">Explore Health Topics</h1>
        <p className="text-base md:text-lg text-charcoal-600 max-w-2xl">Browse verified educational content regarding preventive healthcare and general wellness.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {HEALTH_TOPICS.map((topic) => (
          <div 
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className="group bg-white border border-charcoal-200 p-5 md:p-6 rounded-2xl cursor-pointer hover:border-primary-400 hover:shadow-md transition-all flex flex-col h-full"
          >
            <h3 className="text-lg font-semibold text-charcoal-900 mb-3 group-hover:text-primary-700 transition-colors">{topic.title}</h3>
            <p className="text-sm text-charcoal-600 line-clamp-3 mb-6 flex-grow">{topic.description}</p>
            <div className="mt-auto flex items-center text-primary-600 text-sm font-medium">
              Read more
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm" onClick={() => setSelectedTopic(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-charcoal-100">
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 pr-4">{selectedTopic.title}</h2>
              <button 
                onClick={() => setSelectedTopic(null)}
                className="p-2 text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-50 rounded-full transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto">
              <p className="text-base sm:text-lg text-charcoal-700 mb-6 sm:mb-8 leading-relaxed">{selectedTopic.description}</p>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center">
                  <div className="w-2 h-6 bg-primary-500 rounded-sm mr-3"></div>
                  Key Awareness Points
                </h3>
                <ul className="space-y-3">
                  {selectedTopic.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-charcoal-700 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 mb-8">
                <h4 className="font-semibold text-primary-900 mb-2 flex items-center">
                  <ShieldCheck size={18} className="mr-2 text-primary-600" />
                  Prevention Info
                </h4>
                <p className="text-primary-800 text-sm">{selectedTopic.preventionInfo}</p>
              </div>

              {selectedTopic.safetyInfo && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-8">
                  <h4 className="font-semibold text-amber-900 mb-2">Safety Information</h4>
                  <p className="text-amber-800 text-sm">{selectedTopic.safetyInfo}</p>
                </div>
              )}

              <div className="border-t border-charcoal-100 pt-6">
                <h4 className="text-sm font-semibold text-charcoal-900 mb-3 uppercase tracking-wider">Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.sources.map((source, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-charcoal-50 text-xs text-charcoal-600 border border-charcoal-200">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-charcoal-100 bg-charcoal-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setSelectedTopic(null)}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
