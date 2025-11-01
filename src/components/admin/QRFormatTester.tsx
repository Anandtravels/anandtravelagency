import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateAllFormats } from '@/utils/upiFormatTester';

/**
 * QR Code Format Tester Component
 * 
 * This component helps you test different UPI QR code formats
 * to find which one works best with your UPI apps.
 * 
 * Usage:
 * 1. Import this component in your Admin.tsx or any page
 * 2. Add <QRFormatTester /> to render it
 * 3. Fill in UPI details and click "Generate All Formats"
 * 4. Scan each QR code with your UPI app to see which works
 * 5. Use the working format in your production code
 */
const QRFormatTester = () => {
  const [upiId, setUpiId] = useState('8985816481@paytm');
  const [name, setName] = useState('Anand Travels');
  const [amount, setAmount] = useState('100');
  const [note, setNote] = useState('Test Payment');
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const results = await generateAllFormats(
        upiId,
        name,
        parseFloat(amount),
        note
      );
      setQrCodes(results);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">UPI QR Code Format Tester</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter UPI Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>UPI ID</Label>
            <Input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="merchant@paytm"
            />
          </div>
          
          <div>
            <Label>Account Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Merchant Name"
            />
          </div>
          
          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100.00"
            />
          </div>
          
          <div>
            <Label>Note</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Payment for..."
            />
          </div>
          
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate All Formats'}
          </Button>
        </CardContent>
      </Card>

      {qrCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrCodes.map((qr, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{qr.format}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <img 
                    src={qr.qrCode} 
                    alt={qr.format}
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  <code>{qr.upiString}</code>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Open your UPI app (PhonePe/GPay/Paytm)</li>
                    <li>Scan this QR code</li>
                    <li>Check if amount is pre-filled</li>
                    <li>Note if it works ✅ or fails ❌</li>
                  </ol>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qr.qrCode;
                    link.download = `${qr.format.replace(/\s+/g, '_')}_QR.png`;
                    link.click();
                  }}
                >
                  Download QR
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {qrCodes.length > 0 && (
        <Card className="mt-6 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-3">📝 Testing Results</h3>
            <p className="text-sm mb-3">
              After testing all formats, note which one works best:
            </p>
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Standard NPCI:</strong> Works with most apps (recommended)</li>
              <li>✅ <strong>Universal:</strong> Uses URLSearchParams (most compatible)</li>
              <li>⚠️ <strong>PhonePe/GPay Specific:</strong> May have extra parameters</li>
              <li>❌ <strong>Alternative (No Prefix):</strong> May not work with all scanners</li>
            </ul>
            <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
              <p className="text-sm">
                <strong>💡 Tip:</strong> The format that pre-fills the amount correctly
                in your UPI app is the one you should use in production!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRFormatTester;
