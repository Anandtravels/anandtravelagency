import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bill } from '@/types/upi';
import { formatCurrency, formatDate } from '@/utils/billUtils';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const InvoicePrint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const billId = searchParams.get('id');
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      if (!billId) {
        setLoading(false);
        return;
      }

      try {
        const billDoc = await getDoc(doc(db, 'bills', billId));
        if (billDoc.exists()) {
          setBill({ id: billDoc.id, ...billDoc.data() } as Bill);
        }
      } catch (error) {
        console.error('Error fetching bill:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600">The requested invoice could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print/Download Action Bar - Hidden in print */}
      <div className="print:hidden sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Anand Travel Agency" className="h-10 w-auto" />
              <div>
                <h2 className="font-semibold text-gray-800">Invoice #{bill.billNumber}</h2>
                <p className="text-xs text-gray-500">Ready to print or save</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
              <Button 
                onClick={() => window.close()} 
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content - Optimized for Print */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none">
          {/* Professional Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-8 md:px-12 py-10 print:py-8">
            <div className="flex items-start justify-between flex-wrap gap-6">
              {/* Company Logo and Info */}
              <div className="flex items-center gap-6">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img 
                    src={logo} 
                    alt="Anand Travel Agency Logo" 
                    className="h-16 w-auto print:h-14"
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    ANAND TRAVEL AGENCY
                  </h1>
                  <p className="text-blue-100 text-base mb-1">
                    Your Trusted Travel Partner
                  </p>
                  <p className="text-blue-200 text-sm">
                    📞 8985816481 | 🌐 anandtravelagency.com
                  </p>
                </div>
              </div>

              {/* Invoice Number & Date */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <p className="text-xs text-blue-100 uppercase tracking-wider mb-1">Invoice</p>
                <p className="text-2xl font-bold mb-3">{bill.billNumber}</p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-200">Date:</span>
                    <span className="font-medium">{formatDate(bill.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-200">Booking ID:</span>
                    <span className="font-medium text-xs">{bill.bookingId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="px-8 md:px-12 py-10 print:py-8">
            {/* Customer & Journey Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Billed To */}
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">BILLED TO</span>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Customer Name</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {bill.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-700 mt-1">
                        {bill.customerPhone}
                      </p>
                    </div>
                    {bill.customerEmail && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                        <p className="text-base font-medium text-gray-700 mt-1 break-all">
                          {bill.customerEmail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Journey Information */}
              <div className="space-y-4">
                <div className="border-l-4 border-green-600 pl-4">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">JOURNEY DETAILS</span>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Service Type</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {bill.serviceType} - {bill.bookingType}
                      </p>
                    </div>
                    {bill.journeyFrom && bill.journeyTo && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                        <p className="text-lg font-semibold text-gray-700 mt-1">
                          {bill.journeyFrom} → {bill.journeyTo}
                        </p>
                      </div>
                    )}
                    {bill.journeyDate && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Journey Date</p>
                        <p className="text-base font-medium text-gray-700 mt-1">
                          {formatDate(bill.journeyDate)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Passengers</p>
                      <p className="text-base font-medium text-gray-700 mt-1">
                        {bill.passengerCount} {bill.passengerCount === 1 ? 'Passenger' : 'Passengers'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information - Agent PNR & Booking Account ID */}
            {(bill.agentPnr || bill.agentBookingAccountId) && (
              <div className="mb-10">
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border-2 border-teal-200">
                  <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="bg-teal-500 text-white px-2 py-1 rounded flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      TICKET INFORMATION
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {bill.agentPnr && (
                      <div className="bg-white rounded-lg p-4 border border-teal-200 shadow-sm">
                        <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">Ticket PNR Number</p>
                        <p className="text-2xl font-bold text-teal-900 mt-2 font-mono tracking-wider">
                          {bill.agentPnr}
                        </p>
                      </div>
                    )}
                    {bill.agentBookingAccountId && (
                      <div className="bg-white rounded-lg p-4 border border-teal-200 shadow-sm">
                        <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">Booking Account ID</p>
                        <p className="text-xl font-bold text-teal-900 mt-2 font-mono">
                          {bill.agentBookingAccountId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Elegant Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Billing Information
                </span>
              </div>
            </div>

            {/* Billing Details Table */}
            <div className="space-y-6">
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-base font-medium text-gray-800">Ticket Cost</span>
                        <p className="text-xs text-gray-500 mt-1">Base fare for the booking</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(bill.ticketCost)}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-base font-medium text-gray-800">Booking Charge</span>
                        <p className="text-xs text-gray-500 mt-1">Service & convenience fee</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(bill.bookingCharge)}
                        </span>
                      </td>
                    </tr>
                    {bill.couponCode && bill.couponDiscount && (
                      <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-green-800">Coupon Discount</span>
                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                              {bill.couponCode}
                            </span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">You saved money!</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-lg font-bold text-green-700">
                            -{formatCurrency(bill.couponDiscount)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <td className="py-5 px-6">
                        <span className="text-xl font-bold text-white uppercase tracking-wide">
                          Total Amount
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-3xl font-bold text-white">
                          {formatCurrency(bill.totalAmount)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment QR Code Section */}
            {bill.qrCodeUrl && (
              <>
                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Payment Information
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 print:bg-gray-50">
                  <div className="inline-block">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Scan to Pay
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use any UPI app to scan and pay
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-blue-200 inline-block">
                      <img
                        src={bill.qrCodeUrl}
                        alt="Payment QR Code"
                        className="w-56 h-56 print:w-48 print:h-48"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Accepted Payment Methods:</span>
                    <div className="flex gap-2">
                      {['GPay', 'PhonePe', 'Paytm', 'UPI'].map((app) => (
                        <span key={app} className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer Section */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Terms & Conditions */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Terms & Conditions
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Payment is non-refundable after booking confirmation</li>
                    <li>• Cancellation charges as per railway/airline policy</li>
                    <li>• Valid government ID required at the time of travel</li>
                    <li>• Prices are subject to change without prior notice</li>
                  </ul>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Need Help?
                  </h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">📞 Phone:</span>
                      <span>8985816481</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">🌐 Website:</span>
                      <span>anandtravelagency.com</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">📧 Email:</span>
                      <span>support@anandtravelagency.com</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Thank You Message */}
              <div className="mt-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-6 print:bg-gray-50">
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  Thank You for Your Business! 🙏
                </p>
                <p className="text-sm text-gray-600">
                  We appreciate your trust in Anand Travel Agency
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Have a safe and pleasant journey!
                </p>
              </div>

              {/* Invoice Authenticity Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 italic">
                  This is a computer-generated invoice and does not require a signature.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  For any queries, please contact us within 24 hours of booking.
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Footer Branding - Print Only */}
          <div className="bg-gray-100 px-8 py-4 text-center border-t-2 border-gray-300 print:bg-white">
            <p className="text-xs text-gray-600">
              Generated by <span className="font-bold text-blue-600">Anand Travel Agency</span> - India's Trusted Travel Partner
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:py-8 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          
          .print\\:h-14 {
            height: 3.5rem !important;
          }
          
          .print\\:w-48 {
            width: 12rem !important;
          }
          
          .print\\:h-48 {
            height: 12rem !important;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .print\\:bg-white {
            background-color: #ffffff !important;
          }

          /* Ensure colors print correctly */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Page breaks */
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint;
