
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, Bell, Shield, Database, Layout, Globe } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

export const Settings = () => {
  const { menuDesign, setMenuDesign, language, setLanguage } = useSettings();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
        <p className="text-gray-400">{t('settings.configure')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="mr-2 text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-white">{t('settings.general')}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                defaultValue="Hexa POS Restaurant"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                defaultValue="123 Main Street, City, State 12345"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                defaultValue="+1 (555) 123-4567"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="info@hexapos.com"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
        </Card>

        {/* User Profile */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <User className="mr-2 text-green-400" size={20} />
            <h3 className="text-lg font-semibold text-white">User Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Full Name</Label>
              <Input
                id="userName"
                defaultValue="Admin User"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                defaultValue="admin@hexapos.com"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Bell className="mr-2 text-yellow-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderAlerts">Order Alerts</Label>
                <p className="text-sm text-gray-400">Get notified when new orders arrive</p>
              </div>
              <Switch id="orderAlerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lowStock">Low Stock Alerts</Label>
                <p className="text-sm text-gray-400">Alert when inventory is running low</p>
              </div>
              <Switch id="lowStock" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailyReports">Daily Reports</Label>
                <p className="text-sm text-gray-400">Receive daily sales reports via email</p>
              </div>
              <Switch id="dailyReports" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance">Maintenance Reminders</Label>
                <p className="text-sm text-gray-400">Reminders for system maintenance</p>
              </div>
              <Switch id="maintenance" defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Shield className="mr-2 text-red-400" size={20} />
            <h3 className="text-lg font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
              <Switch id="twoFactor" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">Auto Session Timeout</Label>
                <p className="text-sm text-gray-400">Automatically log out after inactivity</p>
              </div>
              <Switch id="sessionTimeout" defaultChecked />
            </div>
            <div>
              <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
              <Input
                id="sessionDuration"
                type="number"
                defaultValue="30"
                className="bg-gray-700 border-gray-600"
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
              <Select value={menuDesign} onValueChange={setMenuDesign}>
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
              <Select value={language} onValueChange={setLanguage}>
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
            <h3 className="text-lg font-semibold text-white">System Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="CST">Central Time (CST)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  defaultValue="8.25"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-gray-400">Daily automatic data backups</p>
                </div>
                <Switch id="autoBackup" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analyticsTracking">Analytics Tracking</Label>
                  <p className="text-sm text-gray-400">Track system usage and performance</p>
                </div>
                <Switch id="analyticsTracking" defaultChecked />
              </div>
              <div>
                <Label htmlFor="receiptFooter">Receipt Footer Text</Label>
                <Textarea
                  id="receiptFooter"
                  defaultValue="Thank you for dining with us!"
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-green-600 hover:bg-green-700 px-8">
          {t('settings.saveAll')}
        </Button>
      </div>
    </div>
  );
};
