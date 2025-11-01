// UPI Settings Types
export interface UPISettings {
  id: string;
  upiId: string;
  accountHolderName: string;
  paymentPhone: string; // Payment contact phone number
  qrCodeDataUrl?: string;
  updatedAt: any;
  updatedBy: string;
}

// Bill Types
export interface Bill {
  id: string;
  billNumber: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  bookingType: string;
  journeyFrom?: string;
  journeyTo?: string;
  journeyDate?: string;
  passengerCount: number;
  ticketCost: number;
  bookingCharge: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount: number;
  qrCodeUrl?: string;
  createdAt: any;
  createdBy: string;
}
