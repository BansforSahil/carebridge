import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, ImagePlus, VolumeX } from 'lucide-react';
import { SPEECH_LOCALE } from '../data/languages';

interface ChatInputProps {
  onSend: (message: string, fromVoice?: boolean) => void;
  onImageUpload: (file: File) => void;
  disabled?: boolean;
  language?: string;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

// Grab the correct SpeechRecognition constructor (vendor-prefixed in some browsers)
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function ChatInput({
  onSend,
  onImageUpload,
  disabled,
  language = 'en',
  isSpeaking = false,
  onStopSpeaking,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stop recognition if the parent disables input mid-listen
  useEffect(() => {
    if (disabled && isListening) {
      recognitionRef.current?.stop();
    }
  }, [disabled, isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setVoiceError(null);

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.lang = SPEECH_LOCALE[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send after a short tick so state has updated
      setTimeout(() => {
        onSend(transcript.trim(), true);
        setInput('');
      }, 100);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Allow mic access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected. Please try again.');
      } else if (event.error !== 'aborted') {
        setVoiceError(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [language, onSend]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-charcoal-100 bg-white">
      {/* Voice error notice */}
      {voiceError && (
        <div className="px-4 pt-2 pb-0 text-xs text-red-600 flex items-center justify-between">
          <span>{voiceError}</span>
          <button
            onClick={() => setVoiceError(null)}
            className="ml-2 text-red-400 hover:text-red-600 font-bold"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 flex items-end space-x-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 h-[52px] w-[52px] rounded-xl border border-charcoal-200 bg-white text-charcoal-500 flex items-center justify-center hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Analyse medicine image"
          title="Upload a medicine image for analysis"
        >
          <ImagePlus size={20} />
        </button>

        {/* Text area */}
        <div className="flex-grow relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              isListening
                ? language === 'hi'
                  ? 'सुन रहा हूँ...'
                  : 'Listening...'
                : language === 'hi'
                ? 'स्वास्थ्य संबंधी प्रश्न पूछें...'
                : 'Ask a healthcare question...'
            }
            className={`w-full bg-charcoal-50 border text-charcoal-900 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none h-[52px] max-h-[120px] transition-colors ${
              isListening
                ? 'border-red-400 bg-red-50'
                : 'border-charcoal-200'
            }`}
            rows={1}
            disabled={disabled}
          />

          {/* Mic toggle — inside textarea right side */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
              isListening
                ? 'text-red-500 animate-pulse hover:text-red-700'
                : 'text-charcoal-400 hover:text-primary-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            title={isListening ? 'Stop listening' : `Voice input (${language === 'hi' ? 'हिन्दी' : 'English'})`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>

        {/* Stop Speaking button — shown only when AI is reading aloud */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="flex-shrink-0 h-[52px] px-4 rounded-xl bg-amber-500 text-white flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors text-sm font-medium"
            aria-label="Stop speaking"
            title="Stop AI voice"
          >
            <VolumeX size={18} />
            <span className="hidden sm:inline">Stop</span>
          </button>
        )}

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex-shrink-0 h-[52px] w-[52px] rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={20} className="ml-1" />
        </button>
      </form>
    </div>
  );
}
