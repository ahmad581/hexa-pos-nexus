import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useBranch } from './BranchContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PrinterConfig } from '@/components/settings/PrintersSettingsTab';

export interface BranchSettings {
  menu_design: 'modern' | 'simple';
  language: 'en' | 'ar';
  business_name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  tax_rate: number;
  auto_backup: boolean;
  analytics_tracking: boolean;
  receipt_footer: string;
  printers: PrinterConfig[];
}

const defaultSettings: BranchSettings = {
  menu_design: 'modern',
  language: 'en',
  business_name: '',
  address: '',
  phone: '',
  email: '',
  currency: 'USD',
  timezone: 'EST',
  tax_rate: 8.25,
  auto_backup: true,
  analytics_tracking: true,
  receipt_footer: 'Thank you for your visit!',
  printers: [],
};

interface SettingsContextType {
  settings: BranchSettings;
  updateSetting: <K extends keyof BranchSettings>(key: K, value: BranchSettings[K]) => void;
  loading: boolean;
  saving: boolean;
  saveSettings: () => Promise<void>;
  canEditSettings: boolean;
  setCanEditSettings: (canEdit: boolean) => void;
  // Legacy accessors for backward compatibility
  menuDesign: 'modern' | 'simple';
  setMenuDesign: (design: 'modern' | 'simple') => void;
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BranchSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEditSettings, setCanEditSettings] = useState(false);
  
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
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching branch settings:', error);
        return;
      }

      if (data) {
        setSettings({
          menu_design: (data.menu_design as 'modern' | 'simple') || 'modern',
          language: (data.language as 'en' | 'ar') || 'en',
          business_name: data.business_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          currency: data.currency || 'USD',
          timezone: data.timezone || 'EST',
          tax_rate: data.tax_rate ?? 8.25,
          auto_backup: data.auto_backup ?? true,
          analytics_tracking: data.analytics_tracking ?? true,
          receipt_footer: data.receipt_footer || 'Thank you for your visit!',
          printers: Array.isArray(data.printers) ? (data.printers as unknown as PrinterConfig[]) : [],
        });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Apply RTL direction when language changes
  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const updateSetting = useCallback(<K extends keyof BranchSettings>(key: K, value: BranchSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Legacy setters for backward compatibility
  const setMenuDesign = useCallback((design: 'modern' | 'simple') => {
    updateSetting('menu_design', design);
  }, [updateSetting]);

  const setLanguage = useCallback((lang: 'en' | 'ar') => {
    updateSetting('language', lang);
  }, [updateSetting]);

  // Save settings to database
  const saveSettings = useCallback(async () => {
    if (!selectedBranch?.id) {
      toast.error('No branch selected');
      return;
    }

    try {
      setSaving(true);
      
      // Check if settings exist for this branch
      const { data: existing } = await supabase
        .from('branch_settings')
        .select('id')
        .eq('branch_id', selectedBranch.id)
        .maybeSingle();

      const settingsData = {
        branch_id: selectedBranch.id,
        menu_design: settings.menu_design,
        language: settings.language,
        business_name: settings.business_name,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        currency: settings.currency,
        timezone: settings.timezone,
        tax_rate: settings.tax_rate,
        auto_backup: settings.auto_backup,
        analytics_tracking: settings.analytics_tracking,
        receipt_footer: settings.receipt_footer,
        printers: JSON.parse(JSON.stringify(settings.printers)),
        updated_at: new Date().toISOString(),
      };

      let error;
      if (existing) {
        const result = await supabase
          .from('branch_settings')
          .update(settingsData)
          .eq('branch_id', selectedBranch.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('branch_settings')
          .insert(settingsData);
        error = result.error;
      }

      if (error) {
        console.error('Error saving settings:', error);
        toast.error('Failed to save settings');
        return;
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [selectedBranch?.id, settings]);

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      loading,
      saving,
      saveSettings,
      canEditSettings,
      setCanEditSettings,
      // Legacy accessors
      menuDesign: settings.menu_design,
      setMenuDesign,
      language: settings.language,
      setLanguage,
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
