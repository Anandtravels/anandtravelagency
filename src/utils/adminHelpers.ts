export const formatFirebaseTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    let date: Date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds ? Math.floor(timestamp.nanoseconds / 1000000) : 0));
    } else {
      try {
        date = new Date(timestamp);
      } catch (error) {
        return "Invalid Date";
      }
    }
    
    if (isNaN(date.getTime())) return "Invalid Date";
    
    // Format in IST (Asia/Kolkata) with seconds and milliseconds
    const istStr = date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true
    });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${istStr}.${ms} IST`;
};

export const calculateBookingCharge = (bookingType: string, classPreference?: string): number => {
  // For General booking, always return 100 regardless of class
  if (bookingType === 'General Booking' || bookingType === 'General') {
    return 100;
  }
  
  // For Tatkal bookings, charge depends on class preference
  if (bookingType === 'Tatkal Booking' || bookingType === 'Tatkal') {
    switch(classPreference) {
      case 'SL': // Sleeper
      case 'Sleeper':
        return 250;
      case '3A': // 3AC
      case '3E': // 3E
      case '3AC':
      case '3AC/3E':
        return 350;
      case '2A': // 2AC
      case '2AC':
        return 400;
      default:
        return 250; // Default to Sleeper rate
    }
  }
  
  // Legacy support for old booking type names
  switch(bookingType) {
    case 'Tatkal Sleeper':
      return 250;
    case 'Tatkal 3AC':
      return 350;
    case 'Tatkal 2AC':
      return 400;
    case 'Premium Booking':
      return 400;
    case 'Advance Reservation':
      return 150;
    default:
      return 100;
  }
};
