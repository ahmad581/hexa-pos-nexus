import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Layout, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useRole } from "@/hooks/useRole";

export const Settings = () => {
  const { 
    menuDesign, 
    setMenuDesign, 
    language, 
    setLanguage, 
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
        <span className="ml-2 text-gray-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
        <p className="text-gray-400">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="mr-2 text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settingsCard.general')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurantName">{t('settingsCard.restaurantName')}</Label>
              <Input
                id="restaurantName"
                defaultValue="Hexa POS Restaurant"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="address">{t('settingsCard.address')}</Label>
              <Textarea
                id="address"
                defaultValue="123 Main Street, City, State 12345"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('settingsCard.phoneNumber')}</Label>
              <Input
                id="phone"
                defaultValue="+1 (555) 123-4567"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="email">{t('settingsCard.email')}</Label>
              <Input
                id="email"
                type="email"
                defaultValue="info@hexapos.com"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
          </div>
        </Card>

        {/* User Profile */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <User className="mr-2 text-green-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settingsCard.userProfile')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">{t('settingsCard.fullName')}</Label>
              <Input
                id="userName"
                defaultValue="Admin User"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="userEmail">{t('settingsCard.email')}</Label>
              <Input
                id="userEmail"
                type="email"
                defaultValue="admin@hexapos.com"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="currentPassword">{t('settingsCard.currentPassword')}</Label>
              <Input
                id="currentPassword"
                type="password"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">{t('settingsCard.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Bell className="mr-2 text-yellow-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settingsCard.notifications')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderAlerts">{t('settingsCard.orderAlerts')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.orderAlertsDesc')}</p>
              </div>
              <Switch id="orderAlerts" defaultChecked disabled={!canEditSettings} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStock">{t('settingsCard.lowStock')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.lowStockDesc')}</p>
              </div>
              <Switch id="lowStock" defaultChecked disabled={!canEditSettings} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailyReports">{t('settingsCard.dailyReports')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.dailyReportsDesc')}</p>
              </div>
              <Switch id="dailyReports" disabled={!canEditSettings} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance">{t('settingsCard.maintenance')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.maintenanceDesc')}</p>
              </div>
              <Switch id="maintenance" defaultChecked disabled={!canEditSettings} />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Shield className="mr-2 text-red-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settingsCard.security')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor">{t('settingsCard.twoFactor')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.twoFactorDesc')}</p>
              </div>
              <Switch id="twoFactor" disabled={!canEditSettings} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">{t('settingsCard.sessionTimeout')}</Label>
                <p className="text-sm text-gray-400">{t('settingsCard.sessionTimeoutDesc')}</p>
              </div>
              <Switch id="sessionTimeout" defaultChecked disabled={!canEditSettings} />
            </div>
            <div>
              <Label htmlFor="sessionDuration">{t('settingsCard.sessionDuration')}</Label>
              <Input
                id="sessionDuration"
                type="number"
                defaultValue="30"
                className="bg-gray-700 border-gray-600"
                disabled={!canEditSettings}
              />
            </div>
          </div>
        </Card>

        {/* Interface Settings */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Layout className="mr-2 text-orange-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settings.interface')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="menuDesign">{t('settings.menuDesign')}</Label>
              <Select 
                value={menuDesign} 
                onValueChange={(value) => setMenuDesign(value as 'modern' | 'simple')}
                disabled={!canEditSettings}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select menu design" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="modern">{t('settings.modernDesign')}</SelectItem>
                  <SelectItem value="simple">{t('settings.simpleDesign')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400 mt-1">
                {menuDesign === "modern" 
                  ? t('settings.modernDesc')
                  : t('settings.simpleDesc')
                }
              </p>
            </div>
            <div>
              <Label htmlFor="language">{t('settings.language')}</Label>
              <Select 
                value={language} 
                onValueChange={(value) => setLanguage(value as 'en' | 'ar')}
                disabled={!canEditSettings}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400 mt-1">
                {language === "ar" 
                  ? t('settings.arabicDesc')
                  : t('settings.englishDesc')
                }
              </p>
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Database className="mr-2 text-purple-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settingsCard.system')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">{t('settingsCard.currency')}</Label>
                <select
                  id="currency"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white disabled:opacity-50"
                  disabled={!canEditSettings}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">{t('settingsCard.timezone')}</Label>
                <select
                  id="timezone"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white disabled:opacity-50"
                  disabled={!canEditSettings}
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="CST">Central Time (CST)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="taxRate">{t('settingsCard.taxRate')}</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  defaultValue="8.25"
                  className="bg-gray-700 border-gray-600"
                  disabled={!canEditSettings}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">{t('settingsCard.autoBackup')}</Label>
                  <p className="text-sm text-gray-400">{t('settingsCard.autoBackupDesc')}</p>
                </div>
                <Switch id="autoBackup" defaultChecked disabled={!canEditSettings} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analyticsTracking">{t('settingsCard.analyticsTracking')}</Label>
                  <p className="text-sm text-gray-400">{t('settingsCard.analyticsTrackingDesc')}</p>
                </div>
                <Switch id="analyticsTracking" defaultChecked disabled={!canEditSettings} />
              </div>
              <div>
                <Label htmlFor="receiptFooter">{t('settingsCard.receiptFooter')}</Label>
                <Textarea
                  id="receiptFooter"
                  defaultValue="Thank you for dining with us!"
                  className="bg-gray-700 border-gray-600"
                  disabled={!canEditSettings}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      {canEditSettings && (
        <div className="flex justify-end">
          <Button 
            className="bg-green-600 hover:bg-green-700 px-8"
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
