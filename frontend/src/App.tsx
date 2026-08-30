import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChatWindow from './components/ChatWindow';
import HealthTopics from './components/HealthTopics';
import ResourceFinder from './components/ResourceFinder';
import ResponsibleAI from './components/ResponsibleAI';
import QuickActions from './components/QuickActions';
import { DEFAULT_LANGUAGE } from './data/languages';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'topics' | 'resources'>('home');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-50 text-charcoal-900 font-sans selection:bg-primary-200 overflow-x-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} language={language} setLanguage={setLanguage} />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 md:space-y-24">
        {activeTab === 'home' && (
          <>
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <Hero 
                onAskCareBridge={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                onFindResources={() => setActiveTab('resources')}
              />
            </section>

            <section id="chat-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-7 flex flex-col h-[500px] md:h-[600px] border border-charcoal-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                <ChatWindow language={language} />
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center">
                <QuickActions />
              </div>
            </section>

            <section>
              <ResponsibleAI />
            </section>
          </>
        )}

        {activeTab === 'topics' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthTopics />
          </section>
        )}

        {activeTab === 'resources' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResourceFinder />
          </section>
        )}
      </main>

      <footer className="border-t border-charcoal-200 bg-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-charcoal-500">
          <p>© {new Date().getFullYear()} CareBridge. Healthcare Awareness & Access.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
