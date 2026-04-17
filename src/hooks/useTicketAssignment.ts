import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Agent, Booking } from '@/types/admin';
import { useAgentNotification } from '@/hooks/useAgentNotification';

export const useTicketAssignment = (bookings: Booking[], agents: Agent[]) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendBookingAssignmentNotification, sendPackageAssignmentNotification } = useAgentNotification();

  const assignTicket = async (bookingId: string, agentEmail: string) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }
    try {
      if (!agentEmail) {
        await updateDoc(doc(db, 'bookings', bookingId), {
          assignedAgent: null,
          assignedAt: null,
          updated_at: serverTimestamp(),
          updated_by: user.email,
        });
        toast({ title: "Agent Unassigned", description: "Agent has been removed from this booking." });
        return;
      }

      const selectedAgent = agents.find((a) => a.email === agentEmail);
      
      // Validate agent has phone number for notifications
      if (selectedAgent && (!selectedAgent.phone || selectedAgent.phone.replace(/\D/g, '').length < 10)) {
        const proceed = window.confirm(
          `Agent ${selectedAgent.name} doesn't have a valid phone number. They won't receive WhatsApp notifications. Assign anyway?`
        );
        if (!proceed) {
          return;
        }
      }

      await updateDoc(doc(db, 'bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });

      const booking = bookings.find((b) => b.id === bookingId);

      if (booking && selectedAgent) {
        toast({ title: "Booking Assigned", description: `Booking for ${booking.name} has been assigned to ${selectedAgent.name}.` });
        
        // Send FCM push notification to the agent
        try {
          const res = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'booking_assigned',
              payload: {
                agentEmail,
                bookingId,
                customerName: booking.name || 'Customer',
                from: booking.from || '',
                to: booking.to || '',
              }
            })
          });
          const result = await res.json();
          console.log(`[BookingAssignment] FCM notification result for ${agentEmail}:`, result);
          if (result.success) {
            console.log(`[BookingAssignment] ✅ Push notification sent to ${selectedAgent.name} (${agentEmail}) — ${result.sent}/${result.total} devices`);
          } else {
            console.warn(`[BookingAssignment] ⚠️ Push notification may have failed:`, result);
          }
        } catch (notifErr) {
          console.error(`[BookingAssignment] ❌ Failed to send push notification to ${agentEmail}:`, notifErr);
        }

        // Send WhatsApp notification to the agent
        setTimeout(() => {
          const notificationSent = sendBookingAssignmentNotification(selectedAgent, booking);
          if (!notificationSent && !selectedAgent.phone) {
            // Additional notification for missing phone
            toast({
              title: "Action Required",
              description: `Agent ${selectedAgent.name} needs a phone number for WhatsApp notifications. Please update their profile.`,
              variant: "destructive",
            });
          }
        }, 1000); // Small delay to ensure the toast appears first
      } else {
        toast({ title: "Booking Assigned", description: "Booking assigned successfully." });
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast({ title: "Assignment Failed", description: "Failed to assign booking.", variant: "destructive" });
    }
  };

  const assignPackageTicket = async (bookingId: string, agentEmail: string) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }
    try {
      if (!agentEmail) {
        await updateDoc(doc(db, 'package_bookings', bookingId), {
          assignedAgent: null,
          assignedAt: null,
          updated_at: serverTimestamp(),
          updated_by: user.email,
        });
        toast({ title: "Agent Unassigned", description: "Agent has been removed from this package booking." });
        return;
      }

      const selectedAgent = agents.find((a) => a.email === agentEmail);
      
      // Validate agent has phone number for notifications
      if (selectedAgent && (!selectedAgent.phone || selectedAgent.phone.replace(/\D/g, '').length < 10)) {
        const proceed = window.confirm(
          `Agent ${selectedAgent.name} doesn't have a valid phone number. They won't receive WhatsApp notifications. Assign anyway?`
        );
        if (!proceed) {
          return;
        }
      }

      await updateDoc(doc(db, 'package_bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });

      if (selectedAgent) {
        toast({ title: "Package Assigned", description: `Package booking assigned to ${selectedAgent.name}.` });
        
        // Fetch package booking details and send WhatsApp notification
        setTimeout(async () => {
          try {
            const packageBookingDoc = await getDoc(doc(db, 'package_bookings', bookingId));
            if (packageBookingDoc.exists()) {
              const packageData = packageBookingDoc.data();
              
              // Create a booking-like object for the notification
              const packageBookingForNotification = {
                id: bookingId,
                name: packageData.name || 'Package Customer',
                phone: packageData.phone || packageData.contact_phone || '',
                email: packageData.email || packageData.contact_email || '',
                from: packageData.departure_location || '',
                to: packageData.destination || packageData.package_destination || '',
                journey_date: packageData.travel_date || packageData.departure_date || '',
                passengers: packageData.travelers || packageData.passenger_count || '1',
                booking_type: 'package' as const,
                status: 'pending' as const,
                created_at: packageData.created_at?.toDate() || new Date(),
                additional_requirements: packageData.special_requests || packageData.requirements || ''
              };
              
              const notificationSent = sendPackageAssignmentNotification(selectedAgent, packageBookingForNotification);
              if (!notificationSent && !selectedAgent.phone) {
                // Additional notification for missing phone
                toast({
                  title: "Action Required",
                  description: `Agent ${selectedAgent.name} needs a phone number for WhatsApp notifications. Please update their profile.`,
                  variant: "destructive",
                });
              }
            }
          } catch (error) {
            console.error('Error fetching package booking details for notification:', error);
          }
        }, 1000);
      } else {
        toast({ title: "Package Assigned", description: "Package booking assigned successfully." });
      }
    } catch (error) {
      console.error("Error assigning package:", error);
      toast({ title: "Assignment Failed", description: "Failed to assign package booking.", variant: "destructive" });
    }
  };

  return { assignTicket, assignPackageTicket };
};
