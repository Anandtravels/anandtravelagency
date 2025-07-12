export const formatFirebaseTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString("en-GB", {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    
    try {
      return new Date(timestamp).toLocaleDateString("en-GB", {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
};

export const calculateBookingCharge = (bookingType: string, ticketCost: number): number => {
  switch(bookingType) {
    case 'Tatkal Booking':
      return 200;
    case 'Premium Booking':
      return 250;
    case 'General Booking':
    default:
      return 50;
  }
};
