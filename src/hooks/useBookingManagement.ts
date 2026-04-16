import { useCallback, useState } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash/debounce';
import { useAuth } from '@/lib/auth';
import { whatsappService } from '@/services/whatsappService';

// Statuses that trigger automatic WhatsApp messages
const WHATSAPP_AUTO_STATUSES = ['completed', 'in_process', 'booked', 'hold'] as const;

export const useBookingManagement = (
  setAdminNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
  onStatusChangeToBooked?: (bookingId: string, booking: any) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingsToDelete, setBookingsToDelete] = useState<string[]>([]);
  const [deletedBookings, setDeletedBookings] = useState<{ [key: string]: any }>({});

  const updateBookingStatus = async (
    bookingId: string, 
    status: 'pending' | 'completed' | 'in_process' | 'booked' | 'hold' | 'agent_done' | 'failed' | 'refund',
    booking?: any
  ) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
      return;
    }

    // If status is being changed to "booked", trigger the price modal instead
    if (status === 'booked' && onStatusChangeToBooked && booking) {
      onStatusChangeToBooked(bookingId, booking);
      return;
    }

    try {
      // Determine if WhatsApp should be sent for this status
      const shouldSendWhatsApp = (WHATSAPP_AUTO_STATUSES as readonly string[]).includes(status) &&
        booking && booking.phone;

      console.log(`[StatusChange] ── Booking: ${bookingId}, Status: ${status}, Phone: ${booking?.phone || 'N/A'}, WillSendWhatsApp: ${shouldSendWhatsApp}`);

      // Update status in Firestore first (do NOT set whatsapp flag yet)
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });
      toast({ title: "Status Updated", description: "Booking status updated successfully." });

      // Now attempt WhatsApp message — only mark flag after confirmed success
      if (shouldSendWhatsApp) {
        whatsappService.sendStatusChangeMessage(status, booking).then(async (sent) => {
          if (sent) {
            // Mark as sent ONLY after confirmed success
            try {
              await updateDoc(doc(db, 'bookings', bookingId), {
                [`whatsapp_auto_sent.${status}`]: true,
              });
            } catch (flagErr) {
              console.warn('[StatusChange] Failed to set whatsapp_auto_sent flag:', flagErr);
            }
            toast({ title: "WhatsApp Sent ✅", description: `Status notification sent to ${booking.name || 'customer'}.` });
          }
        }).catch((err: any) => {
          console.error(`[StatusChange] ❌ WhatsApp FAILED for booking ${bookingId}:`, err.message || err);
          toast({
            title: "WhatsApp Failed",
            description: `Could not send status message to ${booking.name || 'customer'}. Check console for details.`,
            variant: "destructive"
          });
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Update Failed", description: "Failed to update booking status.", variant: "destructive" });
    }
  };

  const updateBookingStatusDirect = async (
    bookingId: string,
    status: 'pending' | 'completed' | 'in_process' | 'booked' | 'hold' | 'agent_done' | 'failed' | 'refund',
    booking?: any
  ) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
      return;
    }
    try {
      const shouldSendWhatsApp = (WHATSAPP_AUTO_STATUSES as readonly string[]).includes(status) &&
        booking && booking.phone;

      console.log(`[StatusChangeDirect] ── Booking: ${bookingId}, Status: ${status}, Phone: ${booking?.phone || 'N/A'}, WillSendWhatsApp: ${shouldSendWhatsApp}`);

      // Update status first (do NOT set whatsapp flag yet)
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });
      toast({ title: "Status Updated", description: "Booking status updated successfully." });

      // Send WhatsApp and mark flag only on confirmed success
      if (shouldSendWhatsApp) {
        whatsappService.sendStatusChangeMessage(status, booking).then(async (sent) => {
          if (sent) {
            try {
              await updateDoc(doc(db, 'bookings', bookingId), {
                [`whatsapp_auto_sent.${status}`]: true,
              });
            } catch (flagErr) {
              console.warn('[StatusChangeDirect] Failed to set whatsapp_auto_sent flag:', flagErr);
            }
            toast({ title: "WhatsApp Sent ✅", description: `Status notification sent to ${booking.name || 'customer'}.` });
          }
        }).catch((err: any) => {
          console.error(`[StatusChangeDirect] ❌ WhatsApp FAILED for booking ${bookingId}:`, err.message || err);
          toast({
            title: "WhatsApp Failed",
            description: `Could not send status message to ${booking.name || 'customer'}. Check console for details.`,
            variant: "destructive"
          });
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Update Failed", description: "Failed to update booking status.", variant: "destructive" });
    }
  };

  const initiateDelete = async (ids: string[]) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }
    setBookingsToDelete(ids);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }

    try {
      // Fetch full booking data before deletion for undo functionality
      const bookingData: { [key: string]: any } = {};
      
      // Fetch all bookings that will be deleted
      const fetchPromises = bookingsToDelete.map(async (id) => {
        const bookingDoc = await getDoc(doc(db, 'bookings', id));
        if (bookingDoc.exists()) {
          bookingData[id] = { id, ...bookingDoc.data() };
        }
      });
      
      await Promise.all(fetchPromises);
      setDeletedBookings(bookingData);
      
      // Now delete the bookings
      await Promise.all(bookingsToDelete.map((id) => deleteDoc(doc(db, 'bookings', id))));
      
      // Don't show toast immediately - will show undo notification
    } catch (error) {
      console.error("Error deleting bookings:", error);
      toast({ title: "Delete Failed", description: "Failed to delete bookings.", variant: "destructive" });
      setDeleteModalOpen(false);
    }
  };

  const undoDelete = async () => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }

    try {
      // Restore all deleted bookings
      const restorePromises = Object.keys(deletedBookings).map(async (id) => {
        const bookingData = deletedBookings[id];
        // Remove the id field from data as it's already in the document reference
        const { id: _, ...dataWithoutId } = bookingData;
        
        // Restore the booking document
        await setDoc(doc(db, 'bookings', id), {
          ...dataWithoutId,
          updated_at: serverTimestamp(),
          restored_at: serverTimestamp(),
          restored_by: user.email
        });
      });
      
      await Promise.all(restorePromises);
      
      toast({ 
        title: "Bookings Restored", 
        description: `Successfully restored ${Object.keys(deletedBookings).length} booking${Object.keys(deletedBookings).length > 1 ? 's' : ''}.`,
      });
      
      setDeletedBookings({});
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error restoring bookings:", error);
      toast({ 
        title: "Restore Failed", 
        description: "Failed to restore deleted bookings. Please contact support.", 
        variant: "destructive" 
      });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setBookingsToDelete([]);
    setDeletedBookings({});
  };

  const debouncedNoteUpdate = useCallback(
    debounce(async (id: string, note: string, collectionName: string) => {
      try {
        await updateDoc(doc(db, collectionName, id), {
          admin_notes: note,
          updated_at: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating note:", error);
        toast({ title: "Update Failed", description: "Failed to save note.", variant: "destructive" });
      }
    }, 1000),
    [toast]
  );

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({ ...prev, [id]: note }));
    debouncedNoteUpdate(id, note, 'bookings');
  }, [debouncedNoteUpdate, setAdminNotes]);

  return { 
    updateBookingStatus,
    updateBookingStatusDirect,
    initiateDelete, 
    confirmDelete,
    undoDelete,
    closeDeleteModal,
    deleteModalOpen,
    bookingsToDelete,
    handleNoteChange, 
    debouncedNoteUpdate 
  };
};
