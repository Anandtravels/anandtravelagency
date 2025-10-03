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
    train_class: '', preferred_trains: '',
    ticket_cost: '', actual_price: '', commission_amount: '', profit_amount: '',
    train_number: '', tatkal_booking_date: ''
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
        ? booking.passengers
            .filter((p: any) => p && (p.name || p.age || p.gender)) // Filter out empty/invalid passengers
            .map((p: any) => `${p.name || ''} (${p.age || ''} yrs, ${p.gender || ''})`).join("\n")
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
      preferred_trains: booking.preferred_trains || '',
      // New pricing fields
      ticket_cost: booking.ticket_cost?.toString() || '',
      actual_price: booking.actual_price?.toString() || '',
      commission_amount: booking.commission_amount?.toString() || '',
      profit_amount: booking.profit_amount?.toString() || '',
      train_number: booking.train_number || '',
      tatkal_booking_date: booking.tatkal_booking_date || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;
    
    try {
      // Validate required fields - trim whitespace before checking
      const trimmedName = editFormData.name?.trim() || '';
      const trimmedPhone = editFormData.phone?.trim() || '';
      const trimmedEmail = editFormData.email?.trim() || '';
      
      // Only name and phone are required, email is optional
      if (!trimmedName || !trimmedPhone) {
        const missingFields = [];
        if (!trimmedName) missingFields.push('Name');
        if (!trimmedPhone) missingFields.push('Phone');
        
        toast({
          title: "Validation Error",
          description: `${missingFields.join(', ')} ${missingFields.length === 1 ? 'is' : 'are'} required`,
          variant: "destructive"
        });
        return;
      }

      // Convert passengers from string back to array format
      let passengersData: any = editFormData.passengers || '';
      
      // If passengers is a string with newlines, convert to array of objects
      if (typeof passengersData === 'string' && passengersData.trim()) {
        const passengerLines = passengersData.split('\n').filter(line => line.trim());
        const invalidPassengers: string[] = [];
        
        passengersData = passengerLines.map((line, index) => {
          // More lenient regex - accepts multiple formats:
          // "Name (Age yrs, Gender)" - standard format
          // "Name (Age, Gender)" - without yrs
          // "Name (Age years, Gender)" - with years
          // Accepts optional spaces around parentheses, comma, etc.
          const match = line.match(/^(.+?)\s*\(?\s*(\d+)\s*(?:yrs?|years?)?\s*[,\s]+\s*(\w+)\s*\)?$/i);
          
          if (match) {
            const name = match[1].trim();
            const age = parseInt(match[2]);
            const gender = match[3].trim().toLowerCase();
            
            // Only return if we have valid data
            if (name && !isNaN(age) && gender) {
              return {
                name: name,
                age: age,
                gender: gender
              };
            }
          }
          
          // Track invalid passenger for error reporting
          invalidPassengers.push(`Line ${index + 1}: "${line}"`);
          return null;
        }).filter(p => p !== null); // Remove null entries
        
        // Show warning if any passengers were rejected
        if (invalidPassengers.length > 0) {
          toast({
            title: "Some Passengers Were Not Added",
            description: `Invalid format detected:\n${invalidPassengers.join('\n')}\n\nCorrect format: Name (Age yrs, Gender)\nExample: John Doe (30 yrs, male)`,
            variant: "destructive"
          });
          return; // Stop the save process
        }
      } else if (typeof passengersData === 'string' && !passengersData.trim()) {
        // If empty string, set to empty array
        passengersData = [];
      }
      
      // Convert string fields back to numbers for pricing fields
      // Handle empty strings by setting to undefined (Firebase will ignore these)
      const updateData: any = {
        name: trimmedName,
        email: trimmedEmail || '', // Email is optional, can be empty
        phone: trimmedPhone,
        from: editFormData.from?.trim() || '',
        to: editFormData.to?.trim() || '',
        journey_date: editFormData.journey_date || '',
        passengers: passengersData,
        additional_requirements: editFormData.additional_requirements?.trim() || '',
        booking_type: editFormData.booking_type || '',
        status: editFormData.status || 'pending',
        station_name: editFormData.station_name?.trim() || '',
        travel_class: editFormData.travel_class || '',
        boarding_point: editFormData.boarding_point?.trim() || '',
        drop_point: editFormData.drop_point?.trim() || '',
        class_preference: editFormData.class_preference || '',
        ticket_number: editFormData.ticket_number?.trim() || '',
        pnr: editFormData.pnr?.trim() || '',
        booking_reference: editFormData.booking_reference?.trim() || '',
        payment_status: editFormData.payment_status || 'pending',
        fare_details: editFormData.fare_details?.trim() || '',
        train_booking_type: editFormData.train_booking_type || '',
        train_class: editFormData.train_class || '',
        preferred_trains: editFormData.preferred_trains?.trim() || '',
        train_number: editFormData.train_number?.trim() || '',
        tatkal_booking_date: editFormData.tatkal_booking_date || '',
        updated_at: serverTimestamp()
      };

      // Add numeric fields only if they have valid values
      if (editFormData.ticket_cost && editFormData.ticket_cost !== '') {
        updateData.ticket_cost = parseFloat(editFormData.ticket_cost);
      }
      if (editFormData.actual_price && editFormData.actual_price !== '') {
        updateData.actual_price = parseFloat(editFormData.actual_price);
      }
      if (editFormData.commission_amount && editFormData.commission_amount !== '') {
        updateData.commission_amount = parseFloat(editFormData.commission_amount);
      }
      if (editFormData.profit_amount && editFormData.profit_amount !== '') {
        updateData.profit_amount = parseFloat(editFormData.profit_amount);
      }

      console.log('Updating booking with data:', updateData); // Debug log

      await updateDoc(doc(db, 'bookings', editBooking.id), updateData);
      setEditModalOpen(false);
      toast({
        title: "Changes Saved",
        description: "Booking details have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      
      // More detailed error handling
      let errorMessage = "Failed to update booking details";
      if (error instanceof Error) {
        errorMessage = `${error.message}`;
        console.error("Full error details:", error);
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return { editModalOpen, setEditModalOpen, editBooking, editFormData, setEditFormData, openEditModal, handleSaveEdit };
};
