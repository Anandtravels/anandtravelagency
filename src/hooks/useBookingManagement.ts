import { useCallback } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash/debounce';
import { useAuth } from '@/lib/auth';

export const useBookingManagement = (setAdminNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'completed' | 'in_process' | 'booked' | 'hold') => {
    if (!user || user.email !== 'admin@anandtravels.com') {
      toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
      return;
    }
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email,
      });
      toast({ title: "Status Updated", description: "Booking status updated successfully." });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Update Failed", description: "Failed to update booking status.", variant: "destructive" });
    }
  };

  const deleteBookings = async (ids: string[]) => {
    if (!user || user.email !== 'admin@anandtravels.com') {
        toast({ title: "Unauthorized", description: "You don't have permission to do this.", variant: "destructive" });
        return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete ${ids.length > 1 ? 'these ' + ids.length + ' bookings' : 'this booking'}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, 'bookings', id))));
      toast({ title: "Deleted Successfully", description: `${ids.length > 1 ? ids.length + ' bookings have' : 'Booking has'} been deleted.` });
    } catch (error) {
      console.error("Error deleting bookings:", error);
      toast({ title: "Delete Failed", description: "Failed to delete bookings.", variant: "destructive" });
    }
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

  return { updateBookingStatus, deleteBookings, handleNoteChange, debouncedNoteUpdate };
};
