import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, CreditCard, Loader2, DollarSign, Check } from "lucide-react";
import { useGymMembershipPlans, MembershipPlan } from "@/hooks/useGymMembershipPlans";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";

const DURATION_TYPES = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'annual', label: 'Annual', days: 365 },
];

const ACCESS_LEVELS = [
  { value: 'basic', label: 'Basic', desc: 'Gym floor only' },
  { value: 'premium', label: 'Premium', desc: 'Gym + Classes' },
  { value: 'vip', label: 'VIP', desc: 'All access + PT' },
  { value: 'class-only', label: 'Class Only', desc: 'Classes only' },
  { value: 'off-peak', label: 'Off-Peak', desc: 'Limited hours' },
];

const emptyPlan = {
  name: '',
  description: '',
  duration_type: 'monthly',
  duration_days: 30,
  price: 0,
  signup_fee: 0,
  access_level: 'basic',
  includes_classes: false,
  includes_personal_training: false,
  guest_passes_per_month: 0,
  freeze_allowed: true,
  max_freeze_days: 30,
  is_active: true,
  sort_order: 0,
};

export const MembershipPlans = () => {
  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useGymMembershipPlans();
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState(emptyPlan);

  // Inline editing state
  const [editingField, setEditingField] = useState<{ planId: string; field: string } | null>(null);
  const [inlineValue, setInlineValue] = useState("");

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyPlan);
    setDialogOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      duration_type: plan.duration_type,
      duration_days: plan.duration_days,
      price: plan.price,
      signup_fee: plan.signup_fee,
      access_level: plan.access_level,
      includes_classes: plan.includes_classes,
      includes_personal_training: plan.includes_personal_training,
      guest_passes_per_month: plan.guest_passes_per_month,
      freeze_allowed: plan.freeze_allowed,
      max_freeze_days: plan.max_freeze_days,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = {
      ...form,
      branch_id: selectedBranch!.id,
      business_id: userProfile?.business_id || null,
    };
    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPlan.mutate(payload as any, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const startInlineEdit = (planId: string, field: string, currentValue: number) => {
    setEditingField({ planId, field });
    setInlineValue(String(currentValue));
  };

  const saveInlineEdit = () => {
    if (!editingField) return;
    const numVal = parseFloat(inlineValue);
    if (isNaN(numVal) || numVal < 0) return;
    updatePlan.mutate({ id: editingField.planId, [editingField.field]: numVal });
    setEditingField(null);
  };

  const handleDurationChange = (val: string) => {
    const dur = DURATION_TYPES.find(d => d.value === val);
    setForm(f => ({ ...f, duration_type: val, duration_days: dur?.days || 30 }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Membership Plans</h1>
          <p className="text-muted-foreground">Manage pricing and membership options</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Plan Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Monthly" />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's included..." rows={2} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Select value={form.duration_type} onValueChange={handleDurationChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATION_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <Select value={form.access_level} onValueChange={v => setForm(f => ({ ...f, access_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price</Label>
                  <Input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Signup Fee</Label>
                  <Input type="number" min={0} step={0.01} value={form.signup_fee} onChange={e => setForm(f => ({ ...f, signup_fee: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Guest Passes / Month</Label>
                  <Input type="number" min={0} value={form.guest_passes_per_month} onChange={e => setForm(f => ({ ...f, guest_passes_per_month: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <Label>Max Freeze Days</Label>
                  <Input type="number" min={0} value={form.max_freeze_days} onChange={e => setForm(f => ({ ...f, max_freeze_days: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Includes Classes</Label>
                  <Switch checked={form.includes_classes} onCheckedChange={v => setForm(f => ({ ...f, includes_classes: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Includes Personal Training</Label>
                  <Switch checked={form.includes_personal_training} onCheckedChange={v => setForm(f => ({ ...f, includes_personal_training: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Freeze Allowed</Label>
                  <Switch checked={form.freeze_allowed} onCheckedChange={v => setForm(f => ({ ...f, freeze_allowed: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={!form.name || createPlan.isPending || updatePlan.isPending}>
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 border border-border/50 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground">No Plans Yet</h3>
          <p className="text-muted-foreground mt-1">Create your first membership plan with custom pricing</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <Card key={plan.id} className={`border border-border/50 overflow-hidden ${!plan.is_active ? 'opacity-60' : ''}`}>
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs capitalize">{plan.access_level}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plan)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePlan.mutate(plan.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Editable Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    {editingField?.planId === plan.id && editingField.field === 'price' ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-28 h-8 text-lg font-bold"
                          value={inlineValue}
                          onChange={e => setInlineValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveInlineEdit()}
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveInlineEdit}>
                          <Check className="w-4 h-4 text-emerald-500" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="text-3xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1 group"
                        onClick={() => startInlineEdit(plan.id, 'price', plan.price)}
                        title="Click to edit price"
                      >
                        {formatCurrency(plan.price)}
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </button>
                    )}
                    <span className="text-muted-foreground text-sm">/ {plan.duration_type}</span>
                  </div>

                  {plan.signup_fee > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">Signup fee:</span>
                      {editingField?.planId === plan.id && editingField.field === 'signup_fee' ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="w-20 h-6 text-sm"
                            value={inlineValue}
                            onChange={e => setInlineValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveInlineEdit}>
                            <Check className="w-3 h-3 text-emerald-500" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="font-medium text-foreground hover:text-primary cursor-pointer"
                          onClick={() => startInlineEdit(plan.id, 'signup_fee', plan.signup_fee)}
                        >
                          {formatCurrency(plan.signup_fee)}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}

                {/* Features */}
                <div className="space-y-1.5 text-sm">
                  {plan.includes_classes && (
                    <div className="flex items-center gap-2 text-foreground"><Check className="w-3.5 h-3.5 text-emerald-500" />Group Classes</div>
                  )}
                  {plan.includes_personal_training && (
                    <div className="flex items-center gap-2 text-foreground"><Check className="w-3.5 h-3.5 text-emerald-500" />Personal Training</div>
                  )}
                  {plan.guest_passes_per_month > 0 && (
                    <div className="flex items-center gap-2 text-foreground"><Check className="w-3.5 h-3.5 text-emerald-500" />{plan.guest_passes_per_month} Guest Passes/mo</div>
                  )}
                  {plan.freeze_allowed && (
                    <div className="flex items-center gap-2 text-foreground"><Check className="w-3.5 h-3.5 text-emerald-500" />Freeze up to {plan.max_freeze_days} days</div>
                  )}
                </div>

                {!plan.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
