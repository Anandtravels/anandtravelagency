import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Bill } from '@/types/upi';
import { formatCurrency, formatDate } from '@/utils/billUtils';

interface BillViewModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

const BillViewModal: React.FC<BillViewModalProps> = ({ bill, isOpen, onClose }) => {
  if (!bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 rounded-full bg-white/80 hover:bg-white shadow-lg"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Invoice Container */}
        <div className="p-8 md:p-12">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 md:px-12 py-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Receipt className="h-10 w-10" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      INVOICE
                    </h1>
                    <p className="text-blue-100 text-lg mt-1">
                      Anand Travel Agency
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Bill Number</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {bill.billNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="px-8 md:px-12 py-10">
              {/* Customer & Journey Info Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Customer Details */}
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Customer Details
                    </h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {bill.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-base font-medium text-gray-700">
                          {bill.customerPhone}
                        </p>
                      </div>
                      {bill.customerEmail && (
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-base font-medium text-gray-700">
                            {bill.customerEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="space-y-4">
                  <div className="border-l-4 border-green-600 pl-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Journey Details
                    </h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Service Type</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {bill.serviceType} - {bill.bookingType}
                        </p>
                      </div>
                      {bill.journeyFrom && bill.journeyTo && (
                        <div>
                          <p className="text-xs text-gray-500">Route</p>
                          <p className="text-base font-medium text-gray-700">
                            {bill.journeyFrom} → {bill.journeyTo}
                          </p>
                        </div>
                      )}
                      {bill.journeyDate && (
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-base font-medium text-gray-700">
                            {formatDate(bill.journeyDate)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Passengers</p>
                        <p className="text-base font-medium text-gray-700">
                          {bill.passengerCount} {bill.passengerCount === 1 ? 'Passenger' : 'Passengers'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200 my-8"></div>

              {/* Billing Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Billing Details
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  {/* Ticket Cost */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-base font-medium text-gray-700">
                      Ticket Cost
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(bill.ticketCost)}
                    </span>
                  </div>

                  {/* Booking Charge */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-base font-medium text-gray-700">
                      Booking Charge
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(bill.bookingCharge)}
                    </span>
                  </div>

                  {/* Coupon Discount */}
                  {bill.couponCode && bill.couponDiscount && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <span className="text-base font-medium text-green-700">
                          Coupon Discount
                        </span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          {bill.couponCode}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-green-700">
                        -{formatCurrency(bill.couponDiscount)}
                      </span>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount
                    </span>
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg shadow-md">
                      <span className="text-2xl md:text-3xl font-bold">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              {bill.qrCodeUrl && (
                <>
                  <div className="border-t-2 border-gray-200 my-8"></div>
                  <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Payment QR Code
                    </h2>
                    <div className="flex justify-center">
                      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                        <img
                          src={bill.qrCodeUrl}
                          alt="Payment QR Code"
                          className="w-48 h-48 md:w-56 md:h-56"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code to make payment
                    </p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="mt-10 pt-8 border-t-2 border-gray-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Generated on {formatDate(bill.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Booking ID: {bill.bookingId}
                  </p>
                  <p className="text-lg font-semibold text-blue-600 mt-4">
                    Thank you for choosing Anand Travel Agency!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillViewModal;
