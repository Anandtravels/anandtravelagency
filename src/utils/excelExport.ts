import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Booking } from '@/types/admin';
import { calculateCommission, calculateProfit, getProfitBreakdown } from './profitCalculation';

// Format passenger count from passengers field
const getPassengerCount = (passengers: any): number => {
  if (typeof passengers === 'string') {
    // Count number of lines or commas as passenger indicators
    const lines = passengers.split('\n').filter(line => line.trim().length > 0);
    return lines.length > 0 ? lines.length : 1;
  } else if (Array.isArray(passengers)) {
    return passengers.length;
  }
  return 1;
};

// Get the person who booked (agent name or Admin)
const getBookedBy = (booking: Booking, agents?: any[]): string => {
  if (!booking.assignedAgent || booking.assignedAgent === 'admin@anandtravels.com') {
    return 'Admin';
  }
  
  // If agents array is provided, try to find the agent name
  if (agents && agents.length > 0) {
    const agent = agents.find(a => a.email === booking.assignedAgent);
    if (agent) {
      return agent.name;
    }
  }
  
  // Fallback to email if agent name not found
  return booking.assignedAgent;
};

// Format date for Excel
const formatDate = (date: string | Date): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  } catch (e) {
    return date.toString();
  }
};

// Export bookings to Excel with enhanced format
export const exportBookingsToExcel = (bookings: Booking[], filename?: string, agents?: any[]) => {
  // Prepare data for Excel exactly as requested format
  const excelData = bookings.map((booking) => {
    const profitBreakdown = getProfitBreakdown(booking);
    const bookedBy = getBookedBy(booking, agents);
    
    return {
      'Phone Number': booking.phone || '',
      'Date of Tatkal': booking.tatkal_booking_date ? formatDate(booking.tatkal_booking_date) : 
                        (booking.train_booking_type === 'tatkal' || booking.train_booking_type === 'premium_tatkal') 
                        ? formatDate(booking.created_at) : '',
      'Date of Journey': formatDate(booking.journey_date),
      'From & To': `${booking.from || ''} to ${booking.to || ''}`,
      'Class': booking.train_class || booking.travel_class || booking.class_preference || '',
      'Train No': booking.train_number || booking.preferred_trains || '',
      'Person': getPassengerCount(booking.passengers),
      'Status': booking.status || 'pending',
      'Booked By': bookedBy,
      'Profit': profitBreakdown.profit > 0 ? `₹${profitBreakdown.profit.toFixed(2)}` : '₹0.00',
      
      // Additional context fields (for admin reference)
      'Customer Name': booking.name || '',
      'Email': booking.email || '',
      'Ticket Cost': profitBreakdown.ticketCost ? `₹${profitBreakdown.ticketCost.toFixed(2)}` : '₹0.00',
      'Actual Price': profitBreakdown.actualPrice ? `₹${profitBreakdown.actualPrice.toFixed(2)}` : '₹0.00',
      'Commission (Agent)': profitBreakdown.commission > 0 ? `₹${profitBreakdown.commission.toFixed(2)}` : '₹0.00',
      'PNR': booking.pnr || '',
      'Booking Type': booking.train_booking_type || booking.booking_type || '',
      'Booking Reference': booking.booking_reference || '',
      'Created Date': formatDate(booking.created_at),
      'Admin Notes': booking.admin_notes || ''
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // Phone Number
    { wch: 15 }, // Date of Tatkal
    { wch: 15 }, // Date of Journey
    { wch: 25 }, // From & To
    { wch: 12 }, // Class
    { wch: 15 }, // Train No
    { wch: 8 },  // Person
    { wch: 12 }, // Status
    { wch: 20 }, // Booked By
    { wch: 15 }, // Profit
    { wch: 20 }, // Customer Name
    { wch: 20 }, // Email
    { wch: 12 }, // Ticket Cost
    { wch: 12 }, // Actual Price
    { wch: 15 }, // Commission (Agent)
    { wch: 15 }, // PNR
    { wch: 15 }, // Booking Type
    { wch: 20 }, // Booking Reference
    { wch: 12 }, // Created Date
    { wch: 25 }  // Admin Notes
  ];
  
  worksheet['!cols'] = colWidths;
  
  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
  
  // Generate filename with current date if not provided
  const defaultFilename = `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;
  
  // Generate Excel file and save
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    compression: true 
  });
  
  const data = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(data, finalFilename);
};

// Export filtered bookings with custom filename
export const exportFilteredBookings = (
  bookings: Booking[], 
  filterName: string = '',
  dateRange?: { start: Date; end: Date },
  agents?: any[]
) => {
  let filename = 'bookings_export';
  
  if (filterName) {
    filename += `_${filterName.toLowerCase().replace(/\s+/g, '_')}`;
  }
  
  if (dateRange) {
    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];
    filename += `_${startDate}_to_${endDate}`;
  } else {
    filename += `_${new Date().toISOString().split('T')[0]}`;
  }
  
  filename += '.xlsx';
  
  exportBookingsToExcel(bookings, filename, agents);
};
