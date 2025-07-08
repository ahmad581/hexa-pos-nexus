
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Pill } from "lucide-react";

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  quantity: number;
  refills: number;
  status: "Pending" | "Ready" | "Dispensed" | "Expired";
  dateReceived: string;
  pickupDate?: string;
}

const initialPrescriptions: Prescription[] = [
  { id: "1", patientName: "John Smith", doctorName: "Dr. Johnson", medication: "Amoxicillin", dosage: "500mg", quantity: 30, refills: 2, status: "Ready", dateReceived: "2023-12-01", pickupDate: "2023-12-02" },
  { id: "2", patientName: "Mary Wilson", doctorName: "Dr. Brown", medication: "Lisinopril", dosage: "10mg", quantity: 90, refills: 5, status: "Pending", dateReceived: "2023-12-01" },
];

export const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);

  const getStatusColor = (status: Prescription["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Ready": return "bg-green-500/20 text-green-400";
      case "Dispensed": return "bg-blue-500/20 text-blue-400";
      case "Expired": return "bg-red-500/20 text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Prescriptions</h1>
          <p className="text-gray-400">Manage patient prescriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Rx #{prescription.id}</h3>
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <User size={16} className="mr-2" />
                <span className="text-sm">{prescription.patientName}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Dr. {prescription.doctorName}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Pill size={16} className="mr-2" />
                <span className="text-sm">{prescription.medication} {prescription.dosage}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Qty: {prescription.quantity} | Refills: {prescription.refills}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">Received: {prescription.dateReceived}</span>
              </div>
              {prescription.pickupDate && (
                <div className="text-green-400">
                  <span className="text-sm">Pickup: {prescription.pickupDate}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {prescription.status === "Pending" && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Fill Prescription
                </Button>
              )}
              {prescription.status === "Ready" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Dispense
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
