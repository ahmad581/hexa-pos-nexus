import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  menuDesign: 'modern' | 'simple';
  setMenuDesign: (design: 'modern' | 'simple') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuDesign, setMenuDesign] = useState<'modern' | 'simple'>('modern');

  return (
    <SettingsContext.Provider value={{
      menuDesign,
      setMenuDesign
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