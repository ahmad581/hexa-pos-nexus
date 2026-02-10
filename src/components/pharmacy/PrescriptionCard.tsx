import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Clock, Pill, AlertTriangle, RefreshCw, Printer, ShieldCheck, Package } from "lucide-react";
import { Prescription, PrescriptionStatus, usePrescriptions } from "@/hooks/usePrescriptions";
import { VerificationDialog } from "./VerificationDialog";
import { DispenseDialog } from "./DispenseDialog";
import { PrescriptionLabelDialog } from "./PrescriptionLabelDialog";

interface PrescriptionCardProps {
  prescription: Prescription;
}

const getStatusColor = (status: PrescriptionStatus) => {
  switch (status) {
    case "received": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "verified": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "processing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "ready": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "dispensed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getStatusLabel = (status: PrescriptionStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const PrescriptionCard = ({ prescription }: PrescriptionCardProps) => {
  const { 
    startProcessing, 
    fillPrescription, 
    cancelPrescription,
    requestRefill,
  } = usePrescriptions();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);

  const patientName = prescription.pharmacy_patients 
    ? `${prescription.pharmacy_patients.first_name} ${prescription.pharmacy_patients.last_name}`
    : prescription.patient_name;

  const hasAllergies = (prescription.pharmacy_patients?.allergies?.length || 0) > 0;

  return (
    <>
      <Card className="bg-card border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                Rx #{prescription.prescription_number || prescription.id.slice(0, 8)}
              </h3>
              {prescription.is_controlled_substance && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  C{prescription.schedule || "S"}
                </Badge>
              )}
              {hasAllergies && (
                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Allergies
                </Badge>
              )}
            </div>
            {prescription.prescription_type && prescription.prescription_type !== "new" && (
              <Badge variant="outline" className="mt-1 text-xs capitalize">
                {prescription.prescription_type}
              </Badge>
            )}
          </div>
          <Badge className={getStatusColor(prescription.status as PrescriptionStatus)}>
            {getStatusLabel(prescription.status as PrescriptionStatus)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <User size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{patientName}</span>
          </div>

          {prescription.doctor_name && (
            <div className="text-muted-foreground">
              <span className="text-sm">Dr. {prescription.doctor_name}</span>
            </div>
          )}

          <div className="flex items-center text-muted-foreground">
            <Pill size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">
              {prescription.medication_name} {prescription.dosage && `- ${prescription.dosage}`}
            </span>
          </div>

          <div className="text-muted-foreground">
            <span className="text-sm">
              Qty: {prescription.quantity} 
              {prescription.refills_total !== undefined && prescription.refills_total > 0 && (
                <span className="ml-2">
                  | Refills: {prescription.refills_remaining}/{prescription.refills_total}
                </span>
              )}
            </span>
          </div>

          {prescription.copay_amount !== undefined && prescription.copay_amount > 0 && (
            <div className="text-muted-foreground">
              <span className="text-sm">Copay: ${prescription.copay_amount.toFixed(2)}</span>
            </div>
          )}

          {prescription.verified_by && (
            <div className="text-purple-400">
              <span className="text-xs flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified{prescription.verified_at && ` on ${new Date(prescription.verified_at).toLocaleDateString()}`}
              </span>
            </div>
          )}

          <div className="flex items-center text-muted-foreground">
            <Clock size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">
              {prescription.created_at 
                ? new Date(prescription.created_at).toLocaleDateString()
                : "Today"}
            </span>
          </div>

          {prescription.dispensed_at && (
            <div className="text-green-400">
              <span className="text-sm">
                Dispensed: {new Date(prescription.dispensed_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Print label - available for any active prescription */}
          {prescription.status !== "cancelled" && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setLabelOpen(true)}
              title="Print Label"
            >
              <Printer className="h-4 w-4" />
            </Button>
          )}

          {prescription.status === "received" && (
            <>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setVerifyOpen(true)}
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Verify
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => cancelPrescription(prescription.id)}
              >
                Cancel
              </Button>
            </>
          )}

          {prescription.status === "verified" && (
            <Button 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => startProcessing(prescription.id)}
            >
              Start Processing
            </Button>
          )}

          {prescription.status === "processing" && (
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => fillPrescription(prescription.id)}
            >
              Mark Ready
            </Button>
          )}

          {prescription.status === "ready" && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setDispenseOpen(true)}
            >
              <Package className="h-4 w-4 mr-1" />
              Dispense
            </Button>
          )}

          {prescription.status === "dispensed" && (prescription.refills_remaining || 0) > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => requestRefill.mutate(prescription.id)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Request Refill
            </Button>
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <VerificationDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        prescription={prescription}
      />
      <DispenseDialog
        open={dispenseOpen}
        onOpenChange={setDispenseOpen}
        prescription={prescription}
      />
      <PrescriptionLabelDialog
        open={labelOpen}
        onOpenChange={setLabelOpen}
        prescription={prescription}
      />
    </>
  );
};
