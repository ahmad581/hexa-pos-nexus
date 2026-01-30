import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Layout, Database, Printer, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useRole } from "@/hooks/useRole";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { InterfaceSettingsTab } from "@/components/settings/InterfaceSettingsTab";
import { SystemSettingsTab } from "@/components/settings/SystemSettingsTab";
import { PrintersSettingsTab } from "@/components/settings/PrintersSettingsTab";

export const Settings = () => {
  const { 
    settings,
    updateSetting,
    loading, 
    saving, 
    saveSettings,
    canEditSettings,
    setCanEditSettings 
  } = useSettings();
  const { t } = useTranslation();
  const { selectedBranch } = useBranch();
  const { checkMultipleRoles, isSystemMaster } = useRole();

  // Check if user can edit settings (Manager and above)
  useEffect(() => {
    const checkPermission = () => {
      const canEdit = isSystemMaster() || checkMultipleRoles(['SystemMaster', 'SuperManager', 'Manager']);
      setCanEditSettings(canEdit);
    };
    checkPermission();
  }, [checkMultipleRoles, isSystemMaster, setCanEditSettings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          {t('settings.configure')}
          {selectedBranch && (
            <span className="ml-2 text-primary">({selectedBranch.name})</span>
          )}
        </p>
        {!canEditSettings && (
          <p className="text-yellow-500 text-sm mt-2">
            {t('settings.viewOnly') || 'You are viewing settings in read-only mode. Only managers can modify settings.'}
          </p>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon size={16} />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Layout size={16} />
            <span className="hidden sm:inline">Interface</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database size={16} />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="printers" className="flex items-center gap-2">
            <Printer size={16} />
            <span className="hidden sm:inline">Printers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettingsTab
            settings={{
              business_name: settings.business_name,
              address: settings.address,
              phone: settings.phone,
              email: settings.email,
            }}
            onChange={(field, value) => updateSetting(field as keyof typeof settings, value)}
            canEdit={canEditSettings}
          />
        </TabsContent>

        <TabsContent value="interface" className="mt-6">
          <InterfaceSettingsTab
            settings={{
              menu_design: settings.menu_design,
              language: settings.language,
            }}
            onChange={(field, value) => updateSetting(field as keyof typeof settings, value as any)}
            canEdit={canEditSettings}
          />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettingsTab
            settings={{
              currency: settings.currency,
              timezone: settings.timezone,
              tax_rate: settings.tax_rate,
              auto_backup: settings.auto_backup,
              receipt_footer: settings.receipt_footer,
            }}
            onChange={(field, value) => updateSetting(field as keyof typeof settings, value as any)}
            canEdit={canEditSettings}
          />
        </TabsContent>

        <TabsContent value="printers" className="mt-6">
          <PrintersSettingsTab
            printers={settings.printers}
            onChange={(printers) => updateSetting('printers', printers)}
            canEdit={canEditSettings}
          />
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      {canEditSettings && (
        <div className="flex justify-end">
          <Button 
            className="px-8"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              t('settings.saveAll')
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
