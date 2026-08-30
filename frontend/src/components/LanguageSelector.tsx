import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, Language } from '../data/languages';

interface LanguageSelectorProps {
  selectedLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ selectedLang, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-charcoal-700 hover:text-primary-600 transition-colors px-3 py-2 rounded-md hover:bg-charcoal-50"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={18} />
        <span className="text-sm font-medium hidden sm:inline-block">{selectedLang.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-charcoal-200 rounded-lg shadow-lg py-1 z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-50 transition-colors ${
                selectedLang.code === lang.code
                  ? 'text-primary-600 font-semibold bg-primary-50'
                  : 'text-charcoal-700'
              }`}
              onClick={() => {
                onLanguageChange(lang);
                setIsOpen(false);
              }}
            >
              <div className="flex justify-between items-center">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-charcoal-400">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
