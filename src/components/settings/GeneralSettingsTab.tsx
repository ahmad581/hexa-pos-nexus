import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface GeneralSettingsTabProps {
  settings: {
    business_name: string;
    address: string;
    phone: string;
    email: string;
  };
  onChange: (field: string, value: string) => void;
  canEdit: boolean;
}

export const GeneralSettingsTab = ({ settings, onChange, canEdit }: GeneralSettingsTabProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center mb-6">
        <SettingsIcon className="mr-2 text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">{t('settingsCard.general')}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName">{t('settingsCard.restaurantName')}</Label>
            <Input
              id="businessName"
              value={settings.business_name || ''}
              onChange={(e) => onChange('business_name', e.target.value)}
              className="bg-muted border-border"
              disabled={!canEdit}
              placeholder="Enter business name"
            />
          </div>
          <div>
            <Label htmlFor="phone">{t('settingsCard.phoneNumber')}</Label>
            <Input
              id="phone"
              value={settings.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="bg-muted border-border"
              disabled={!canEdit}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">{t('settingsCard.email')}</Label>
            <Input
              id="email"
              type="email"
              value={settings.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="bg-muted border-border"
              disabled={!canEdit}
              placeholder="info@business.com"
            />
          </div>
          <div>
            <Label htmlFor="address">{t('settingsCard.address')}</Label>
            <Textarea
              id="address"
              value={settings.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              className="bg-muted border-border"
              disabled={!canEdit}
              placeholder="123 Main Street, City, State 12345"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
