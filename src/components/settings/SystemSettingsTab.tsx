import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Download, Cloud, History, Loader2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useBackup } from "@/hooks/useBackup";
import { format } from "date-fns";

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
  const { selectedBranch } = useBranch();
  const { isLoading, downloadBackup, backupHistory, fetchBackupHistory, downloadFromStorage } = useBackup();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (selectedBranch?.id && showHistory) {
      fetchBackupHistory(selectedBranch.id);
    }
  }, [selectedBranch?.id, showHistory]);

  const handleManualBackup = async () => {
    if (!selectedBranch?.id) return;
    await downloadBackup({ branchId: selectedBranch.id, backupType: 'manual' });
  };

  const handleSaveToCloud = async () => {
    if (!selectedBranch?.id) return;
    await downloadBackup({ branchId: selectedBranch.id, saveToStorage: true, backupType: 'manual' });
    if (showHistory) {
      fetchBackupHistory(selectedBranch.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
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

      {/* Backup Section */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Download className="mr-2 text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Data Backup</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="autoBackup" 
                checked={settings.auto_backup ?? true}
                onCheckedChange={(checked) => onChange('auto_backup', checked)}
                disabled={!canEdit} 
              />
              <Label htmlFor="autoBackup" className="text-sm">Auto-backup enabled</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a backup of all your branch data including employees, orders, inventory, menu items, and more.
            Backups are exported in CSV format for easy viewing in spreadsheet applications.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleManualBackup} 
              disabled={isLoading || !selectedBranch?.id}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Backup
            </Button>
            
            <Button 
              onClick={handleSaveToCloud} 
              disabled={isLoading || !selectedBranch?.id}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4" />
              )}
              Save to Cloud
            </Button>

            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              {showHistory ? 'Hide History' : 'Backup History'}
            </Button>
          </div>

          {showHistory && (
            <div className="mt-4 border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 border-b border-border">
                <h4 className="font-medium text-sm">Recent Backups</h4>
              </div>
              {backupHistory.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No backups found. Create your first backup above.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(backup.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {backup.backup_type === 'automatic' ? 'Automatic' : 'Manual'} • {formatFileSize(backup.file_size || 0)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadFromStorage(backup.file_path)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
