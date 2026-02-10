import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ShieldCheck, Pill, UserCheck } from "lucide-react";
import { Prescription, usePrescriptions } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
}

export const VerificationDialog = ({ open, onOpenChange, prescription }: VerificationDialogProps) => {
  const { updateStatus } = usePrescriptions();
  const { userProfile } = useAuth();

  const [checks, setChecks] = useState({
    patientIdentity: false,
    drugInteraction: false,
    allergyScreening: false,
    dosageValidation: false,
    insuranceVerified: false,
  });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patientAllergies = prescription.pharmacy_patients?.allergies || [];
  const hasAllergyWarning = patientAllergies.length > 0;

  const allChecked = Object.values(checks).every(Boolean);

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await updateStatus.mutateAsync({
        id: prescription.id,
        status: "verified",
        additionalData: {
          verified_by: userProfile?.id || userProfile?.email || "pharmacist",
          verified_at: new Date().toISOString(),
        },
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
            Pharmacist Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prescription Summary */}
          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="font-medium">Rx #{prescription.prescription_number || prescription.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">
              {prescription.medication_name} {prescription.dosage && `- ${prescription.dosage}`}
            </p>
            <p className="text-sm text-muted-foreground">Patient: {prescription.patient_name}</p>
            {prescription.doctor_name && (
              <p className="text-sm text-muted-foreground">Prescriber: Dr. {prescription.doctor_name}</p>
            )}
          </div>

          {/* Allergy Warning */}
          {hasAllergyWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Patient Allergies:</strong> {patientAllergies.join(", ")}
                <br />
                <span className="text-xs">Verify medication does not conflict with known allergies.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Controlled Substance Warning */}
          {prescription.is_controlled_substance && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Controlled Substance — Schedule {prescription.schedule || "N/A"}</strong>
                <br />
                <span className="text-xs">DEA compliance checks required. Verify prescriber DEA number.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Verification Checklist</h4>

            {([
              { key: "patientIdentity" as const, label: "Patient identity confirmed", icon: UserCheck },
              { key: "drugInteraction" as const, label: "Drug interaction check — no conflicts found", icon: Pill },
              { key: "allergyScreening" as const, label: "Allergy screening — safe to dispense", icon: ShieldCheck },
              { key: "dosageValidation" as const, label: "Dosage and quantity validated", icon: ShieldCheck },
              { key: "insuranceVerified" as const, label: "Insurance eligibility verified / cash pricing confirmed", icon: ShieldCheck },
            ]).map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer" onClick={() => toggleCheck(key)}>
                <Checkbox checked={checks[key]} onCheckedChange={() => toggleCheck(key)} />
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label className="cursor-pointer flex-1 text-sm">{label}</Label>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="verification-notes">Notes (optional)</Label>
            <Textarea
              id="verification-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or clinical notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleVerify}
            disabled={!allChecked || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Verifying..." : "Confirm Verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
