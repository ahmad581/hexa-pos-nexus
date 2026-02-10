import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package, UserCheck } from "lucide-react";
import { Prescription, usePrescriptions } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";

interface DispenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
}

export const DispenseDialog = ({ open, onOpenChange, prescription }: DispenseDialogProps) => {
  const { updateStatus } = usePrescriptions();
  const { userProfile } = useAuth();

  const isControlled = prescription.is_controlled_substance;

  const [checks, setChecks] = useState({
    patientId: false,
    drugVerified: false,
    quantityVerified: false,
    counselingProvided: false,
    ...(isControlled ? { idVerified: false, deaLogged: false } : {}),
  });
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecked = Object.values(checks).every(Boolean);
  const controlledReady = !isControlled || (idType && idNumber);

  const handleDispense = async () => {
    setIsSubmitting(true);
    try {
      await updateStatus.mutateAsync({
        id: prescription.id,
        status: "dispensed",
        additionalData: {
          dispensed_by: userProfile?.id || userProfile?.email || "pharmacist",
          dispensed_at: new Date().toISOString(),
          filled_date: new Date().toISOString().split("T")[0],
        },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheck = (key: string) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Dispense Prescription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="font-medium">Rx #{prescription.prescription_number || prescription.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">
              {prescription.medication_name} {prescription.dosage && `- ${prescription.dosage}`} • Qty: {prescription.quantity}
            </p>
            <p className="text-sm text-muted-foreground">Patient: {prescription.patient_name}</p>
          </div>

          {/* Controlled Substance ID Gate */}
          {isControlled && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Controlled Substance — Schedule {prescription.schedule || "N/A"}</strong>
                  <br />
                  Photo ID verification is required before dispensing.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Type *</Label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="state_id">State ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="military_id">Military ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number *</Label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Last 4 digits"
                  />
                </div>
              </div>
            </>
          )}

          {/* Dispensing Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dispensing Checklist</h4>

            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("patientId")}>
              <Checkbox checked={checks.patientId} onCheckedChange={() => toggleCheck("patientId")} />
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <Label className="cursor-pointer flex-1 text-sm">Patient identity confirmed</Label>
            </div>

            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("drugVerified")}>
              <Checkbox checked={checks.drugVerified} onCheckedChange={() => toggleCheck("drugVerified")} />
              <Label className="cursor-pointer flex-1 text-sm">Drug name, strength, and form verified</Label>
            </div>

            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("quantityVerified")}>
              <Checkbox checked={checks.quantityVerified} onCheckedChange={() => toggleCheck("quantityVerified")} />
              <Label className="cursor-pointer flex-1 text-sm">Quantity and expiry date verified</Label>
            </div>

            <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("counselingProvided")}>
              <Checkbox checked={checks.counselingProvided} onCheckedChange={() => toggleCheck("counselingProvided")} />
              <Label className="cursor-pointer flex-1 text-sm">Patient counseling provided</Label>
            </div>

            {isControlled && (
              <>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("idVerified")}>
                  <Checkbox checked={(checks as any).idVerified} onCheckedChange={() => toggleCheck("idVerified")} />
                  <Label className="cursor-pointer flex-1 text-sm">Photo ID verified and recorded</Label>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck("deaLogged")}>
                  <Checkbox checked={(checks as any).deaLogged} onCheckedChange={() => toggleCheck("deaLogged")} />
                  <Label className="cursor-pointer flex-1 text-sm">DEA dispensing log entry completed</Label>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleDispense}
            disabled={!allChecked || !controlledReady || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Dispensing..." : "Confirm Dispense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
