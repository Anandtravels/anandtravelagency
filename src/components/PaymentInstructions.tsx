import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building, AlertCircle, CheckCircle2 } from "lucide-react";
import { E_SERVICE_TYPES } from "@/types/eservices";

interface PaymentInstructionsProps {
  serviceType: keyof typeof E_SERVICE_TYPES;
  serviceFee: string;
}

const PaymentInstructions = ({ serviceType, serviceFee }: PaymentInstructionsProps) => {
  const isChargeable = !serviceFee.toLowerCase().includes('as per bank') && serviceFee !== 'Free';
  
  if (!isChargeable) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle2 size={20} />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-blue-700">
            <AlertCircle size={16} />
            <span className="text-sm">
              {serviceFee.toLowerCase().includes('as per bank') 
                ? "Payment will be processed as per bank charges at the time of account opening."
                : "This service has no additional processing fee from our side."
              }
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <CreditCard size={20} />
          Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-orange-800">Service Fee:</span>
          <Badge variant="outline" className="text-orange-700 border-orange-300">
            {serviceFee}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm text-orange-700">
            <strong>Payment Methods Available:</strong>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-200">
              <Smartphone size={16} className="text-orange-600" />
              <div className="text-xs">
                <div className="font-medium">UPI Payment</div>
                <div className="text-gray-600">PhonePe, GPay, Paytm</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-200">
              <Building size={16} className="text-orange-600" />
              <div className="text-xs">
                <div className="font-medium">Bank Transfer</div>
                <div className="text-gray-600">NEFT/RTGS/IMPS</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white rounded border border-orange-200">
              <CreditCard size={16} className="text-orange-600" />
              <div className="text-xs">
                <div className="font-medium">Card Payment</div>
                <div className="text-gray-600">Debit/Credit Cards</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border border-orange-200">
            <div className="text-sm text-orange-800 space-y-1">
              <div className="font-medium">📞 Payment Assistance:</div>
              <div>• Call us at <strong>+91 8985816481</strong> for payment guidance</div>
              <div>• Our team will share payment details after form submission</div>
              <div>• Payment confirmation is required before document processing</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Important:</strong> Government fees (if any) are additional and will be collected separately as per official rates.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInstructions;
