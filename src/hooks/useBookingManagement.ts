import { useCallback, useState } from 'react';
import { doc, updateDoc, deleteDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash/debounce';
import { useAuth } from '@/lib/auth';

export const useBookingManagement = (setAdminNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingsToDelete, setBookingsToDelete] = useState<string[]>([]);
  const [deletedBookings, setDeletedBookings] = useState<{ [key: string]: any }>({});

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
