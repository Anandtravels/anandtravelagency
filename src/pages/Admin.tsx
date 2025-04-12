import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { collection, getDocs, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from "@/components/ui/checkbox";
import { TrashIcon, PencilIcon, Check, X, Phone, Mail, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import debounce from 'lodash/debounce';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Admin = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State declarations
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    from: '',
    to: '',
    journey_date: '',
    passengers: '',
    additional_requirements: '',
    booking_type: '',
    status: 'pending',
    station_name: '',
    travel_class: '',
    boarding_point: '',
    drop_point: '',
    class_preference: '',
    ticket_number: '',
    pnr: '',
    booking_reference: '',
    payment_status: 'pending',
    fare_details: '',
    train_booking_type: '',
    train_class: '',
    preferred_trains: ''
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    address: '',
    email: '',
    password: ''
  });
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [messageDetails, setMessageDetails] = useState({
    ticketCost: '',
    bookingCharge: '',
    totalAmount: '',
    additionalInfo: '',
    bookingType: 'General Booking' // Add booking type with default value
  });
  const [packageBookings, setPackageBookings] = useState<any[]>([]);
  const [packageBookingLoading, setPackageBookingLoading] = useState(true);
  const [selectedPackageBookings, setSelectedPackageBookings] = useState<string[]>([]);
  const [packageStatusFilter, setPackageStatusFilter] = useState<string>('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);

  // Memoized values
  const combinedLoading = useMemo(() => bookingLoading || contactsLoading, [bookingLoading, contactsLoading]);

  const bookingStats = useMemo(() => {
    const pending = bookings.filter(b => !b.status || b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const total = bookings.length;
    
    return { pending, completed, total };
  }, [bookings]);
  
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(b => !b.status || b.status === 'pending');
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(b => b.status === 'completed');
      } else if (statusFilter === 'payment_done') {
        filtered = filtered.filter(b => b.payment_status === 'completed');
      } else if (statusFilter === 'payment_not_done') {
        filtered = filtered.filter(b => !b.payment_status || b.payment_status === 'pending');
      } else if (statusFilter === 'in_process') {
        filtered = filtered.filter(b => b.status === 'in_process');
      } else if (statusFilter === 'booked') {
        filtered = filtered.filter(b => b.status === 'booked');
      }
    }
    
    // Apply booking type filter
    if (bookingTypeFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_type === bookingTypeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Format the dates as strings to match the journey_date format (YYYY-MM-DD)
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const todayStr = formatDate(today);
      const tomorrowStr = formatDate(tomorrow);
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(b => b.journey_date === todayStr);
      } else if (dateFilter === 'tomorrow') {
        filtered = filtered.filter(b => b.journey_date === tomorrowStr);
      }
    }
    
    return filtered;
  }, [bookings, statusFilter, bookingTypeFilter, dateFilter]);

  const packageBookingStats = useMemo(() => {
    const pending = packageBookings.filter(b => !b.status || b.status === 'pending').length;
    const completed = packageBookings.filter(b => b.status === 'completed').length;
    const total = packageBookings.length;
    
    return { pending, completed, total };
  }, [packageBookings]);
  
  const filteredPackageBookings = useMemo(() => {
    if (packageStatusFilter === 'all') return packageBookings;
    if (packageStatusFilter === 'pending') return packageBookings.filter(b => !b.status || b.status === 'pending');
    if (packageStatusFilter === 'completed') return packageBookings.filter(b => b.status === 'completed');
    return packageBookings;
  }, [packageBookings, packageStatusFilter]);

  // Debounced functions
  const debouncedNoteUpdate = useCallback(
    debounce(async (id: string, note: string, collectionName: string) => {
      try {
        await updateDoc(doc(db, collectionName, id), {
          admin_notes: note,
          updated_at: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating note:", error);
        toast({
          title: "Update Failed",
          description: "Failed to save note",
          variant: "destructive"
        });
      }
    }, 1000),
    [toast]
  );

  const handleNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({
      ...prev,
      [id]: note
    }));
    debouncedNoteUpdate(id, note, 'bookings');
  }, [debouncedNoteUpdate]);

  const handleMessageNoteChange = useCallback((id: string, note: string) => {
    setAdminNotes(prev => ({
      ...prev,
      [id]: note
    }));
    debouncedNoteUpdate(id, note, 'contact_submissions');
  }, [debouncedNoteUpdate]);

  // Effects
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user || user.email !== 'admin@anandtravels.com') {
          navigate("/admin-login", { replace: true });
        } else {
          const unsubscribe = setupRealtimeListeners();
          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          };
        }
      }
    };
    checkAuth();
  }, [user, loading, navigate]);

  useEffect(() => {
    return () => {
      debouncedNoteUpdate.cancel();
    };
  }, [debouncedNoteUpdate]);

  // Helper functions
  const formatFirebaseTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    if (timestamp.seconds) {
      return format(new Date(timestamp.seconds * 1000), "dd MMM yyyy, HH:mm");
    }
    
    try {
      return format(new Date(timestamp), "dd MMM yyyy, HH:mm");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const setupRealtimeListeners = () => {
    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('created_at', 'desc')
    );

    const bookingsUnsubscribe = onSnapshot(bookingsQuery, 
      (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Update adminNotes state with existing notes
          setAdminNotes(prev => ({
            ...prev,
            [doc.id]: data.admin_notes || ''
          }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date()
          };
        });
        setBookings(bookingsData);
        setBookingLoading(false);
      },
      (error) => {
        console.error("Error listening to bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        });
      }
    );

    // Set up real-time listener for contact messages
    const contactsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('created_at', 'desc')
    );

    const contactsUnsubscribe = onSnapshot(contactsQuery, 
      (snapshot) => {
        const contactsData = snapshot.docs.map(doc => {
          const data = doc.data();
          setAdminNotes(prev => ({
            ...prev,
            [doc.id]: data.admin_notes || ''
          }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date()
          };
        });
        setContacts(contactsData);
        setContactsLoading(false);
      },
      (error) => {
        console.error("Error listening to contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contact messages",
          variant: "destructive",
        });
      }
    );

    // Add agents listener
    const agentsQuery = query(
      collection(db, 'agents'),
      orderBy('created_at', 'desc')
    );

    const agentsUnsubscribe = onSnapshot(agentsQuery, 
      (snapshot) => {
        const agentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAgents(agentsData);
      },
      (error) => {
        console.error("Error listening to agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents data",
          variant: "destructive",
        });
      }
    );

    // Add package bookings listener
    const packageBookingsQuery = query(
      collection(db, 'package_bookings'),
      orderBy('created_at', 'desc')
    );

    const packageBookingsUnsubscribe = onSnapshot(packageBookingsQuery, 
      (snapshot) => {
        const packageBookingsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Update adminNotes state with existing notes
          setAdminNotes(prev => ({
            ...prev,
            [doc.id]: data.admin_notes || ''
          }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date()
          };
        });
        setPackageBookings(packageBookingsData);
        setPackageBookingLoading(false);
      },
      (error) => {
        console.error("Error listening to package bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load package booking data",
          variant: "destructive",
        });
      }
    );

    // Return cleanup function
    return () => {
      bookingsUnsubscribe();
      contactsUnsubscribe();
      agentsUnsubscribe();
      packageBookingsUnsubscribe();
    };
  };

  if (!user || user.email !== 'admin@anandtravels.com') {
    return null;
  }

  // Action handlers
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/admin-login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Sign out failed: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'completed' | 'in_process' | 'booked') => {
    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await updateDoc(doc(db, 'bookings', bookingId), { 
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email
      });

      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const deleteBookings = async (ids: string[]) => {
    if (!window.confirm('Are you sure you want to delete the selected bookings?')) return;

    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await Promise.all(ids.map(id => deleteDoc(doc(db, 'bookings', id))));
      setSelectedBookings([]);
      
      toast({
        title: "Deleted Successfully",
        description: "Selected bookings have been deleted",
      });
    } catch (error) {
      console.error("Error deleting bookings:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete bookings. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const deleteMessages = async (ids: string[]) => {
    if (!window.confirm('Are you sure you want to delete the selected messages?')) return;

    try {
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await Promise.all(ids.map(id => deleteDoc(doc(db, 'contact_submissions', id))));
      setSelectedMessages([]);
      
      toast({
        title: "Deleted Successfully",
        description: "Selected messages have been deleted",
      });
    } catch (error) {
      console.error("Error deleting messages:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete messages. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (booking: any) => {
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

  const handleSaveEdit = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
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

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleWhatsapp = (phone: string, booking?: any) => {
    if (booking) {
      setCurrentBooking(booking);
      setWhatsappModal(true);
      
      // Set the booking type from the customer's original selection if available
      const initialBookingType = booking.booking_type || 'General Booking';
      
      setMessageDetails({
        ticketCost: '',
        bookingCharge: '',
        totalAmount: '',
        additionalInfo: '',
        bookingType: initialBookingType
      });
    } else {
      // Direct WhatsApp chat without booking context
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const calculateBookingCharge = (bookingType: string, basePrice: number): number => {
    switch(bookingType) {
      case 'Tatkal Booking':
        return 200; // Fixed ₹200 for Tatkal
      case 'Premium Booking':
        return Math.max(200, basePrice * 0.15); // Minimum ₹200 or 15% whichever is higher
      case 'General Booking':
      default:
        return 50; // Fixed ₹50 for General
    }
  };

  const calculateTotal = () => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    let bookingCharge = parseFloat(messageDetails.bookingCharge) || 0;
    
    // If booking charge was not manually set, calculate it based on booking type
    if (messageDetails.bookingCharge === '') {
      bookingCharge = calculateBookingCharge(messageDetails.bookingType, ticketCost);
    }
    
    return (ticketCost + bookingCharge).toFixed(2);
  };

  const handleBookingTypeChange = (type: string) => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    const bookingCharge = calculateBookingCharge(type, ticketCost);
    
    setMessageDetails({
      ...messageDetails,
      bookingType: type,
      bookingCharge: bookingCharge.toString()
    });
  };

  const sendWhatsappMessage = () => {
    if (!currentBooking) return;
    
    // Format passengers data
    let passengerInfo = '';
    if (Array.isArray(currentBooking.passengers)) {
      passengerInfo = `*Passengers:* ${currentBooking.passengers.length}\n`;
      currentBooking.passengers.forEach((passenger: any, index: number) => {
        passengerInfo += `   ${index + 1}. ${passenger.name} (${passenger.age} yrs, ${passenger.gender})\n`;
      });
    } else {
      passengerInfo = `*Passengers:* ${currentBooking.passengers}\n`;
    }
    
    // Build the formatted message  based on booking type
    let pricingDetails = '';
    
    if (messageDetails.bookingType === 'Tatkal Booking') {
      pricingDetails = 
`*Pricing Details:*
Tatkal Cost: ₹${messageDetails.ticketCost}
Tatkal Booking Charge: ₹${messageDetails.bookingCharge}
*Total Amount: ₹${calculateTotal()}*`;
    } else if (messageDetails.bookingType === 'Premium Booking') {
      pricingDetails = 
`*Pricing Details:*
Premium Ticket Cost: ₹${messageDetails.ticketCost}
Premium Booking Charge: ₹${messageDetails.bookingCharge}
*Total Amount: ₹${calculateTotal()}*`;
    } else {
      pricingDetails = 
`*Pricing Details:*
Ticket Cost: ₹${messageDetails.ticketCost}
Booking Charge: ₹${messageDetails.bookingCharge}
*Total Amount: ₹${calculateTotal()}*`;
    }
    
    // Build the complete message
    const message = 
`Dear *${currentBooking.name}*,

Thank you for your booking request with Anand Travels!
------------------
*Booking Details:*
Journey: ${currentBooking.from} to ${currentBooking.to}
Date: ${currentBooking.journey_date}
Service Type: ${messageDetails.bookingType}
${passengerInfo}
${currentBooking.additional_requirements ? `Special Requirements: ${currentBooking.additional_requirements}\n` : ''}
------------------
${pricingDetails}

${messageDetails.additionalInfo ? `\n${messageDetails.additionalInfo}\n` : ''}
------------------

*Payment Information:*
PhonePe/UPI: 8985816481 or 9676138010
Account Holder: Pinisetty Naga Satya Surya Shiva Anand
------------------
Please complete the payment to confirm your booking.
For any queries, feel free to contact us.

Thank you for choosing Anand Travels!`;

    // Open WhatsApp with the message
    window.open(`https://wa.me/${currentBooking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    setWhatsappModal(false);
  };

  const createAgent = async (data: any) => {
    try {
      // First check if the email already exists
      const agentsQuery = query(
        collection(db, 'agents'),
        where('email', '==', data.email.toLowerCase())
      );
      const existingAgents = await getDocs(agentsQuery);
      if (!existingAgents.empty && !editingAgentId) {
        toast({
          title: "Error",
          description: "An agent with this email already exists",
          variant: "destructive"
        });
        return;
      }

      if (editingAgentId) {
        // If editing, update the existing agent
        await updateDoc(doc(db, 'agents', editingAgentId), {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          age: data.age.toString(),
          gender: data.gender,
          address: data.address,
          role: 'agent',
          updated_at: serverTimestamp(),
          updated_by: user.email
        });
        
        toast({
          title: "Agent Updated",
          description: "Agent information has been updated successfully."
        });
      } else {
        // If creating new agent, add the agent to Firestore
        const agentData = {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          age: data.age.toString(),
          gender: data.gender,
          address: data.address,
          role: 'agent',
          created_at: serverTimestamp(),
          created_by: user.email,
          updated_at: serverTimestamp(),
          // Add these fields to trigger the AuthAccountCreator
          needsAuthAccount: true,
          password: data.password
        };
        
        // Add to agents collection
        await addDoc(collection(db, 'agents'), agentData);
        
        toast({
          title: "Agent Created",
          description: "New agent has been added successfully. They can now login using their email and password."
        });
      }
      
      // Reset state
      setShowAgentForm(false);
      setEditingAgentId(null);
      setAgentFormData({
        name: '',
        age: '',
        gender: 'male',
        phone: '',
        address: '',
        email: '',
        password: ''
      });
    } catch (error: any) {
      console.error('Error creating/updating agent:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create/update agent",
        variant: "destructive"
      });
    }
  };

  const assignTicket = async (bookingId: string, agentEmail: string) => {
    try {
      // If agentEmail is empty, this means "Select Agent" was chosen (unassign agent)
      if (!agentEmail) {
        // Remove the agent assignment
        await updateDoc(doc(db, 'bookings', bookingId), {
          assignedAgent: null,
          assignedAt: null
        });
        
        toast({
          title: "Agent Unassigned",
          description: "Agent has been removed from this booking"
        });
        return;
      }
      
      // If code reaches here, a valid agent is being assigned
      await updateDoc(doc(db, 'bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp()
      });

      // Format WhatsApp message with detailed information
      const booking = bookings.find(b => b.id === bookingId);
      
      // Format passenger information
      let passengerInfo = '';
      if (Array.isArray(booking.passengers)) {
        passengerInfo = `${booking.passengers.length} passenger(s):\n`;
        booking.passengers.forEach((passenger: any, index: number) => {
          passengerInfo += `   ${index + 1}. ${passenger.name} (${passenger.age} yrs, ${passenger.gender})\n`;
        });
      } else {
        passengerInfo = `Passengers: ${booking.passengers}`;
      }
      
      // Format any additional requirements
      const additionalInfo = booking.additional_requirements ? 
        `\n*Special Requirements:*\n${booking.additional_requirements}` : '';
      
      // Create a comprehensive message
      const message = `🚗 *NEW BOOKING ASSIGNED*\n\n` +
        `*Booking ID:* ${bookingId}\n` +
        `*Service Type:* ${booking.booking_type || 'Not specified'}\n\n` +
        `*Journey Details:*\n` +
        `From: ${booking.from}\n` +
        `To: ${booking.to}\n` +
        `Date: ${booking.journey_date}\n` +
        `${passengerInfo}\n` +
        
        `*Customer Details:*\n` +
        `Name: ${booking.name}\n` +
        `Phone: ${booking.phone}\n` +
        `Email: ${booking.email}\n` +
        `${additionalInfo}\n\n` +
        
        `Please check your dashboard for complete details and update the status once completed.\n` +
        `Thank you for your service! 👍`;
      
      // Open WhatsApp with pre-filled message
      const agent = agents.find(a => a.email === agentEmail);
      if (agent && agent.phone) {
        window.open(`https://wa.me/${agent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
      toast({
        title: "Ticket Assigned",
        description: "Ticket has been assigned to agent successfully"
      });
    } catch (error) {
      console.error("Error assigning/unassigning ticket:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive"
      });
    }
  };

  const handleEditAgent = (agent: any) => {
    // Set the agent ID we're editing
    setEditingAgentId(agent.id);
    
    setAgentFormData({
      name: agent.name,
      age: agent.age,
      gender: agent.gender,
      phone: agent.phone,
      address: agent.address,
      email: agent.email,
      password: '' // Don't populate password for security
    });
    setShowAgentForm(true);
  };

  const handleAddNewAgent = () => {
    // Reset the agent ID to null to indicate we're adding a new agent
    setEditingAgentId(null);
    
    // Reset the form data
    setAgentFormData({
      name: '',
      age: '',
      gender: 'male',
      phone: '',
      address: '',
      email: '',
      password: ''
    });
    
    // Show the form
    setShowAgentForm(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteDoc(doc(db, 'agents', agentId));
      toast({
        title: "Agent Deleted",
        description: "Agent has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  };

  const deletePackageBookings = async (ids: string[]) => {
    if (!window.confirm('Are you sure you want to delete the selected package bookings?')) return;

    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await Promise.all(ids.map(id => deleteDoc(doc(db, 'package_bookings', id))));
      setSelectedPackageBookings([]);
      
      toast({
        title: "Deleted Successfully",
        description: "Selected package bookings have been deleted",
      });
    } catch (error) {
      console.error("Error deleting package bookings:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete package bookings. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const updatePackageBookingStatus = async (bookingId: string, status: 'pending' | 'completed') => {
    try {
      // First verify admin auth
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await updateDoc(doc(db, 'package_bookings', bookingId), { 
        status,
        updated_at: serverTimestamp(),
        updated_by: user.email
      });

      toast({
        title: "Status Updated",
        description: "Package booking status has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update package booking status. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const assignPackageTicket = async (bookingId: string, agentEmail: string) => {
    try {
      // Similar to assignTicket but for package bookings
      if (!agentEmail) {
        await updateDoc(doc(db, 'package_bookings', bookingId), {
          assignedAgent: null,
          assignedAt: null
        });
        
        toast({
          title: "Agent Unassigned",
          description: "Agent has been removed from this package booking"
        });
        return;
      }
      
      await updateDoc(doc(db, 'package_bookings', bookingId), {
        assignedAgent: agentEmail,
        assignedAt: serverTimestamp()
      });

      // Format WhatsApp message with detailed information
      const booking = packageBookings.find(b => b.id === bookingId);
      
      // Create a comprehensive message
      const message = `🏝️ *NEW PACKAGE BOOKING ASSIGNED*\n\n` +
        `*Booking ID:* ${bookingId}\n` +
        `*Package Name:* ${booking.package_name || 'Not specified'}\n\n` +
        `*Travel Details:*\n` +
        `Date: ${booking.travel_date}\n` +
        `Adults: ${booking.adults_count}\n` +
        `Children: ${booking.children_count}\n\n` +
        
        `*Customer Details:*\n` +
        `Name: ${booking.name}\n` +
        `Phone: ${booking.phone}\n` +
        `Email: ${booking.email}\n` +
        `${booking.special_requests ? `\n*Special Requests:*\n${booking.special_requests}` : ''}\n\n` +
        
        `Please check your dashboard for complete details and update the status once completed.\n` +
        `Thank you for your service! 👍`;
      
      // Open WhatsApp with pre-filled message
      const agent = agents.find(a => a.email === agentEmail);
      if (agent && agent.phone) {
        window.open(`https://wa.me/${agent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
      }
      
      toast({
        title: "Package Assigned",
        description: "Package booking has been assigned to agent successfully"
      });
    } catch (error) {
      console.error("Error assigning/unassigning package:", error);
      toast({
        title: "Error",
        description: "Failed to assign package booking",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-travel-blue-dark">Admin Dashboard</h1>
              <span className="hidden sm:inline text-sm text-gray-600">
                {user?.email}
              </span> 
            </div>
            <Button 
              variant="outline"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-custom p-4">
        <Tabs defaultValue="bookings" className="w-full">
          <div className="overflow-x-auto pb-1 mb-5">
            <TabsList className="w-full flex min-w-max">
              <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
              <TabsTrigger value="packages" className="flex-1">Package Bookings</TabsTrigger>
              <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
              <TabsTrigger value="agents" className="flex-1">Agents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bookings">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Booking Requests</h2>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Enhanced filter section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    {/* Status filter dropdown */}
                    <div className="relative">
                      <select
                        className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="payment_done">Payment Done</option>
                        <option value="payment_not_done">Payment Not Done</option>
                        <option value="in_process">In Process</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>
                    
                    {/* Booking Type filter dropdown */}
                    <div className="relative">
                      <select
                        className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                        value={bookingTypeFilter}
                        onChange={(e) => setBookingTypeFilter(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="train">Train</option>
                        <option value="bus">Bus</option>
                        <option value="flight">Flight</option>
                        <option value="cab">Cab</option>
                      </select>
                    </div>
                    
                    {/* Date filter dropdown */}
                    <div className="relative">
                      <select
                        className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Delete selected button */}
                  {selectedBookings.length > 0 && (
                    <button
                      onClick={() => deleteBookings(selectedBookings)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <TrashIcon size={16} />
                      Delete Selected ({selectedBookings.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile View for Bookings - Fixed display */}
              <div className="block lg:hidden space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBookings([...selectedBookings, booking.id]);
                              } else {
                                setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <h3 className="font-semibold text-base">{booking.name}</h3>
                            <p className="text-xs text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {booking.booking_type || 'Not specified'}
                              </span>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                                booking.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : booking.status === 'in_process'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'booked'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status === 'completed' ? 'Completed' : booking.status === 'in_process' ? 'In Process' : booking.status === 'booked' ? 'Booked' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <select
                          value={booking.status || 'pending'}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed' | 'in_process' | 'booked')}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            booking.status === 'completed' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : booking.status === 'in_process'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : booking.status === 'booked'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_process">In Process</option>
                          <option value="booked">Booked</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      {/* Collapsible Sections */}
                      <div className="mt-4 space-y-2">
                        <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <summary className="font-medium text-sm cursor-pointer">Journey Details</summary>
                          <div className="mt-2 pt-2 border-t text-sm space-y-1.5">
                            <p><span className="font-medium text-gray-500">From:</span> {booking.from}</p>
                            <p><span className="font-medium text-gray-500">To:</span> {booking.to}</p>
                            <p><span className="font-medium text-gray-500">Date:</span> {booking.journey_date}</p>
                            {booking.station_name && <p><span className="font-medium text-gray-500">Station:</span> {booking.station_name}</p>}
                          </div>
                        </details>
                        
                        <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <summary className="font-medium text-sm cursor-pointer">Contact Information</summary>
                          <div className="mt-2 pt-2 border-t space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <a href={`tel:${booking.phone}`} className="text-sm hover:underline">{booking.phone}</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <a href={`mailto:${booking.email}`} className="text-sm hover:underline text-xs sm:text-sm truncate max-w-[200px]">
                                {booking.email}
                              </a>
                            </div>
                          </div>
                        </details>
                        
                        <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <summary className="font-medium text-sm cursor-pointer">Passenger Info</summary>
                          <div className="mt-2 pt-2 border-t text-sm">
                            <div className="max-h-32 overflow-y-auto">
                              {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                                <div key={idx} className="bg-gray-50 p-2 rounded mb-1">
                                  {passenger.name} <span className="text-gray-500 text-xs">({passenger.age} yrs, {passenger.gender})</span>
                                </div>
                              )) : (
                                <div className="bg-gray-50 p-2 rounded">{booking.passengers}</div>
                              )}
                            </div>
                          </div>
                        </details>
                        
                        {booking.additional_requirements && (
                          <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                            <summary className="font-medium text-sm cursor-pointer">Special Requirements</summary>
                            <div className="mt-2 pt-2 border-t text-sm">
                              <p className="text-gray-700">{booking.additional_requirements}</p>
                            </div>
                          </details>
                        )}
                        
                        <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                          <summary className="font-medium text-sm cursor-pointer">Admin Notes</summary>
                          <div className="mt-2 pt-2 border-t">
                            <Textarea
                              value={adminNotes[booking.id] || ''}
                              onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                              placeholder="Add notes about this booking..."
                              className="w-full min-h-[80px] text-sm"
                            />
                          </div>
                        </details>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 mt-4">
                        <div className="flex justify-between">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleCall(booking.phone)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                            >
                              <Phone size={14} />
                              <span className="text-xs">Call</span>
                            </button>
                            <button
                              onClick={() => handleWhatsapp(booking.phone, booking)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center gap-1"
                            >
                              <MessageSquare size={14} />
                              <span className="text-xs">WhatsApp</span>
                            </button>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openEditModal(booking)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                            >
                              <PencilIcon size={14} className="text-blue-600" />
                              <span className="text-xs">Edit</span>
                            </button>
                            <button
                              onClick={() => deleteBookings([booking.id])}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                            >
                              <TrashIcon size={14} className="text-red-600" />
                              <span className="text-xs">Delete</span>
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Assign to Agent</label>
                          <select
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                            value={booking.assignedAgent || ''}
                            onChange={(e) => assignTicket(booking.id, e.target.value)}
                          >
                            <option value="">Select Agent</option>
                            {agents.map((agent: any) => (
                              <option key={agent.id} value={agent.email} className="truncate">
                                {agent.name.length > 15 ? agent.name.substring(0, 15) + '...' : agent.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No {statusFilter === 'all' ? '' : statusFilter} bookings found</p>
                  </div>
                )}
              </div>

              {/* Desktop View for Bookings - Improved Card Design */}
              <div className="hidden lg:grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all">
                      {/* Card Header */}
                      <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-100">
                        <div className="absolute right-4 top-4">
                          <select
                            value={booking.status || 'pending'}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed' | 'in_process' | 'booked')}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                              booking.status === 'completed' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : booking.status === 'in_process'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : booking.status === 'booked'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_process">In Process</option>
                            <option value="booked">Booked</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-start mb-2">
                          <Checkbox 
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBookings([...selectedBookings, booking.id]);
                              } else {
                                setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                              }
                            }}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{booking.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{formatFirebaseTimestamp(booking.created_at)}</span>
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {booking.booking_type || 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-3">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone size={14} className="text-blue-500" />
                            <a href={`tel:${booking.phone}`} className="text-sm hover:underline">{booking.phone}</a>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail size={14} className="text-blue-500" />
                            <a href={`mailto:${booking.email}`} className="text-sm hover:underline">{booking.email}</a>
                          </div>
                        </div>
                      </div>

                      {/* Card Content - Tabbed Interface */}
                      <div className="p-4">
                        <div className="flex border-b border-gray-200 mb-4">
                          <button 
                            onClick={() => document.getElementById(`journey-${booking.id}`)?.click()}
                            className="pb-2 px-3 text-sm font-medium border-b-2 border-travel-blue-dark text-travel-blue-dark"
                          >
                            Journey
                          </button>
                          <button 
                            onClick={() => document.getElementById(`passengers-${booking.id}`)?.click()}
                            className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Passengers
                          </button>
                          <button 
                            onClick={() => document.getElementById(`details-${booking.id}`)?.click()}
                            className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => document.getElementById(`notes-${booking.id}`)?.click()}
                            className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            Notes
                          </button>
                        </div>
                        
                        {/* Collapsible Content */}
                        <div className="space-y-4">
                          <details open>
                            <summary id={`journey-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                              <span className="bg-blue-50 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                              </span>
                              Journey Information
                            </summary>
                            <div className="pl-8 pt-2 text-sm space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-xs font-medium text-gray-500 block">From</span>
                                  <span className="font-medium text-gray-900">{booking.from}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <span className="text-xs font-medium text-gray-500 block">To</span>
                                  <span className="font-medium text-gray-900">{booking.to}</span>
                                </div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs font-medium text-gray-500 block">Date</span>
                                <span className="font-medium text-gray-900">{booking.journey_date}</span>
                              </div>
                              
                              {(booking.station_name || booking.boarding_point || booking.drop_point) && (
                                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                  {booking.station_name && <p><span className="text-xs text-blue-700">Station:</span> <span className="text-sm">{booking.station_name}</span></p>}
                                  {booking.boarding_point && <p><span className="text-xs text-blue-700">Boarding:</span> <span className="text-sm">{booking.boarding_point}</span></p>}
                                  {booking.drop_point && <p><span className="text-xs text-blue-700">Drop:</span> <span className="text-sm">{booking.drop_point}</span></p>}
                                </div>
                              )}
                            </div>
                          </details>
                          
                          <details>
                            <summary id={`passengers-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                              <span className="bg-green-50 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </span>
                              Passenger Information
                            </summary>
                            <div className="pl-8 pt-2 text-sm">
                              <div className="overflow-y-auto max-h-32 space-y-1">
                                {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                                  <div key={idx} className="bg-gray-50 p-2 rounded mb-1 flex items-center">
                                    <span className="h-5 w-5 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center mr-2">
                                      {idx + 1}
                                    </span>
                                    <span>{passenger.name} <span className="text-gray-500">({passenger.age} yrs, {passenger.gender})</span></span>
                                  </div>
                                )) : (
                                  <div className="bg-gray-50 p-2 rounded">{booking.passengers}</div>
                                )}
                              </div>
                            </div>
                          </details>
                          
                          <details>
                            <summary id={`details-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                              <span className="bg-purple-50 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </span>
                              Additional Details
                            </summary>
                            <div className="pl-8 pt-2 text-sm space-y-2">
                              {(booking.travel_class || booking.class_preference || booking.train_booking_type || booking.train_class) && (
                                <div className="bg-purple-50 p-2 rounded border border-purple-100">
                                  {booking.travel_class && <p><span className="text-xs text-purple-700">Travel Class:</span> <span className="text-sm">{booking.travel_class}</span></p>}
                                  {booking.class_preference && <p><span className="text-xs text-purple-700">Class Preference:</span> <span className="text-sm">{booking.class_preference}</span></p>}
                                  {booking.train_booking_type && <p><span className="text-xs text-purple-700">Train Booking Type:</span> <span className="text-sm">{booking.train_booking_type}</span></p>}
                                  {booking.train_class && <p><span className="text-xs text-purple-700">Train Class:</span> <span className="text-sm">{booking.train_class}</span></p>}
                                  {booking.preferred_trains && <p><span className="text-xs text-purple-700">Preferred Trains:</span> <span className="text-sm">{booking.preferred_trains}</span></p>}
                                </div>
                              )}
                              
                              {(booking.ticket_number || booking.pnr || booking.booking_reference || booking.fare_details) && (
                                <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                  <p className="text-xs font-semibold text-yellow-800 mb-1">Ticket Information</p>
                                  {booking.ticket_number && <p><span className="text-xs text-yellow-700">Ticket Number:</span> <span className="text-sm">{booking.ticket_number}</span></p>}
                                  {booking.pnr && <p><span className="text-xs text-yellow-700">PNR:</span> <span className="text-sm">{booking.pnr}</span></p>}
                                  {booking.booking_reference && <p><span className="text-xs text-yellow-700">Booking Ref:</span> <span className="text-sm">{booking.booking_reference}</span></p>}
                                  {booking.fare_details && <p><span className="text-xs text-yellow-700">Fare Details:</span> <span className="text-sm">{booking.fare_details}</span></p>}
                                </div>
                              )}
                              
                              {booking.additional_requirements && (
                                <div className="bg-red-50 p-2 rounded border border-red-100">
                                  <p className="text-xs font-semibold text-red-800 mb-1">Special Requirements</p>
                                  <p className="text-sm">{booking.additional_requirements}</p>
                                </div>
                              )}
                            </div>
                          </details>
                          
                          <details>
                            <summary id={`notes-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                              <span className="bg-amber-50 p-1 rounded mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </span>
                              Admin Notes
                            </summary>
                            <div className="pl-8 pt-2 text-sm">
                              <Textarea
                                value={adminNotes[booking.id] || ''}
                                onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full min-h-[80px] text-sm border-amber-200 focus:border-amber-300 focus:ring-amber-200"
                              />
                            </div>
                          </details>
                        </div>
                      </div>
                      
                      {/* Card Footer */}
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleCall(booking.phone)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                title="Call"
                              >
                                <Phone size={14} />
                                <span className="text-xs font-medium">Call</span>
                              </button>
                              <button
                                onClick={() => handleWhatsapp(booking.phone, booking)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center gap-1"
                                title="WhatsApp"
                              >
                                <MessageSquare size={14} />
                                <span className="text-xs font-medium">WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleEmail(booking.email)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1"
                                title="Email"
                              >
                                <Mail size={14} />
                                <span className="text-xs font-medium">Email</span>
                              </button>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openEditModal(booking)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                                title="Edit"
                              >
                                <PencilIcon size={14} className="text-blue-600" />
                                <span className="text-xs font-medium">Edit</span>
                              </button>
                              <button
                                onClick={() => deleteBookings([booking.id])}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                                title="Delete"
                              >
                                <TrashIcon size={14} className="text-red-600" />
                                <span className="text-xs font-medium">Delete</span>
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Assign to Agent</label>
                            <select
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
                              value={booking.assignedAgent || ''}
                              onChange={(e) => assignTicket(booking.id, e.target.value)}
                            >
                              <option value="">Select Agent</option>
                              {agents.map((agent: any) => (
                                <option key={agent.id} value={agent.email}>
                                  {agent.name} ({agent.email})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <p>No {statusFilter === 'all' ? '' : statusFilter} bookings found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="packages">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Package Bookings</h2>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Status filter dropdown */}
                  <div className="relative">
                    <select
                      className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                      value={packageStatusFilter}
                      onChange={(e) => setPackageStatusFilter(e.target.value)}
                    >
                      <option value="all">All Package Bookings ({packageBookingStats.total})</option>
                      <option value="pending">Pending ({packageBookingStats.pending})</option>
                      <option value="completed">Completed ({packageBookingStats.completed})</option>
                    </select>
                  </div>
                  
                  {/* Delete selected button */}
                  {selectedPackageBookings.length > 0 && (
                    <button
                      onClick={() => deletePackageBookings(selectedPackageBookings)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      <TrashIcon size={16} />
                      Delete Selected ({selectedPackageBookings.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Rest of package booking content */}
              <div className="block lg:hidden space-y-4">
                {filteredPackageBookings.length > 0 ? (
                  filteredPackageBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedPackageBookings.includes(booking.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPackageBookings([...selectedPackageBookings, booking.id]);
                              } else {
                                setSelectedPackageBookings(selectedPackageBookings.filter(id => id !== booking.id));
                              }
                            }}
                          />
                          <div>
                            <h3 className="font-medium">{booking.name}</h3>
                            <p className="text-sm text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                          </div>
                        </div>
                        <select
                          value={booking.status || 'pending'}
                          onChange={(e) => updatePackageBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="text-sm space-y-2">
                        <p><span className="font-medium">Contact:</span> {booking.email} | {booking.phone}</p>
                        <p><span className="font-medium">Package:</span> {booking.package_name}</p>
                        <p><span className="font-medium">Date:</span> {booking.travel_date}</p>
                        <p><span className="font-medium">Travelers:</span> {booking.adults_count} Adults, {booking.children_count} Children</p>
                        {booking.special_requests && (
                          <p><span className="font-medium">Special Requests:</span> {booking.special_requests}</p>
                        )}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                          <Textarea
                            value={adminNotes[booking.id] || ''}
                            onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                            placeholder="Add notes about this booking..."
                            className="w-full min-h-[100px] text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCall(booking.phone)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                            title="Call"
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => handleWhatsapp(booking.phone, booking)}
                            className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                            title="WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button
                            onClick={() => handleEmail(booking.email)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            title="Email"
                          >
                            <Mail size={16} />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <div>
                          <button
                            onClick={() => deletePackageBookings([booking.id])}
                            className="p-2 hover:bg-gray-200 rounded-full"
                            title="Delete"
                          >
                            <TrashIcon size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Agent</label>
                        <div className="w-full max-w-full overflow-hidden">
                          <select
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            value={booking.assignedAgent || ''}
                            onChange={(e) => assignPackageTicket(booking.id, e.target.value)}
                          >
                            <option value="">Select Agent</option>
                            {agents.map((agent: any) => (
                              <option key={agent.id} value={agent.email} className="truncate">
                                {agent.name.length > 15 ? agent.name.substring(0, 15) + '...' : agent.name} ({agent.email.substring(0, 15)}...)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No {packageStatusFilter === 'all' ? '' : packageStatusFilter} package bookings found</p>
                  </div>
                )}
              </div>

              {/* Desktop View for Package Bookings */}
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {filteredPackageBookings.length > 0 ? (
                  filteredPackageBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={selectedPackageBookings.includes(booking.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPackageBookings([...selectedPackageBookings, booking.id]);
                              } else {
                                setSelectedPackageBookings(selectedPackageBookings.filter(id => id !== booking.id));
                              }
                            }}
                          />
                          <div>
                            <h3 className="font-medium">{booking.name}</h3>
                            <p className="text-sm text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                          </div>
                        </div>
                        <select
                          value={booking.status || 'pending'}
                          onChange={(e) => updatePackageBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span>{booking.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span>{booking.email}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <p><span className="font-medium">Package:</span> {booking.package_name}</p>
                          <p><span className="font-medium">Date:</span> {booking.travel_date}</p>
                          <p><span className="font-medium">Travelers:</span> {booking.adults_count} Adults, {booking.children_count} Children</p>
                          {booking.special_requests && (
                            <div className="mt-2">
                              <span className="font-medium">Special Requests:</span>
                              <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{booking.special_requests}</p>
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <Textarea
                            value={adminNotes[booking.id] || ''}
                            onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                            placeholder="Add notes..."
                            className="w-full min-h-[80px] text-sm"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCall(booking.phone)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                              title="Call"
                            >
                              <Phone size={16} />
                            </button>
                            <button
                              onClick={() => handleWhatsapp(booking.phone, booking)}
                              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                              title="WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button
                              onClick={() => handleEmail(booking.email)}
                              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                              title="Email"
                            >
                              <Mail size={16} />
                            </button>
                          </div>

                          <div>
                            <button
                              onClick={() => deletePackageBookings([booking.id])}
                              className="p-2 hover:bg-gray-200 rounded-full"
                              title="Delete"
                            >
                              <TrashIcon size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 border-t pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Agent</label>
                          <div className="w-full max-w-full overflow-hidden">
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              value={booking.assignedAgent || ''}
                              onChange={(e) => assignPackageTicket(booking.id, e.target.value)}
                            >
                              <option value="">Select Agent</option>
                              {agents.map((agent: any) => (
                                <option key={agent.id} value={agent.email}>
                                  {agent.name} ({agent.email})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <p>No {packageStatusFilter === 'all' ? '' : packageStatusFilter} package bookings found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Contact Messages</h2>
                {selectedMessages.length > 0 && (
                  <button
                    onClick={() => deleteMessages(selectedMessages)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <TrashIcon size={16} />
                    Delete Selected ({selectedMessages.length})
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      <Checkbox 
                        checked={selectedMessages.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMessages([...selectedMessages, contact.id]);
                          } else {
                            setSelectedMessages(selectedMessages.filter(id => id !== contact.id));
                          }
                        }}
                      />
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                          <div>
                            <h3 className="font-medium text-travel-blue-dark text-lg">
                              {contact.subject || "No Subject"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              From: {contact.name}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                              <a href={`mailto:${contact.email}`} className="hover:text-travel-orange">
                                {contact.email}
                              </a>
                              <span className="hidden sm:inline">•</span>
                              <a href={`tel:${contact.phone}`} className="hover:text-travel-orange">
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {formatFirebaseTimestamp(contact.created_at)}
                            </span>
                            <button
                              onClick={() => deleteMessages([contact.id])}
                              className="p-1 hover:bg-red-100 rounded-full"
                              title="Delete"
                            >
                              <TrashIcon size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                          {contact.message}
                        </p>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                          <Textarea
                            value={adminNotes[contact.id] || ''}
                            onChange={(e) => handleMessageNoteChange(contact.id, e.target.value)}
                            placeholder="Add notes about this message..."
                            className="w-full min-h-[100px] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Manage Agents</h2>
                <Button onClick={handleAddNewAgent} variant="default">
                  Add New Agent
                </Button>
              </div>

              {/* Agent Form Modal */}
              {showAgentForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg w-full max-w-md p-6">
                    <h3 className="text-xl font-bold mb-4">{editingAgentId ? 'Edit Agent' : 'Add New Agent'}</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      createAgent(agentFormData);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={agentFormData.name}
                          onChange={(e) => setAgentFormData({...agentFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Age</label>
                          <input
                            type="number"
                            required
                            value={agentFormData.age}
                            onChange={(e) => setAgentFormData({...agentFormData, age: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Gender</label>
                          <select
                            required
                            value={agentFormData.gender}
                            onChange={(e) => setAgentFormData({...agentFormData, gender: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          required
                          value={agentFormData.phone}
                          onChange={(e) => setAgentFormData({...agentFormData, phone: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <textarea
                          required
                          value={agentFormData.address}
                          onChange={(e) => setAgentFormData({...agentFormData, address: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={agentFormData.email}
                          onChange={(e) => setAgentFormData({...agentFormData, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      {!editingAgentId && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Password</label>
                          <input
                            type="password"
                            required={!editingAgentId}
                            value={agentFormData.password}
                            onChange={(e) => setAgentFormData({...agentFormData, password: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Only required for new agents
                          </p>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => {
                          setShowAgentForm(false);
                          setEditingAgentId(null);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingAgentId ? 'Update Agent' : 'Add Agent'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Agents List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent: any) => (
                  <div key={agent.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditAgent(agent)} className="p-2 hover:bg-gray-100 rounded-full">
                          <PencilIcon size={16} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleDeleteAgent(agent.id)} className="p-2 hover:bg-gray-100 rounded-full">
                          <TrashIcon size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Age:</span> {agent.age}</p>
                      <p><span className="font-medium">Gender:</span> {agent.gender}</p>
                      <p><span className="font-medium">Phone:</span> {agent.phone}</p>
                      <p><span className="font-medium">Address:</span> {agent.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* WhatsApp Message Modal */}
      <Dialog open={whatsappModal} onOpenChange={setWhatsappModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Booking Information</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <div className="space-y-4 my-4">
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p><span className="font-medium">Customer:</span> {currentBooking.name}</p>
                <p><span className="font-medium">Journey:</span> {currentBooking.from} to {currentBooking.to}</p>
                <p><span className="font-medium">Date:</span> {currentBooking.journey_date}</p>
                <p><span className="font-medium">Original Service:</span> {currentBooking.booking_type || 'Not specified'}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bookingType">Booking Type</Label>
                  <select
                    id="bookingType"
                    className="w-full px-3 py-2 border rounded-md"
                    value={messageDetails.bookingType}
                    onChange={(e) => handleBookingTypeChange(e.target.value)}
                  >
                    <option value="General Booking">General Booking</option>
                    <option value="Tatkal Booking">Tatkal Booking</option>
                    <option value="Premium Booking">Premium Booking</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {messageDetails.bookingType === 'Tatkal Booking' ? 
                      'Tatkal bookings have a fixed charge of ₹200.' : 
                      messageDetails.bookingType === 'Premium Booking' ? 
                      'Premium bookings have a minimum charge of ₹200.' : 
                      'General bookings have a fixed charge of ₹50.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticketCost">Ticket Cost (₹)</Label>
                    <Input
                      id="ticketCost"
                      type="number"
                      value={messageDetails.ticketCost}
                      onChange={(e) => {
                        const newTicketCost = e.target.value;
                        const bookingCharge = calculateBookingCharge(
                          messageDetails.bookingType, 
                          parseFloat(newTicketCost) || 0
                        ).toFixed(2);
                        
                        setMessageDetails({
                          ...messageDetails,
                          ticketCost: newTicketCost,
                          bookingCharge: bookingCharge
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookingCharge">Booking Charge (₹)</Label>
                    <Input
                      id="bookingCharge"
                      type="number"
                      value={messageDetails.bookingCharge}
                      onChange={(e) => setMessageDetails({
                        ...messageDetails,
                        bookingCharge: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                  <Input
                    id="totalAmount"
                    type="text"
                    value={calculateTotal()}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={messageDetails.additionalInfo}
                    onChange={(e) => setMessageDetails({
                      ...messageDetails,
                      additionalInfo: e.target.value
                    })}
                    placeholder="Any additional details or instructions..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappModal(false)}>
              Cancel
            </Button>
            <Button onClick={sendWhatsappMessage}>
              Send to WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 bg-white rounded-xl shadow-xl border-0">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-travel-blue-dark to-blue-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  Edit Booking
                </DialogTitle>
                <p className="text-blue-100 text-sm mt-1">
                  {editBooking?.name || ""} • {editBooking?.booking_type || ""}
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
          
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            handleSaveEdit(editBooking?.id); 
            setEditModalOpen(false);
          }} className="px-6 pb-6">
            {/* Step Navigation */}
            <div className="border-b border-gray-200 py-3 sticky top-[84px] bg-white z-10">
              <div className="flex overflow-x-auto hide-scrollbar" style={{scrollbarWidth: 'none'}}>
                <button type="button" 
                  className="flex-shrink-0 flex flex-col items-center mr-8 focus:outline-none group"
                  onClick={() => document.getElementById('customer-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <div className="rounded-full bg-travel-blue-dark p-2 mb-1.5 group-hover:bg-travel-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Customer</span>
                </button>
                
                <button type="button" 
                  className="flex-shrink-0 flex flex-col items-center mr-8 focus:outline-none group"
                  onClick={() => document.getElementById('journey-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <div className="rounded-full bg-blue-500 p-2 mb-1.5 group-hover:bg-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Journey</span>
                </button>
                
                <button type="button" 
                  className="flex-shrink-0 flex flex-col items-center mr-8 focus:outline-none group"
                  onClick={() => document.getElementById('train-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <div className="rounded-full bg-indigo-500 p-2 mb-1.5 group-hover:bg-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Train</span>
                </button>
                
                <button type="button" 
                  className="flex-shrink-0 flex flex-col items-center mr-8 focus:outline-none group"
                  onClick={() => document.getElementById('requirements-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <div className="rounded-full bg-amber-500 p-2 mb-1.5 group-hover:bg-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Special Req.</span>
                </button>
                
                <button type="button" 
                  className="flex-shrink-0 flex flex-col items-center focus:outline-none group"
                  onClick={() => document.getElementById('ticket-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <div className="rounded-full bg-rose-500 p-2 mb-1.5 group-hover:bg-rose-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-800">Ticket</span>
                </button>
              </div>
            </div>

            {/* Form sections */}
            <div className="space-y-8 mt-6">
              {/* Customer Details Section */}
              <section id="customer-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-travel-blue-dark rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-travel-blue-dark">Customer Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
                      placeholder="Customer Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </section>

              {/* Journey Details Section */}
              <section id="journey-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Journey Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">From</label>
                    <input
                      type="text"
                      value={editFormData.from}
                      onChange={(e) => setEditFormData({ ...editFormData, from: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Origin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">To</label>
                    <input
                      type="text"
                      value={editFormData.to}
                      onChange={(e) => setEditFormData({ ...editFormData, to: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Destination"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Journey Date</label>
                    <input
                      type="date"
                      value={editFormData.journey_date}
                      onChange={(e) => setEditFormData({ ...editFormData, journey_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Service Type</label>
                    <select
                      value={editFormData.booking_type}
                      onChange={(e) => setEditFormData({ ...editFormData, booking_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="train">Train</option>
                      <option value="bus">Bus</option>
                      <option value="flight">Flight</option>
                      <option value="cab">Cab</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Passenger Details</label>
                    <textarea
                      value={editFormData.passengers}
                      onChange={(e) => setEditFormData({ ...editFormData, passengers: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="One passenger per line (e.g., Name - Age - Gender)"
                      rows={4}
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1 ml-1">Enter each passenger on a new line</p>
                  </div>
                </div>
              </section>

              {/* Conditional Train Booking Details Section */}
              {editFormData.booking_type === "train" && (
                <section id="train-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Train Booking Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Booking Type</label>
                      <select
                        value={editFormData.train_booking_type}
                        onChange={(e) => setEditFormData({ ...editFormData, train_booking_type: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="general">General Booking</option>
                        <option value="tatkal">Tatkal Booking</option>
                        <option value="premium_tatkal">Premium Tatkal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Class Preference</label>
                      <select
                        value={editFormData.train_class}
                        onChange={(e) => setEditFormData({ ...editFormData, train_class: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="SL">Sleeper (SL)</option>
                        <option value="3A">AC 3-Tier (3A)</option>
                        <option value="2A">AC 2-Tier (2A)</option>
                        <option value="1A">AC First Class (1A)</option>
                        <option value="CC">Chair Car (CC)</option>
                        <option value="EC">Executive Chair Car (EC)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5 text-gray-700">Preferred Trains</label>
                      <input
                        type="text"
                        value={editFormData.preferred_trains}
                        onChange={(e) => setEditFormData({ ...editFormData, preferred_trains: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Train numbers or names (comma separated)"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Additional Requirements Section */}
              <section id="requirements-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Special Requirements</h3>
                </div>
                
                <div>
                  <textarea
                    value={editFormData.additional_requirements}
                    onChange={(e) => setEditFormData({ ...editFormData, additional_requirements: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter any special needs or requests"
                    rows={4}
                  ></textarea>
                </div>
              </section>

              {/* Ticket Information Section */}
              <section id="ticket-section" className="scroll-mt-32 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-rose-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Ticket Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Ticket Number</label>
                    <input
                      type="text"
                      value={editFormData.ticket_number}
                      onChange={(e) => setEditFormData({ ...editFormData, ticket_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Ticket #"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">PNR</label>
                    <input
                      type="text"
                      value={editFormData.pnr}
                      onChange={(e) => setEditFormData({ ...editFormData, pnr: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="PNR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Booking Reference</label>
                    <input
                      type="text"
                      value={editFormData.booking_reference}
                      onChange={(e) => setEditFormData({ ...editFormData, booking_reference: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Reference #"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Fare Details</label>
                    <textarea
                      value={editFormData.fare_details}
                      onChange={(e) => setEditFormData({ ...editFormData, fare_details: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="Enter fare breakdown and payment details"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 mt-8 pt-4 pb-1 bg-white flex flex-col sm:flex-row-reverse gap-2 border-t border-gray-200">
              <Button type="submit" className="w-full sm:w-auto py-3 px-8 text-base font-medium shadow-lg">
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto py-3 px-6 text-base"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;