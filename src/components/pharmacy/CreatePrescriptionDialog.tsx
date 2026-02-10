import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrescriptions, CreatePrescriptionInput, PrescriptionType } from "@/hooks/usePrescriptions";
import { usePharmacyPatients, PharmacyPatient } from "@/hooks/usePharmacyPatients";
import { PatientSearchAutocomplete } from "./PatientSearchAutocomplete";

export type ReceiptMethod = "walk_in" | "e_prescribe" | "fax" | "phone";

interface CreatePrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePrescriptionDialog = ({ open, onOpenChange }: CreatePrescriptionDialogProps) => {
  const { createPrescription } = usePrescriptions();
  const [selectedPatient, setSelectedPatient] = useState<PharmacyPatient | null>(null);
  const [receiptMethod, setReceiptMethod] = useState<ReceiptMethod>("walk_in");
  const [formData, setFormData] = useState<CreatePrescriptionInput>({
    patient_name: "",
    patient_phone: "",
    doctor_name: "",
    medication_name: "",
    dosage: "",
    quantity: 1,
    instructions: "",
    prescription_type: "new",
    refills_total: 0,
    is_controlled_substance: false,
    schedule: "",
    copay_amount: 0,
  });

  const handlePatientSelect = (patient: PharmacyPatient | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        patient_phone: patient.phone,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient_id: undefined,
        patient_name: "",
        patient_phone: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createPrescription.mutateAsync({
      ...formData,
      patient_id: selectedPatient?.id,
    });

    // Reset form
    setSelectedPatient(null);
    setReceiptMethod("walk_in");
    setFormData({
      patient_name: "",
      patient_phone: "",
      doctor_name: "",
      medication_name: "",
      dosage: "",
      quantity: 1,
      instructions: "",
      prescription_type: "new",
      refills_total: 0,
      is_controlled_substance: false,
      schedule: "",
      copay_amount: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Prescription</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receipt Method */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Receipt Method</h3>
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: "walk_in" as const, label: "Walk-in" },
                { value: "e_prescribe" as const, label: "E-Prescribe" },
                { value: "fax" as const, label: "Fax" },
                { value: "phone" as const, label: "Phone" },
              ]).map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={receiptMethod === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReceiptMethod(value)}
                  className="w-full"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Patient Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Patient Information</h3>
            
            <div className="space-y-2">
              <Label>Search Patient</Label>
              <PatientSearchAutocomplete
                onSelect={handlePatientSelect}
                selectedPatient={selectedPatient}
              />
            </div>

            {!selectedPatient && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient_phone">Patient Phone</Label>
                  <Input
                    id="patient_phone"
                    value={formData.patient_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_phone: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prescriber Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Prescriber Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Prescriber Name *</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  placeholder="Dr. ..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_license">License / DEA #</Label>
                <Input
                  id="doctor_license"
                  placeholder="DEA or license number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor_clinic">Clinic / Facility</Label>
              <Input
                id="doctor_clinic"
                placeholder="Clinic name and phone"
              />
            </div>
          </div>

          {/* Medication Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Medication Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medication_name">Medication Name *</Label>
                <Input
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage/Strength</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refills_total">Refills Allowed</Label>
                <Input
                  id="refills_total"
                  type="number"
                  min={0}
                  value={formData.refills_total}
                  onChange={(e) => setFormData(prev => ({ ...prev, refills_total: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescription_type">Type</Label>
                <Select
                  value={formData.prescription_type}
                  onValueChange={(value: PrescriptionType) => setFormData(prev => ({ ...prev, prescription_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refill">Refill</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                    <SelectItem value="controlled">Controlled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Take one tablet by mouth twice daily with food"
              />
            </div>
          </div>

          {/* Controlled Substance Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_controlled"
                checked={formData.is_controlled_substance}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  is_controlled_substance: !!checked,
                  prescription_type: checked ? "controlled" : prev.prescription_type
                }))}
              />
              <Label htmlFor="is_controlled">Controlled Substance</Label>
            </div>

            {formData.is_controlled_substance && (
              <div className="space-y-2">
                <Label htmlFor="schedule">DEA Schedule</Label>
                <Select
                  value={formData.schedule || ""}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, schedule: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="II">Schedule II</SelectItem>
                    <SelectItem value="III">Schedule III</SelectItem>
                    <SelectItem value="IV">Schedule IV</SelectItem>
                    <SelectItem value="V">Schedule V</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Billing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Billing</h3>
            <div className="space-y-2">
              <Label htmlFor="copay_amount">Copay Amount ($)</Label>
              <Input
                id="copay_amount"
                type="number"
                min={0}
                step={0.01}
                value={formData.copay_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, copay_amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPrescription.isPending}>
              {createPrescription.isPending ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
