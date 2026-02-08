import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2 } from "lucide-react";
import { usePrescriptions, PrescriptionStatus } from "@/hooks/usePrescriptions";
import { PrescriptionCard } from "@/components/pharmacy/PrescriptionCard";
import { CreatePrescriptionDialog } from "@/components/pharmacy/CreatePrescriptionDialog";

export const Prescriptions = () => {
  const { prescriptions, isLoading } = usePrescriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.prescription_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group prescriptions by status for quick stats
  const stats = {
    received: prescriptions.filter(p => p.status === "received").length,
    verified: prescriptions.filter(p => p.status === "verified").length,
    processing: prescriptions.filter(p => p.status === "processing").length,
    ready: prescriptions.filter(p => p.status === "ready").length,
    dispensed: prescriptions.filter(p => p.status === "dispensed").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.received}</p>
          <p className="text-sm text-muted-foreground">Received</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.verified}</p>
          <p className="text-sm text-muted-foreground">Verified</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.processing}</p>
          <p className="text-sm text-muted-foreground">Processing</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.ready}</p>
          <p className="text-sm text-muted-foreground">Ready</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{stats.dispensed}</p>
          <p className="text-sm text-muted-foreground">Dispensed</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient, medication, or Rx#..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PrescriptionStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="dispensed">Dispensed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prescriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "No prescriptions match your filters"
              : "No prescriptions yet. Create your first prescription to get started."
            }
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          )}
        </Card>
      )}

      <CreatePrescriptionDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};
