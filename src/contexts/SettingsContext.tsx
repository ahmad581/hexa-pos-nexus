import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  menuDesign: 'modern' | 'simple';
  setMenuDesign: (design: 'modern' | 'simple') => void;
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuDesign, setMenuDesign] = useState<'modern' | 'simple'>('modern');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Apply RTL direction when Arabic is selected
  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <SettingsContext.Provider value={{
      menuDesign,
      setMenuDesign,
      language,
      setLanguage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};