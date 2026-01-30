import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface InterfaceSettingsTabProps {
  settings: {
    menu_design: 'modern' | 'simple';
    language: 'en' | 'ar';
  };
  onChange: (field: string, value: string) => void;
  canEdit: boolean;
}

export const InterfaceSettingsTab = ({ settings, onChange, canEdit }: InterfaceSettingsTabProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center mb-6">
        <Layout className="mr-2 text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">{t('settings.interface')}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="menuDesign">{t('settings.menuDesign')}</Label>
            <Select 
              value={settings.menu_design} 
              onValueChange={(value) => onChange('menu_design', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select menu design" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="modern">{t('settings.modernDesign')}</SelectItem>
                <SelectItem value="simple">{t('settings.simpleDesign')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {settings.menu_design === "modern" 
                ? t('settings.modernDesc')
                : t('settings.simpleDesc')
              }
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => onChange('language', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {settings.language === "ar" 
                ? t('settings.arabicDesc')
                : t('settings.englishDesc')
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
