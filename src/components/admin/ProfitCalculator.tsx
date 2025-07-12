import React from 'react';
import { getProfitBreakdown, validateProfitCalculation, formatCurrency, getCommissionRate } from '@/utils/profitCalculation';
import { Booking, EditFormData } from '@/types/admin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ProfitCalculatorProps {
  formData: EditFormData;
  className?: string;
}

const ProfitCalculator = ({ formData, className }: ProfitCalculatorProps) => {
  // Convert form data to booking object for calculations
  const mockBooking: Partial<Booking> = {
    actual_price: parseFloat(formData.actual_price) || 0,
    ticket_cost: parseFloat(formData.ticket_cost) || 0,
    commission_amount: formData.commission_amount && formData.commission_amount !== '' ? parseFloat(formData.commission_amount) : undefined,
    train_booking_type: formData.train_booking_type as any,
    assignedAgent: formData.status === 'completed' ? 'agent@example.com' : undefined // Mock for calculation
  };

  const profitBreakdown = getProfitBreakdown(mockBooking as Booking);
  const validation = validateProfitCalculation(mockBooking as Booking);
  const commissionRate = getCommissionRate(formData.train_booking_type);
  
  // Check if commission is manually entered or calculated
  const isManualCommission = formData.commission_amount && formData.commission_amount !== '';
  const calculatedCommission = (parseFloat(formData.actual_price) || 0) * commissionRate;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-gray-900">Profit Calculator</h4>
      </div>

      {/* Calculation Breakdown */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Actual Price:</span>
            <span className="font-medium">{formatCurrency(profitBreakdown.actualPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket Cost:</span>
            <span className="font-medium text-red-600">-{formatCurrency(profitBreakdown.ticketCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              Commission {isManualCommission ? '(Manual)' : `(${(commissionRate * 100).toFixed(1)}%)`}:
            </span>
            <span className="font-medium text-orange-600">-{formatCurrency(profitBreakdown.commission)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium text-gray-900">Net Profit:</span>
            <span className={`font-bold ${profitBreakdown.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profitBreakdown.profit)}
            </span>
          </div>
          {profitBreakdown.actualPrice > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Profit Margin:</span>
              <span>{((profitBreakdown.profit / profitBreakdown.actualPrice) * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      <div className="space-y-2">
        {validation.errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.warnings.length > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.isValid && validation.warnings.length === 0 && profitBreakdown.profit > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Profit calculation looks good! Net profit: {formatCurrency(profitBreakdown.profit)}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Commission Info */}
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Commission Rates (Auto-calculated if not manually entered):</p>
            <ul className="space-y-0.5">
              <li>• General: 2%</li>
              <li>• Tatkal: 3%</li>
              <li>• Premium Tatkal: 4%</li>
            </ul>
            <p className="mt-2">
              <strong>Formula:</strong> Profit = Actual Price - Ticket Cost - Commission Amount
            </p>
            {isManualCommission && (
              <p className="mt-2 text-blue-800 font-medium">
                ✓ Using manual commission amount: {formatCurrency(profitBreakdown.commission)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
