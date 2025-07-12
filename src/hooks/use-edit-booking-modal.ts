import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking, EditFormData } from '@/types/admin';

export const useEditBookingModal = () => {
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: '', email: '', phone: '', from: '', to: '', journey_date: '',
    passengers: '', additional_requirements: '', booking_type: '', status: 'pending',
    station_name: '', travel_class: '', boarding_point: '', drop_point: '',
    class_preference: '', ticket_number: '', pnr: '', booking_reference: '',
    payment_status: 'pending', fare_details: '', train_booking_type: '',
    train_class: '', preferred_trains: ''
  });

  const openEditModal = (booking: Booking) => {
    setEditBooking(booking);
    setEditFormData({
      name: booking.name || '',
      email: booking.email || '',
      phone: booking.phone || '',
      from: booking.from || '',
      to: booking.to || '',
      journey_date: booking.journey_date || '',
      passengers: Array.isArray(booking.passengers)
        ? booking.passengers.map((p: any) => `${p.name} (${p.age} yrs, ${p.gender})`).join("\n")
        : booking.passengers || '',
      additional_requirements: booking.additional_requirements || '',
      booking_type: booking.booking_type || '',
      status: booking.status || 'pending',
      station_name: booking.station_name || '',
      travel_class: booking.travel_class || '',
      boarding_point: booking.boarding_point || '',
      drop_point: booking.drop_point || '',
      class_preference: booking.class_preference || '',
      ticket_number: booking.ticket_number || '',
      pnr: booking.pnr || '',
      booking_reference: booking.booking_reference || '',
      payment_status: booking.payment_status || 'pending',
      fare_details: booking.fare_details || '',
      train_booking_type: booking.train_booking_type || '',
      train_class: booking.train_class || '',
      preferred_trains: booking.preferred_trains || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    try {
      await updateDoc(doc(db, 'bookings', editBooking.id), {
        ...editFormData,
        updated_at: serverTimestamp()
      });
      setEditModalOpen(false);
      toast({
        title: "Changes Saved",
        description: "Booking details have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking details",
        variant: "destructive"
      });
    }
  };

  return { editModalOpen, setEditModalOpen, editBooking, editFormData, setEditFormData, openEditModal, handleSaveEdit };
};
