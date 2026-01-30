import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone } from "lucide-react";
import { EmployeeExtension } from "@/hooks/useCallCenter";

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (profileId: string) => void;
  extensions: EmployeeExtension[];
  currentUserId?: string;
}

export const TransferDialog = ({
  isOpen,
  onClose,
  onTransfer,
  extensions,
  currentUserId,
}: TransferDialogProps) => {
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);

  const availableExtensions = extensions.filter(
    ext => ext.profile_id !== currentUserId && ext.is_available
  );

  const handleTransfer = () => {
    if (selectedExtension) {
      onTransfer(selectedExtension);
      onClose();
      setSelectedExtension(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Transfer Call</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {availableExtensions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No available agents to transfer to
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableExtensions.map((ext) => (
                <div
                  key={ext.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedExtension === ext.profile_id
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedExtension(ext.profile_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {ext.profile?.first_name} {ext.profile?.last_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          Ext: {ext.extension_number}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">
                      Available
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleTransfer}
              disabled={!selectedExtension}
              className="flex-1 bg-primary hover:bg-primary/80"
            >
              <Phone size={16} className="mr-2" />
              Transfer
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
