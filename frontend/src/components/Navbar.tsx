import React, { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { SUPPORTED_LANGUAGES, Language } from '../data/languages';

interface NavbarProps {
  activeTab: 'home' | 'topics' | 'resources';
  setActiveTab: (tab: 'home' | 'topics' | 'resources') => void;
  language: string;
  setLanguage: (code: string) => void;
}

export default function Navbar({ activeTab, setActiveTab, language, setLanguage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang.code);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'topics', label: 'Health Topics' },
    { id: 'resources', label: 'Find Resources' },
  ] as const;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left - Logo & Brand */}
          <div className="flex items-center space-x-8">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Activity size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-charcoal-900 leading-tight">CareBridge</span>
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">AI Healthcare</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">AI Assistant Online</span>
            </div>

            <div className="h-6 w-px bg-charcoal-200"></div>

            <LanguageSelector selectedLang={selectedLang} onLanguageChange={handleLanguageChange} />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <LanguageSelector selectedLang={selectedLang} onLanguageChange={handleLanguageChange} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === item.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-4 px-3 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700">AI Assistant Online</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
