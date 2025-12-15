import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeLoans, LoanSettings } from '@/hooks/useEmployeeLoans';
import { Settings, Save } from 'lucide-react';

interface LoanSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
}

export const LoanSettingsDialog = ({ open, onOpenChange, branchId }: LoanSettingsDialogProps) => {
  const { loanSettings, saveLoanSettings } = useEmployeeLoans(branchId);
  
  const [settings, setSettings] = useState<Partial<LoanSettings>>({
    max_loan_amount: 50000,
    min_loan_amount: 1000,
    max_payment_period_months: 24,
    min_payment_period_months: 1,
    max_monthly_payment_percentage: 30,
    interest_rate_percentage: 0,
    require_approval: true,
    min_employment_months: 3,
    max_active_loans: 1,
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (loanSettings) {
      setSettings(loanSettings);
    }
  }, [loanSettings]);

  const handleSave = () => {
    saveLoanSettings.mutate({
      ...settings,
      branch_id: branchId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Loan Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Loan Amount</Label>
              <Input
                type="number"
                value={settings.min_loan_amount || ''}
                onChange={(e) => setSettings({ ...settings, min_loan_amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Loan Amount</Label>
              <Input
                type="number"
                value={settings.max_loan_amount || ''}
                onChange={(e) => setSettings({ ...settings, max_loan_amount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Payment Period (months)</Label>
              <Input
                type="number"
                value={settings.min_payment_period_months || ''}
                onChange={(e) => setSettings({ ...settings, min_payment_period_months: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Payment Period (months)</Label>
              <Input
                type="number"
                value={settings.max_payment_period_months || ''}
                onChange={(e) => setSettings({ ...settings, max_payment_period_months: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Monthly Payment (% of salary)</Label>
              <Input
                type="number"
                value={settings.max_monthly_payment_percentage || ''}
                onChange={(e) => setSettings({ ...settings, max_monthly_payment_percentage: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.interest_rate_percentage || ''}
                onChange={(e) => setSettings({ ...settings, interest_rate_percentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Employment Duration (months)</Label>
              <Input
                type="number"
                value={settings.min_employment_months || ''}
                onChange={(e) => setSettings({ ...settings, min_employment_months: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Active Loans per Employee</Label>
              <Input
                type="number"
                value={settings.max_active_loans || ''}
                onChange={(e) => setSettings({ ...settings, max_active_loans: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                Loans must be approved by a manager
              </p>
            </div>
            <Switch
              checked={settings.require_approval}
              onCheckedChange={(checked) => setSettings({ ...settings, require_approval: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Loans Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable loan applications
              </p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={settings.notes || ''}
              onChange={(e) => setSettings({ ...settings, notes: e.target.value })}
              placeholder="Additional notes about loan policy..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveLoanSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
