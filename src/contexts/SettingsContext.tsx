import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useBranch } from './BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BranchSettings {
  menu_design: 'modern' | 'simple';
  language: 'en' | 'ar';
}

interface SettingsContextType {
  menuDesign: 'modern' | 'simple';
  setMenuDesign: (design: 'modern' | 'simple') => void;
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
  loading: boolean;
  saving: boolean;
  saveSettings: () => Promise<void>;
  canEditSettings: boolean;
  setCanEditSettings: (canEdit: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuDesign, setMenuDesignState] = useState<'modern' | 'simple'>('modern');
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEditSettings, setCanEditSettings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { selectedBranch } = useBranch();

  // Fetch settings when branch changes
  const fetchSettings = useCallback(async () => {
    if (!selectedBranch?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branch_settings')
        .select('menu_design, language')
        .eq('branch_id', selectedBranch.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching branch settings:', error);
        return;
      }

      if (data) {
        setMenuDesignState(data.menu_design as 'modern' | 'simple');
        setLanguageState(data.language as 'en' | 'ar');
      } else {
        // Use defaults if no settings exist
        setMenuDesignState('modern');
        setLanguageState('en');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  }, [selectedBranch?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply RTL direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setMenuDesign = (design: 'modern' | 'simple') => {
    setMenuDesignState(design);
    setHasChanges(true);
  };

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    setHasChanges(true);
  };

  // Save settings to database
  const saveSettings = useCallback(async () => {
    if (!selectedBranch?.id) {
      toast.error('No branch selected');
      return;
    }

    try {
      setSaving(true);
      
      const settingsData: BranchSettings = {
        menu_design: menuDesign,
        language: language,
      };

      const { error } = await supabase
        .from('branch_settings')
        .upsert({
          branch_id: selectedBranch.id,
          ...settingsData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'branch_id'
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [selectedBranch?.id, menuDesign, language]);

  return (
    <SettingsContext.Provider value={{
      menuDesign,
      setMenuDesign,
      language,
      setLanguage,
      loading,
      saving,
      saveSettings,
      canEditSettings,
      setCanEditSettings,
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
