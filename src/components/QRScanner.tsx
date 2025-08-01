import { useState } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanResult: (employeeData: any) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanResult, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const startScan = async () => {
    try {
      // Check camera permission
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        // Hide background
        document.body.classList.add('barcode-scanner-active');
        
        setIsScanning(true);
        
        const result = await BarcodeScanner.startScan();
        
        setIsScanning(false);
        
        // Show background
        document.body.classList.remove('barcode-scanner-active');

        if (result.hasContent) {
          try {
            const employeeData = JSON.parse(result.content);
            onScanResult(employeeData);
            toast({ title: 'QR Code scanned successfully' });
          } catch (error) {
            toast({ 
              title: 'Invalid QR Code', 
              description: 'This QR code is not valid for employee check-in/out',
              variant: 'destructive' 
            });
          }
        }
      } else {
        toast({ 
          title: 'Camera permission denied', 
          description: 'Please allow camera access to scan QR codes',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setIsScanning(false);
      document.body.classList.remove('barcode-scanner-active');
      toast({ 
        title: 'Scanning failed', 
        description: 'There was an error scanning the QR code',
        variant: 'destructive' 
      });
    }
  };

  const stopScan = () => {
    BarcodeScanner.stopScan();
    setIsScanning(false);
    document.body.classList.remove('barcode-scanner-active');
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-4">Scan Employee QR Code</h3>
        
        {!isScanning ? (
          <div className="space-y-4">
            <QrCode size={64} className="mx-auto text-blue-400" />
            <p className="text-gray-300">Position the QR code within the camera frame</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={startScan}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <QrCode size={16} className="mr-2" />
                Start Scanning
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="animate-pulse">
              <QrCode size={64} className="mx-auto text-blue-400" />
            </div>
            <p className="text-blue-400">Scanning in progress...</p>
            <Button 
              onClick={stopScan}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <X size={16} className="mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};