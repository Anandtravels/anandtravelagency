import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Settings, CreditCard } from 'lucide-react';
import { useUPISettings } from '@/hooks/useUPISettings';
import QRCode from 'qrcode';

interface UPISettingsTabProps {
  user: { email: string } | null;
}

const UPISettingsTab = ({ user }: UPISettingsTabProps) => {
  const { settings, loading, saveSettings } = useUPISettings();
  const [formData, setFormData] = useState({
    upiId: '',
    accountHolderName: '',
    paymentPhone: ''
  });
  const [qrPreview, setQrPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        upiId: settings.upiId || '',
        accountHolderName: settings.accountHolderName || '',
        paymentPhone: settings.paymentPhone || ''
      });
      generateQRPreview(settings.upiId);
    }
  }, [settings]);

  const generateQRPreview = async (upiId: string) => {
    if (!upiId) return;
    
    try {
      // CORRECT UPI Format: upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}
      // Based on working example: pa=9849834102@ybl&pn=Govardhan&am=50&cu=INR&tn=50%20rs
      // CRITICAL: Name (pn) should NOT be encoded, only transaction note (tn) spaces
      const accountName = formData.accountHolderName || 'Anand Travels';
      const amount = '100.00';
      const note = 'Sample Payment';
      
      // DO NOT encode name - use plain text
      // Only encode spaces in transaction note
      const upiString = `upi://pay?pa=${upiId}&pn=${accountName}&am=${amount}&cu=INR&tn=${note.replace(/ /g, '%20')}`;
      
      console.log('🔍 Generating QR Preview with format:', upiString);
      
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      setQrPreview(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR preview:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'upiId') {
      generateQRPreview(value);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (!formData.upiId || !formData.accountHolderName || !formData.paymentPhone) {
      return;
    }

    setSaving(true);
    
    // Generate QR code to save with settings
    let qrDataUrl = qrPreview;
    if (!qrDataUrl) {
      try {
        // CORRECT UPI Format: upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}
        // DO NOT encode name, only encode spaces in transaction note
        const accountName = formData.accountHolderName;
        const amount = '100.00'; // Sample amount for preview
        const note = 'Sample Payment';
        
        const upiString = `upi://pay?pa=${formData.upiId}&pn=${accountName}&am=${amount}&cu=INR&tn=${note.replace(/ /g, '%20')}`;
        
        qrDataUrl = await QRCode.toDataURL(upiString, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H'
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
    
    await saveSettings(formData.upiId, formData.accountHolderName, formData.paymentPhone, user.email, qrDataUrl);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">UPI Payment Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              UPI Configuration
            </CardTitle>
            <CardDescription>
              Configure your UPI payment details for customer transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID *</Label>
              <Input
                id="upiId"
                type="text"
                placeholder="yourname@paytm or mobile@paytm"
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Enter your UPI ID (e.g., 9999999999@paytm, name@okaxis, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                type="text"
                placeholder="Full name as registered"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This name will appear on payment requests and QR codes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentPhone">Payment Phone Number *</Label>
              <Input
                id="paymentPhone"
                type="tel"
                placeholder="9999999999 or +919999999999"
                value={formData.paymentPhone}
                onChange={(e) => handleInputChange('paymentPhone', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This number will be shared with customers for payment queries
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.upiId || !formData.accountHolderName || !formData.paymentPhone}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save UPI Settings
                  </>
                )}
              </Button>
            </div>

            {settings?.updatedAt && (
              <div className="pt-4 border-t text-xs text-gray-500">
                Last updated:{' '}
                {new Date(settings.updatedAt.toDate?.() || settings.updatedAt).toLocaleString()}
                {settings.updatedBy && ` by ${settings.updatedBy}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Preview */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Preview</CardTitle>
            <CardDescription>
              This QR code will be sent to customers for payment
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            {qrPreview ? (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                  <img 
                    src={qrPreview} 
                    alt="UPI QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-gray-900">{formData.accountHolderName}</p>
                  <p className="text-sm text-gray-600 font-mono">{formData.upiId}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Customers can scan this QR code to make payments
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Enter UPI ID to generate QR code preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• When you send booking details via WhatsApp, ONE QR code will be automatically generated</li>
            <li>• The QR code is based on your UPI ID and includes the exact amount to pay</li>
            <li>• Your payment phone number will be included in the message for customer queries</li>
            <li>• Customers can scan the QR code using any UPI app (PhonePe, GPay, Paytm, etc.)</li>
            <li>• The payment amount will be pre-filled based on the booking</li>
            <li>• A bill will be automatically generated for record-keeping</li>
            <li>• You can download all bills as PDF from the Bills Management tab</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UPISettingsTab;
