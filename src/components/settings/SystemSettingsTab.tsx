import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface SystemSettingsTabProps {
  settings: {
    currency: string;
    timezone: string;
    tax_rate: number;
    auto_backup: boolean;
    receipt_footer: string;
  };
  onChange: (field: string, value: string | number | boolean) => void;
  canEdit: boolean;
}

export const SystemSettingsTab = ({ settings, onChange, canEdit }: SystemSettingsTabProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center mb-6">
        <Database className="mr-2 text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">{t('settingsCard.system')}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="currency">{t('settingsCard.currency')}</Label>
            <Select 
              value={settings.currency || 'USD'} 
              onValueChange={(value) => onChange('currency', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="SAR">SAR (﷼)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
                <SelectItem value="JOD">JOD (د.أ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">{t('settingsCard.timezone')}</Label>
            <Select 
              value={settings.timezone || 'EST'} 
              onValueChange={(value) => onChange('timezone', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                <SelectItem value="CST">Central Time (CST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="AST">Arabia Standard Time (AST)</SelectItem>
                <SelectItem value="GST">Gulf Standard Time (GST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="taxRate">{t('settingsCard.taxRate')}</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={settings.tax_rate || 0}
              onChange={(e) => onChange('tax_rate', parseFloat(e.target.value) || 0)}
              className="bg-muted border-border"
              disabled={!canEdit}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="receiptFooter">{t('settingsCard.receiptFooter')}</Label>
            <Textarea
              id="receiptFooter"
              value={settings.receipt_footer || ''}
              onChange={(e) => onChange('receipt_footer', e.target.value)}
              className="bg-muted border-border"
              disabled={!canEdit}
              placeholder="Thank you for your visit!"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
