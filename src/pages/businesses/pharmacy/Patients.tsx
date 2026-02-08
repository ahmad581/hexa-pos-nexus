import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Phone, Calendar, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { usePharmacyPatients, PharmacyPatient } from "@/hooks/usePharmacyPatients";
import { PatientDialog } from "@/components/pharmacy/PatientDialog";
import { Link } from "react-router-dom";

export const Patients = () => {
  const { patients, isLoading } = usePharmacyPatients();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PharmacyPatient | null>(null);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || patient.phone.includes(query);
  });

  const handleEdit = (patient: PharmacyPatient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    setIsDialogOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground">Manage patient profiles and records</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient profiles and records</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-9"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(patient.date_of_birth)} years old
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
              </div>
              {patient.insurance_provider && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  {patient.insurance_provider}
                </div>
              )}
            </div>

            {/* Allergies Warning */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive">Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.slice(0, 3).map((allergy, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                  {patient.allergies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{patient.allergies.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleEdit(patient)}
              >
                Edit
              </Button>
              <Link to={`/patient/${patient.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No patients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Add your first patient to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          )}
        </Card>
      )}

      <PatientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={selectedPatient}
      />
    </div>
  );
};
