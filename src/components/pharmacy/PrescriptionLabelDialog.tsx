import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { Prescription } from "@/hooks/usePrescriptions";

interface PrescriptionLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
}

export const PrescriptionLabelDialog = ({ open, onOpenChange, prescription }: PrescriptionLabelDialogProps) => {
  const labelRef = useRef<HTMLDivElement>(null);

  const patientName = prescription.pharmacy_patients
    ? `${prescription.pharmacy_patients.first_name} ${prescription.pharmacy_patients.last_name}`
    : prescription.patient_name;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow || !labelRef.current) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Rx Label</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 12px; font-size: 11px; max-width: 4in; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
            .header h2 { margin: 0; font-size: 14px; }
            .header p { margin: 2px 0; font-size: 10px; }
            .rx-number { font-size: 13px; font-weight: bold; margin: 6px 0; }
            .field { margin: 4px 0; }
            .field-label { font-weight: bold; }
            .instructions { border: 1px solid #000; padding: 6px; margin: 8px 0; font-size: 12px; font-weight: bold; }
            .warnings { font-size: 9px; margin-top: 8px; border-top: 1px solid #ccc; padding-top: 4px; }
            .footer { text-align: center; font-size: 9px; margin-top: 8px; border-top: 1px solid #000; padding-top: 4px; }
          </style>
        </head>
        <body>
          ${labelRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Prescription Label
          </DialogTitle>
        </DialogHeader>

        {/* Label Preview */}
        <div ref={labelRef} className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 bg-white text-black text-xs space-y-2">
          <div className="header text-center border-b-2 border-black pb-2 mb-2">
            <h2 className="text-sm font-bold">BizHub Pharmacy</h2>
            <p className="text-[10px] text-gray-600">123 Main Street • (555) 123-4567</p>
          </div>

          <p className="rx-number font-bold text-sm">
            Rx# {prescription.prescription_number || prescription.id.slice(0, 8)}
          </p>
          <p className="text-[10px] text-gray-500">
            Date: {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
          </p>

          <Separator className="bg-black/20" />

          <div className="space-y-1">
            <p><span className="font-bold">Patient:</span> {patientName}</p>
            <p><span className="font-bold">Prescriber:</span> Dr. {prescription.doctor_name || "N/A"}</p>
          </div>

          <Separator className="bg-black/20" />

          <div className="space-y-1">
            <p className="font-bold text-sm">{prescription.medication_name}</p>
            {prescription.dosage && <p><span className="font-bold">Strength:</span> {prescription.dosage}</p>}
            <p><span className="font-bold">Qty:</span> {prescription.quantity}</p>
            {prescription.refills_total !== undefined && (
              <p><span className="font-bold">Refills:</span> {prescription.refills_remaining}/{prescription.refills_total}</p>
            )}
          </div>

          {prescription.instructions && (
            <div className="instructions border border-black p-2 font-bold text-[11px]">
              {prescription.instructions}
            </div>
          )}

          {prescription.is_controlled_substance && (
            <div className="warnings text-[9px] border-t border-gray-300 pt-1">
              <p className="font-bold">⚠ CONTROLLED SUBSTANCE — Schedule {prescription.schedule}</p>
              <p>Caution: Federal law prohibits the transfer of this drug to any person other than the patient for whom it was prescribed.</p>
            </div>
          )}

          <div className="footer text-center text-[9px] border-t border-black pt-1 mt-2">
            <p>Keep out of reach of children</p>
            <p>Store at room temperature unless otherwise directed</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
