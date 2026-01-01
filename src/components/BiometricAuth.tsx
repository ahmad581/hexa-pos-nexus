import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Fingerprint, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  employeeId: string | number;
  employeeName: string;
  onAuthSuccess: (employeeId: string | number) => void;
  onClose: () => void;
  mode: 'register' | 'authenticate';
}

export const BiometricAuth = ({ 
  employeeId, 
  employeeName, 
  onAuthSuccess, 
  onClose, 
  mode 
}: BiometricAuthProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // For now, we'll simulate biometric authentication
  // In a real implementation, you would use a proper biometric plugin
  const handleBiometricAction = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate biometric processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === 'register') {
        // Simulate fingerprint registration
        const registered = Math.random() > 0.1; // 90% success rate for demo
        
        if (registered) {
          toast({ 
            title: 'Fingerprint registered successfully',
            description: `Biometric authentication enabled for ${employeeName}`
          });
          onAuthSuccess(employeeId);
        } else {
          toast({ 
            title: 'Registration failed',
            description: 'Please try again',
            variant: 'destructive'
          });
        }
      } else {
        // Simulate fingerprint authentication
        const authenticated = Math.random() > 0.2; // 80% success rate for demo
        
        if (authenticated) {
          toast({ 
            title: 'Authentication successful',
            description: `Welcome, ${employeeName}!`
          });
          onAuthSuccess(employeeId);
        } else {
          toast({ 
            title: 'Authentication failed',
            description: 'Fingerprint not recognized',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
      toast({ 
        title: 'Biometric error',
        description: 'Please try again or use alternative method',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <User size={24} className="text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">{employeeName}</h3>
        </div>
        
        <div className="mb-6">
          {isProcessing ? (
            <div className="animate-pulse">
              <Fingerprint size={64} className="mx-auto text-blue-400 mb-4" />
              <p className="text-blue-400">
                {mode === 'register' ? 'Registering fingerprint...' : 'Authenticating...'}
              </p>
            </div>
          ) : (
            <div>
              <Fingerprint size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-300 mb-2">
                {mode === 'register' 
                  ? 'Place your finger on the sensor to register'
                  : 'Place your finger on the sensor to authenticate'
                }
              </p>
              <div className="flex items-center justify-center text-sm text-gray-400">
                <Shield size={16} className="mr-1" />
                Secure biometric authentication
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={handleBiometricAction}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Fingerprint size={16} className="mr-2" />
            {mode === 'register' ? 'Register Fingerprint' : 'Authenticate'}
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};