export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

// Maps our language code → BCP-47 tag used by Web Speech API
export const SPEECH_LOCALE: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
};

export const DEFAULT_LANGUAGE = 'en';
