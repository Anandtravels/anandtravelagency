import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { Agent, Booking } from '@/types/admin';

export const useTicketAssignment = (bookings: Booking[], agents: Agent[]) => {
  const { user } = useAuth();
  const { toast } = useToast();

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

      await updateDoc(doc(db, 'bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });

      const booking = bookings.find((b) => b.id === bookingId);
      const agent = agents.find((a) => a.email === agentEmail);

      if (booking && agent) {
        toast({ title: "Booking Assigned", description: `Booking for ${booking.name} has been assigned to ${agent.name}.` });
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

      await updateDoc(doc(db, 'package_bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });

      const agent = agents.find((a) => a.email === agentEmail);
      if (agent) {
        toast({ title: "Package Assigned", description: `Package booking assigned to ${agent.name}.` });
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
