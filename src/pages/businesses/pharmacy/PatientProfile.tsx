import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Shield, AlertTriangle, Pill, Edit } from "lucide-react";
import { usePharmacyPatients, PharmacyPatient } from "@/hooks/usePharmacyPatients";
import { PatientDialog } from "@/components/pharmacy/PatientDialog";
import { Prescription } from "@/hooks/usePrescriptions";

export const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { getPatientById, getPatientPrescriptions } = usePharmacyPatients();
  const [patient, setPatient] = useState<PharmacyPatient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const [patientData, prescriptionsData] = await Promise.all([
          getPatientById(id),
          getPatientPrescriptions(id),
        ]);
        setPatient(patientData);
        setPrescriptions(prescriptionsData as Prescription[]);
      } catch (error) {
        console.error("Failed to load patient:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/pharmacy-patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/pharmacy-patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Patient not found</h1>
        </div>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const activePrescriptions = prescriptions.filter(p => 
    !["dispensed", "cancelled"].includes(p.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/pharmacy-patients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted-foreground">Patient Profile</p>
          </div>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {patient.first_name} {patient.last_name}
                </h2>
                <p className="text-muted-foreground">
                  {calculateAge(patient.date_of_birth)} years old
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Insurance Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance
            </h3>
            {patient.insurance_provider ? (
              <div className="space-y-2">
                <p className="font-medium">{patient.insurance_provider}</p>
                {patient.insurance_id && (
                  <p className="text-sm text-muted-foreground">ID: {patient.insurance_id}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No insurance on file</p>
            )}
          </Card>

          {/* Emergency Contact Card */}
          {patient.emergency_contact_name && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Emergency Contact</h3>
              <div className="space-y-2">
                <p className="font-medium">{patient.emergency_contact_name}</p>
                {patient.emergency_contact_phone && (
                  <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Medical Info & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Allergies & Conditions Alert */}
          {((patient.allergies && patient.allergies.length > 0) || 
            (patient.conditions && patient.conditions.length > 0)) && (
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <h4 className="font-medium text-destructive mb-2">Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, i) => (
                          <Badge key={i} variant="destructive">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.conditions && patient.conditions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-500 mb-2">Medical Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions.map((condition, i) => (
                          <Badge key={i} variant="outline" className="border-orange-500 text-orange-500">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Prescriptions Tabs */}
          <Card className="p-6">
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active ({activePrescriptions.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  History ({prescriptions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activePrescriptions.length > 0 ? (
                  activePrescriptions.map((rx) => (
                    <div key={rx.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{rx.medication_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rx.dosage} • Qty: {rx.quantity}
                          </p>
                        </div>
                      </div>
                      <Badge className="capitalize">{rx.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No active prescriptions
                  </p>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {prescriptions.length > 0 ? (
                  prescriptions.map((rx) => (
                    <div key={rx.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{rx.medication_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {rx.dosage} • {rx.created_at && new Date(rx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{rx.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No prescription history
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Notes */}
          {patient.notes && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
            </Card>
          )}
        </div>
      </div>

      <PatientDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        patient={patient}
      />
    </div>
  );
};
