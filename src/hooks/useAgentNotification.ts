import { useToast } from '@/hooks/use-toast';
import { Agent, Booking } from '@/types/admin';

export const useAgentNotification = () => {
  const { toast } = useToast();

  const sendWhatsAppNotificationToAgent = (agent: Agent, booking: Booking, isPackageBooking = false) => {
    if (!agent.phone) {
      console.warn(`Agent ${agent.name} doesn't have a phone number for WhatsApp notification`);
      toast({
        title: "Notification Warning",
        description: `Cannot send WhatsApp to ${agent.name} - phone number missing. Please update agent profile.`,
        variant: "destructive",
      });
      return false;
    }

    // Validate phone number format and prepare WhatsApp URL
    const validatedPhone = agent.phone.replace(/\D/g, '');
    if (validatedPhone.length < 10) {
      console.warn(`Agent ${agent.name} has invalid phone number: ${agent.phone}`);
      toast({
        title: "Notification Warning", 
        description: `Cannot send WhatsApp to ${agent.name} - invalid phone number. Please update agent profile.`,
        variant: "destructive",
      });
      return false;
    }

    const formatDateToDDMMYYYY = (dateString: string): string => {
      if (!dateString) return 'Not specified';
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (error) {
        return dateString; // Return original if parsing fails
      }
    };

    const formatPassengerInfo = () => {
      if (Array.isArray(booking.passengers)) {
        let info = `*Passengers:* ${booking.passengers.length}\n`;
        booking.passengers.forEach((p: any, i: number) => {
          // Display DOB in DD/MM/YYYY format if available
          const dobDisplay = p.dob ? ` DOB: ${formatDateToDDMMYYYY(p.dob)}` : '';
          // Display Aadhar if available
          const aadharDisplay = p.aadhar ? `\n      Aadhar: ${p.aadhar}` : '';
          info += `   ${i + 1}. ${p.name} (${p.age} yrs, ${p.gender}${dobDisplay})${aadharDisplay}\n`;
        });
        return info;
      }
      return `*Passengers:* ${booking.passengers || 'Not specified'}\n`;
    };

    const bookingTypeDisplay = isPackageBooking ? 'Package Booking' : (() => {
      if (booking.booking_type === 'train' && booking.train_booking_type) {
        switch (booking.train_booking_type) {
          case 'general': return 'General Train Booking';
          case 'tatkal': return 'Tatkal Train Booking';
          case 'premium_tatkal': return 'Premium Tatkal Booking';
          default: return booking.train_booking_type;
        }
      }
      return booking.booking_type ? 
        booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1) + ' Booking' 
        : 'General Booking';
    })();

    const getClassPreferenceInfo = () => {
      if (isPackageBooking) return '';
      
      let classInfo = '';
      
      // Train booking class information
      if (booking.booking_type === 'train') {
        if (booking.class_preference) {
          classInfo += `Class Preference: ${booking.class_preference}\n`;
        }
        if (booking.train_class) {
          classInfo += `Train Class: ${booking.train_class}\n`;
        }
        if (booking.preferred_trains) {
          classInfo += `Preferred Trains: ${booking.preferred_trains}\n`;
        }
      }
      
      // Flight booking class information
      else if (booking.booking_type === 'flight') {
        if ((booking as any).flight_class) {
          const flightClass = (booking as any).flight_class;
          const displayClass = flightClass.charAt(0).toUpperCase() + flightClass.slice(1).replace('_', ' ');
          classInfo += `Flight Class: ${displayClass}\n`;
        }
        if (booking.class_preference) {
          classInfo += `Class Preference: ${booking.class_preference}\n`;
        }
      }
      
      // Bus booking type information
      else if (booking.booking_type === 'bus') {
        if ((booking as any).bus_type) {
          const busType = (booking as any).bus_type.replace('_', ' ').toUpperCase();
          classInfo += `Bus Type: ${busType}\n`;
        }
        if (booking.class_preference) {
          classInfo += `Class Preference: ${booking.class_preference}\n`;
        }
      }
      
      // Cab booking type information
      else if (booking.booking_type === 'cab') {
        if ((booking as any).cab_type) {
          const cabType = (booking as any).cab_type.charAt(0).toUpperCase() + (booking as any).cab_type.slice(1);
          classInfo += `Cab Type: ${cabType}\n`;
        }
        if ((booking as any).cab_trip_type) {
          const tripType = (booking as any).cab_trip_type.replace('_', ' ');
          classInfo += `Trip Type: ${tripType.charAt(0).toUpperCase() + tripType.slice(1)}\n`;
        }
      }
      
      return classInfo;
    };

    const message = 
`🎯 *NEW BOOKING ASSIGNED TO YOU*

Dear *${agent.name}*,

You have been assigned a new booking to handle:

------------------
*Customer Details:*
Name: ${booking.name}
Phone: ${booking.phone}

*Booking Information:*
${isPackageBooking ? 
  `Package: ${(booking as any).package_name || 'Custom Package'}
Destination: ${(booking as any).destination || booking.to || 'Not specified'}
Travel Date: ${formatDateToDDMMYYYY(booking.journey_date)}` :
  `Journey: ${booking.from} to ${booking.to}
Date: ${formatDateToDDMMYYYY(booking.journey_date)}
Service Type: ${bookingTypeDisplay}
${getClassPreferenceInfo()}`
}

${!isPackageBooking ? formatPassengerInfo() : ''}
${booking.additional_requirements ? `Special Requirements: ${booking.additional_requirements}\n` : ''}
------------------


Thank you!
*Anand Travels Admin Team*`;

    // Clean phone number and open WhatsApp
    const whatsappUrl = `https://wa.me/${validatedPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new window
    try {
      window.open(whatsappUrl, '_blank');
      
      // Show success notification
      toast({
        title: "Notification Sent",
        description: `WhatsApp notification sent to ${agent.name}`,
      });
      return true;
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast({
        title: "Notification Error",
        description: `Failed to open WhatsApp for ${agent.name}. Please check manually.`,
        variant: "destructive",
      });
      return false;
    }
  };

  const sendBookingAssignmentNotification = (agent: Agent, booking: Booking) => {
    return sendWhatsAppNotificationToAgent(agent, booking, false);
  };

  const sendPackageAssignmentNotification = (agent: Agent, booking: any) => {
    return sendWhatsAppNotificationToAgent(agent, booking, true);
  };

  return {
    sendBookingAssignmentNotification,
    sendPackageAssignmentNotification,
    sendWhatsAppNotificationToAgent
  };
};
