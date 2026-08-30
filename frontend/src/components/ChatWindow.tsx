import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Activity, ShieldAlert, RotateCcw, X, ImagePlus } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { sendChatMessage } from '../services/chatService';
import { analyzeImage } from '../services/imageService';
import { ChatMessageData } from '../types/chat';
import { SPEECH_LOCALE } from '../data/languages';

interface ChatWindowProps {
  language?: string;
}

export default function ChatWindow({ language = 'en' }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceTriggeredRef = useRef(false);

  // Image analysis modal state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What are common signs of dehydration?",
    "How can I maintain a healthy lifestyle?",
    "Tell me about vaccination awareness.",
    "How can I find a healthcare centre?"
  ];

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up object URL when modal closes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Stop any ongoing speech synthesis when language changes
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [language]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text.trim();

    const locale = SPEECH_LOCALE[language] || 'en-IN';

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = locale;
      utterance.rate = 0.95;

      // Try to find an exact voice for the locale, fall back to language prefix
      const match =
        voices.find(v => v.lang === locale) ||
        voices.find(v => v.lang.startsWith(language));
      if (match) utterance.voice = match;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // getVoices() may return an empty list on first call (async load).
    // If so, wait for the voiceschanged event then speak.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        const loaded = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak(loaded);
      };
    }
  }, [language]);

  const handleStopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const handleSendMessage = async (text: string, fromVoice = false) => {
    voiceTriggeredRef.current = fromVoice;
    const userMessage: ChatMessageData = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        language,
      });

      const aiMessage: ChatMessageData = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.message,
        timestamp: new Date(),
        safetyLevel: response.safetyLevel,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (voiceTriggeredRef.current) speakText(response.message);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Something went wrong. Please try again in a moment.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Called when user picks a file from ChatInput
  const handleImageUpload = (file: File) => {
    setPendingImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelImage = () => {
    setPendingImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
  };

  const handleAnalyseImage = async () => {
    if (!pendingImage) return;

    // Add a user "message" showing the image name
    const userMsg: ChatMessageData = {
      id: Date.now().toString(),
      sender: 'user',
      text: `📷 Analysing medicine image: ${pendingImage.name}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Close modal
    handleCancelImage();
    setIsAnalyzing(true);

    try {
      const result = await analyzeImage(pendingImage ?? new File([], ''), language);
      const aiMsg: ChatMessageData = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: result.answer,
        timestamp: new Date(),
        safetyLevel: 'caution',
        sources: [{ title: 'Medicine Image Analysis', url: '#' }],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Could not analyse the image. Please try again or upload a clearer photo.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-charcoal-100 flex items-center justify-between bg-charcoal-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-charcoal-900 tracking-tight">CareBridge Assistant</h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] sm:text-xs text-charcoal-500 font-medium">AI assistant online</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-charcoal-400 hover:text-charcoal-800 hover:bg-charcoal-100 rounded-lg transition-colors"
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 sm:px-6 bg-blue-50 border-b border-blue-100 flex items-center justify-center text-[11px] text-blue-800 text-center font-medium">
        <ShieldAlert size={12} className="mr-1.5 flex-shrink-0" />
        CareBridge provides health awareness information and is not a doctor or emergency service.
      </div>

      {/* Message Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-[#FAFAFA]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 shadow-sm border border-primary-100">
              <Activity size={32} />
            </div>
            <h3 className="text-2xl font-bold text-charcoal-900 mb-2">How can I help?</h3>
            <p className="text-charcoal-500 mb-2">Ask a healthcare awareness question in your language.</p>
            <p className="text-xs text-charcoal-400 mb-8 flex items-center gap-1">
              <ImagePlus size={13} />
              Or tap the image icon below to scan a medicine.
            </p>

            <div className="w-full space-y-3">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-3.5 rounded-xl border border-charcoal-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all text-sm text-charcoal-700 shadow-sm flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <div className="w-6 h-6 rounded-full bg-charcoal-50 flex items-center justify-center group-hover:bg-primary-100">
                    <svg className="w-3 h-3 text-charcoal-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {(isLoading || isAnalyzing) && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        onImageUpload={handleImageUpload}
        disabled={isLoading || isAnalyzing}
        language={language}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
      />

      {/* Image Preview Modal */}
      {imagePreviewUrl && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-charcoal-900/50 backdrop-blur-sm rounded-2xl p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center space-x-2 text-charcoal-900 font-semibold">
                <ImagePlus size={18} className="text-primary-600" />
                <span>Analyse Medicine Image</span>
              </div>
              <button
                onClick={handleCancelImage}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                aria-label="Cancel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image preview */}
            <div className="p-5">
              <img
                src={imagePreviewUrl}
                alt="Medicine preview"
                className="w-full max-h-56 object-contain rounded-xl border border-charcoal-100 bg-charcoal-50"
              />
              <p className="mt-3 text-xs text-charcoal-500 text-center">
                CareBridge will identify the medicine and provide awareness information.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={handleCancelImage}
                className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 font-medium hover:bg-charcoal-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAnalyseImage}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors text-sm"
              >
                Analyse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
