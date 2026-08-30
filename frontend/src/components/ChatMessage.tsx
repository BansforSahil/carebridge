import React from 'react';
import { Activity, User } from 'lucide-react';
import { ChatMessageData } from '../types/chat';
import SafetyBanner from './SafetyBanner';

interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAi = message.sender === 'ai';

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAi ? 'bg-primary-600 text-white mr-3' : 'bg-charcoal-200 text-charcoal-600 ml-3'
        }`}>
          {isAi ? <Activity size={16} /> : <User size={16} />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          {isAi && message.safetyLevel && (
             <SafetyBanner level={message.safetyLevel} />
          )}
          
          <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
            isAi 
              ? message.isError 
                ? 'bg-red-50 text-red-900 border border-red-100' 
                : 'bg-white border border-charcoal-200 text-charcoal-800'
              : 'bg-charcoal-900 text-white'
          } ${isAi ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}>
            {message.text}
          </div>

          {/* Sources (if AI and exists) */}
          {isAi && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-charcoal-500 mr-1 mt-1">Sources:</span>
              {message.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex text-xs px-2 py-1 rounded bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  {source.title}
                </a>
              ))}
            </div>
          )}
          
          <span className={`text-[10px] text-charcoal-400 mt-1 ${isAi ? 'text-left ml-1' : 'text-right mr-1'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
