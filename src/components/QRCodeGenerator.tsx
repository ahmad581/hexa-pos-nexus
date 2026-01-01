import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  employeeId: string | number;
  employeeName: string;
  qrCodeData: string;
}

export const QRCodeGenerator = ({ employeeId, employeeName, qrCodeData }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Create QR code data with employee information
        const qrData = JSON.stringify({
          employeeId,
          employeeName,
          qrCode: qrCodeData,
          timestamp: Date.now()
        });
        
        const url = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [employeeId, employeeName, qrCodeData]);

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${employeeName}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'QR Code downloaded successfully' });
    }
  };

  const copyQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      toast({ title: 'QR Code copied to clipboard' });
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast({ title: 'Failed to copy QR Code', variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-4">Employee QR Code</h3>
        {qrCodeUrl && (
          <div className="mb-4">
            <img 
              src={qrCodeUrl} 
              alt={`QR Code for ${employeeName}`}
              className="mx-auto border-2 border-gray-600 rounded-lg"
            />
          </div>
        )}
        <div className="flex gap-2 justify-center">
          <Button 
            size="sm" 
            onClick={downloadQRCode}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button 
            size="sm" 
            onClick={copyQRCode}
            className="bg-green-600 hover:bg-green-700"
          >
            <Copy size={16} className="mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </Card>
  );
};