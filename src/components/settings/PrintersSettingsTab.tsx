import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Trash2, Settings2 } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBusinessFeatures } from "@/hooks/useBusinessFeatures";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface PrinterConfig {
  id: string;
  name: string;
  type: 'thermal' | 'dot_matrix' | 'laser' | 'inkjet';
  connection_type: 'usb' | 'network' | 'bluetooth';
  ip_address?: string;
  port?: number;
  use_for_receipts: boolean;
  use_for_kitchen: boolean;
  use_for_reports: boolean;
  use_for_call_center: boolean;
  is_default: boolean;
}

interface PrintersSettingsTabProps {
  printers: PrinterConfig[];
  onChange: (printers: PrinterConfig[]) => void;
  canEdit: boolean;
}

export const PrintersSettingsTab = ({ printers = [], onChange, canEdit }: PrintersSettingsTabProps) => {
  const { t } = useTranslation();
  const { hasFeatureAccess } = useBusinessFeatures();
  const hasCallCenterFeature = hasFeatureAccess('call-center');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [formData, setFormData] = useState<Partial<PrinterConfig>>({
    name: '',
    type: 'thermal',
    connection_type: 'network',
    ip_address: '',
    port: 9100,
    use_for_receipts: true,
    use_for_kitchen: false,
    use_for_reports: false,
    use_for_call_center: false,
    is_default: false,
  });

  const handleAddPrinter = () => {
    const newPrinter: PrinterConfig = {
      id: crypto.randomUUID(),
      name: formData.name || 'New Printer',
      type: formData.type || 'thermal',
      connection_type: formData.connection_type || 'network',
      ip_address: formData.ip_address,
      port: formData.port,
      use_for_receipts: formData.use_for_receipts ?? true,
      use_for_kitchen: formData.use_for_kitchen ?? false,
      use_for_reports: formData.use_for_reports ?? false,
      use_for_call_center: formData.use_for_call_center ?? false,
      is_default: printers.length === 0 ? true : (formData.is_default ?? false),
    };

    // If this is set as default, unset other defaults
    let updatedPrinters = [...printers];
    if (newPrinter.is_default) {
      updatedPrinters = updatedPrinters.map(p => ({ ...p, is_default: false }));
    }

    onChange([...updatedPrinters, newPrinter]);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdatePrinter = () => {
    if (!editingPrinter) return;

    let updatedPrinters = printers.map(p => {
      if (p.id === editingPrinter.id) {
        return { ...p, ...formData };
      }
      // If the edited printer is set as default, unset others
      if (formData.is_default && p.id !== editingPrinter.id) {
        return { ...p, is_default: false };
      }
      return p;
    });

    onChange(updatedPrinters);
    resetForm();
    setIsDialogOpen(false);
    setEditingPrinter(null);
  };

  const handleDeletePrinter = (id: string) => {
    const updatedPrinters = printers.filter(p => p.id !== id);
    // If we deleted the default printer, make the first one default
    if (updatedPrinters.length > 0 && !updatedPrinters.some(p => p.is_default)) {
      updatedPrinters[0].is_default = true;
    }
    onChange(updatedPrinters);
  };

  const handleEditPrinter = (printer: PrinterConfig) => {
    setEditingPrinter(printer);
    setFormData(printer);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'thermal',
      connection_type: 'network',
      ip_address: '',
      port: 9100,
      use_for_receipts: true,
      use_for_kitchen: false,
      use_for_reports: false,
      use_for_call_center: false,
      is_default: false,
    });
    setEditingPrinter(null);
  };

  const getPrinterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      thermal: 'Thermal',
      dot_matrix: 'Dot Matrix',
      laser: 'Laser',
      inkjet: 'Inkjet',
    };
    return types[type] || type;
  };

  const getConnectionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      usb: 'USB',
      network: 'Network',
      bluetooth: 'Bluetooth',
    };
    return types[type] || type;
  };

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Printer className="mr-2 text-primary" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Printers Settings</h3>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                Add Printer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPrinter ? 'Edit Printer' : 'Add New Printer'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="printerName">Printer Name</Label>
                  <Input
                    id="printerName"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted border-border"
                    placeholder="e.g., Kitchen Printer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Printer Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: PrinterConfig['type']) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="thermal">Thermal</SelectItem>
                        <SelectItem value="dot_matrix">Dot Matrix</SelectItem>
                        <SelectItem value="laser">Laser</SelectItem>
                        <SelectItem value="inkjet">Inkjet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Connection Type</Label>
                    <Select 
                      value={formData.connection_type} 
                      onValueChange={(value: PrinterConfig['connection_type']) => setFormData({ ...formData, connection_type: value })}
                    >
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="usb">USB</SelectItem>
                        <SelectItem value="bluetooth">Bluetooth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.connection_type === 'network' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ipAddress">IP Address</Label>
                      <Input
                        id="ipAddress"
                        value={formData.ip_address || ''}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        className="bg-muted border-border"
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        type="number"
                        value={formData.port || 9100}
                        onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <Label>Usage in Order Flow</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Use for Receipts</span>
                    <Switch 
                      checked={formData.use_for_receipts}
                      onCheckedChange={(checked) => setFormData({ ...formData, use_for_receipts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Use for Kitchen Orders</span>
                    <Switch 
                      checked={formData.use_for_kitchen}
                      onCheckedChange={(checked) => setFormData({ ...formData, use_for_kitchen: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Use for Reports</span>
                    <Switch 
                      checked={formData.use_for_reports}
                      onCheckedChange={(checked) => setFormData({ ...formData, use_for_reports: checked })}
                    />
                  </div>
                  {hasCallCenterFeature && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Use for Call Center Orders</span>
                      <Switch 
                        checked={formData.use_for_call_center}
                        onCheckedChange={(checked) => setFormData({ ...formData, use_for_call_center: checked })}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Set as Default Printer</span>
                    <Switch 
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                    />
                  </div>
                </div>
                <Button 
                  onClick={editingPrinter ? handleUpdatePrinter : handleAddPrinter} 
                  className="w-full"
                >
                  {editingPrinter ? 'Update Printer' : 'Add Printer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {printers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Printer className="mx-auto mb-4 opacity-50" size={48} />
          <p>No printers configured</p>
          <p className="text-sm">Add a printer to enable printing in the order flow</p>
        </div>
      ) : (
        <div className="space-y-4">
          {printers.map((printer) => (
            <div 
              key={printer.id} 
              className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Printer className="text-primary" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{printer.name}</h4>
                    {printer.is_default && (
                      <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getPrinterTypeLabel(printer.type)} • {getConnectionTypeLabel(printer.connection_type)}
                    {printer.connection_type === 'network' && printer.ip_address && ` • ${printer.ip_address}:${printer.port}`}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {printer.use_for_receipts && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Receipts</span>
                    )}
                    {printer.use_for_kitchen && (
                      <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">Kitchen</span>
                    )}
                    {printer.use_for_reports && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Reports</span>
                    )}
                    {printer.use_for_call_center && (
                      <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">Call Center</span>
                    )}
                  </div>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditPrinter(printer)}
                  >
                    <Settings2 size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeletePrinter(printer.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
