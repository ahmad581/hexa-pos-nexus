import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBranch } from "@/contexts/BranchContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UnitType = "table" | "room";

interface UnitConfig {
  type: UnitType;
  title: string;
  numberLabel: string;
  numberPlaceholder: string;
  capacityLabel: string;
  statusOptions: { value: string; label: string }[];
  additionalFields?: boolean;
}

const unitConfigs: Record<UnitType, UnitConfig> = {
  table: {
    type: "table",
    title: "Add Table",
    numberLabel: "Table Number",
    numberPlaceholder: "e.g., T1, 101",
    capacityLabel: "Seats",
    statusOptions: [
      { value: "available", label: "Available" },
      { value: "occupied", label: "Occupied" },
      { value: "reserved", label: "Reserved" },
      { value: "cleaning", label: "Cleaning" },
    ],
  },
  room: {
    type: "room",
    title: "Add Room",
    numberLabel: "Room Number",
    numberPlaceholder: "e.g., 101, 201A",
    capacityLabel: "Capacity (Guests)",
    statusOptions: [
      { value: "available", label: "Available" },
      { value: "occupied", label: "Occupied" },
      { value: "reserved", label: "Reserved" },
      { value: "maintenance", label: "Maintenance" },
    ],
    additionalFields: true,
  },
};

interface AddUnitDialogProps {
  unitType: UnitType;
  onSuccess?: () => void;
}

export const AddUnitDialog = ({ unitType, onSuccess }: AddUnitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { selectedBranch } = useBranch();

  const config = unitConfigs[unitType];

  // Common fields
  const [unitNumber, setUnitNumber] = useState("");
  const [capacity, setCapacity] = useState("4");
  const [status, setStatus] = useState("available");
  const [location, setLocation] = useState("");

  // Room-specific fields
  const [roomType, setRoomType] = useState("standard");
  const [pricePerNight, setPricePerNight] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setUnitNumber("");
    setCapacity("4");
    setStatus("available");
    setLocation("");
    setRoomType("standard");
    setPricePerNight("");
    setFloorNumber("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch) {
      toast.error("Please select a branch first");
      return;
    }

    if (!unitNumber.trim()) {
      toast.error(`Please enter a ${unitType} number`);
      return;
    }

    setLoading(true);
    const branchId = selectedBranch.id;

    try {
      if (unitType === "table") {
        const { error } = await supabase.from("tables").insert([{
          branch_id: branchId,
          table_number: unitNumber.trim(),
          capacity: parseInt(capacity) || 4,
          status: status,
          location: location.trim() || null,
        }]);

        if (error) throw error;
        toast.success("Table added successfully");
      } else if (unitType === "room") {
        if (!pricePerNight) {
          toast.error("Please enter a price per night");
          setLoading(false);
          return;
        }

        const { error } = await supabase.from("rooms").insert([{
          branch_id: branchId,
          room_number: unitNumber.trim(),
          room_type: roomType,
          capacity: parseInt(capacity) || 2,
          status: status,
          price_per_night: parseFloat(pricePerNight),
          floor_number: floorNumber ? parseInt(floorNumber) : null,
          description: description.trim() || null,
        }]);

        if (error) throw error;
        toast.success("Room added successfully");
      }

      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding unit:", error);
      toast.error(`Failed to add ${unitType}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          {config.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">{config.numberLabel}</Label>
              <Input
                id="unitNumber"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder={config.numberPlaceholder}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">{config.capacityLabel}</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={unitType === "table" ? "e.g., Patio, Main Hall" : "e.g., East Wing"}
              />
            </div>
          </div>

          {unitType === "room" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="presidential">Presidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price/Night ($)</Label>
                  <Input
                    id="pricePerNight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    placeholder="99.99"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorNumber">Floor Number</Label>
                <Input
                  id="floorNumber"
                  type="number"
                  min="0"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                  placeholder="e.g., 1, 2, 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Room description and amenities..."
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : `Add ${unitType === "table" ? "Table" : "Room"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
