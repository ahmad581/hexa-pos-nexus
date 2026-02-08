import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User } from "lucide-react";
import { usePharmacyPatients, PharmacyPatient } from "@/hooks/usePharmacyPatients";

interface PatientSearchAutocompleteProps {
  onSelect: (patient: PharmacyPatient | null) => void;
  selectedPatient: PharmacyPatient | null;
}

export const PatientSearchAutocomplete = ({ onSelect, selectedPatient }: PatientSearchAutocompleteProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PharmacyPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { searchPatients } = usePharmacyPatients();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const patients = await searchPatients(searchQuery);
          setResults(patients);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (patient: PharmacyPatient) => {
    onSelect(patient);
    setSearchQuery("");
    setShowResults(false);
    setResults([]);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery("");
    setResults([]);
  };

  if (selectedPatient) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</p>
            <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-9"
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                className="w-full p-3 flex items-center gap-3 hover:bg-accent text-left"
                onClick={() => handleSelect(patient)}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {patient.first_name} {patient.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {patient.phone} • DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))
          ) : searchQuery.length >= 2 ? (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No patients found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
