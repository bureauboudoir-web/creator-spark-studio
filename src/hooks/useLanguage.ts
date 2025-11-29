import { useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'it' | 'ru' | 'fr';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('bb_language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('bb_language', language);
  }, [language]);

  return { language, setLanguage };
};
