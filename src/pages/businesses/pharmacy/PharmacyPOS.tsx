import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Pill, DollarSign, CreditCard, Receipt, CheckCircle, ShieldCheck } from "lucide-react";
import { usePrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { usePharmacyPatients, PharmacyPatient } from "@/hooks/usePharmacyPatients";
import { usePharmacyCheckout } from "@/hooks/usePharmacyCheckout";
import { PatientSearchAutocomplete } from "@/components/pharmacy/PatientSearchAutocomplete";
import { toast } from "@/components/ui/use-toast";

export const PharmacyPOS = () => {
  const { prescriptions } = usePrescriptions();
  const { createCheckout } = usePharmacyCheckout();
  
  const [selectedPatient, setSelectedPatient] = useState<PharmacyPatient | null>(null);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>([]);
  const [otcAmount, setOtcAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [counselingAcknowledged, setCounselingAcknowledged] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  // Get ready prescriptions for selected patient
  const readyPrescriptions = prescriptions.filter(p => {
    if (selectedPatient) {
      return p.status === "ready" && p.patient_id === selectedPatient.id;
    }
    return p.status === "ready";
  });

  const selectedRxDetails = prescriptions.filter(p => selectedPrescriptions.includes(p.id));

  // Calculate totals using patient insurance if available
  const hasInsurance = selectedPatient?.insurance_provider && selectedPatient?.insurance_id;
  const subtotal = selectedRxDetails.reduce((sum, rx) => sum + (rx.copay_amount || 0), 0);
  const insuranceCoverageRate = hasInsurance && insuranceVerified ? 0.8 : 0;
  const insuranceCovered = subtotal * insuranceCoverageRate;
  const copayTotal = subtotal - insuranceCovered;
  const total = copayTotal + otcAmount;

  const handlePrescriptionToggle = (rxId: string) => {
    setSelectedPrescriptions(prev => 
      prev.includes(rxId) 
        ? prev.filter(id => id !== rxId)
        : [...prev, rxId]
    );
  };

  const handleCheckout = async () => {
    if (selectedPrescriptions.length === 0) {
      toast({ title: "Please select at least one prescription", variant: "destructive" });
      return;
    }

    if (!counselingAcknowledged) {
      toast({ title: "Patient must acknowledge counseling", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      await createCheckout.mutateAsync({
        patient_id: selectedPatient?.id,
        prescription_ids: selectedPrescriptions,
        subtotal,
        insurance_covered: insuranceCovered,
        copay: copayTotal,
        otc_items_total: otcAmount,
        total,
        payment_method: paymentMethod,
        counseling_acknowledged: counselingAcknowledged,
      });

      setCheckoutComplete(true);
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewTransaction = () => {
    setSelectedPatient(null);
    setSelectedPrescriptions([]);
    setOtcAmount(0);
    setPaymentMethod("cash");
    setCounselingAcknowledged(false);
    setCheckoutComplete(false);
    setInsuranceVerified(false);
  };

  if (checkoutComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Checkout</h1>
            <p className="text-muted-foreground">Prescription pickup and payment</p>
          </div>
        </div>

        <Card className="max-w-lg mx-auto p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Checkout Complete!</h2>
          <p className="text-muted-foreground mb-6">
            {selectedPrescriptions.length} prescription(s) dispensed successfully.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-3xl font-bold">${total.toFixed(2)}</p>
          </div>
          <Button onClick={handleNewTransaction} className="w-full">
            <Receipt className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Checkout</h1>
          <p className="text-muted-foreground">Prescription pickup and payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Prescriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient
            </h2>
            <PatientSearchAutocomplete
              onSelect={setSelectedPatient}
              selectedPatient={selectedPatient}
            />

            {/* Insurance Verification */}
            {selectedPatient && (
              <div className="mt-4 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Insurance
                    </p>
                    {hasInsurance ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPatient.insurance_provider} — ID: {selectedPatient.insurance_id}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No insurance on file — cash pricing</p>
                    )}
                  </div>
                  {hasInsurance && (
                    <Button
                      size="sm"
                      variant={insuranceVerified ? "outline" : "default"}
                      onClick={() => setInsuranceVerified(!insuranceVerified)}
                    >
                      {insuranceVerified ? "✓ Verified" : "Verify Eligibility"}
                    </Button>
                  )}
                </div>
                {insuranceVerified && hasInsurance && (
                  <div className="mt-2 text-xs text-green-500 bg-green-500/10 p-2 rounded">
                    ✓ Eligible — 80% coverage confirmed. Copay applies.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Ready Prescriptions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Ready for Pickup
            </h2>

            {readyPrescriptions.length > 0 ? (
              <div className="space-y-3">
                {readyPrescriptions.map((rx) => (
                  <div 
                    key={rx.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedPrescriptions.includes(rx.id) 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handlePrescriptionToggle(rx.id)}
                  >
                    <Checkbox
                      checked={selectedPrescriptions.includes(rx.id)}
                      onCheckedChange={() => handlePrescriptionToggle(rx.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{rx.medication_name}</p>
                        {rx.is_controlled_substance && (
                          <Badge variant="destructive" className="text-xs">Controlled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rx.dosage} • Qty: {rx.quantity} • Rx #{rx.prescription_number || rx.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rx.patient_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(rx.copay_amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Copay</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {selectedPatient 
                  ? "No prescriptions ready for this patient"
                  : "Select a patient or view all ready prescriptions"
                }
              </p>
            )}
          </Card>

          {/* OTC Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">OTC Items</h2>
            <div className="flex items-center gap-4">
              <Label htmlFor="otc" className="whitespace-nowrap">Additional Items ($)</Label>
              <Input
                id="otc"
                type="number"
                min={0}
                step={0.01}
                value={otcAmount}
                onChange={(e) => setOtcAmount(parseFloat(e.target.value) || 0)}
                className="max-w-[150px]"
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prescriptions ({selectedPrescriptions.length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-500">
                <span>Insurance Coverage</span>
                <span>-${insuranceCovered.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Copay</span>
                <span>${copayTotal.toFixed(2)}</span>
              </div>
              {otcAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">OTC Items</span>
                  <span>${otcAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>

            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="debit">Debit Card</SelectItem>
                <SelectItem value="fsa">FSA/HSA</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="counseling"
                checked={counselingAcknowledged}
                onCheckedChange={(checked) => setCounselingAcknowledged(!!checked)}
              />
              <div>
                <Label htmlFor="counseling" className="font-medium cursor-pointer">
                  Counseling Acknowledgment
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Patient acknowledges receiving pharmacist counseling on their medications.
                </p>
              </div>
            </div>
          </Card>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            disabled={selectedPrescriptions.length === 0 || !counselingAcknowledged || isProcessing}
          >
            {isProcessing ? "Processing..." : `Complete Checkout - $${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
