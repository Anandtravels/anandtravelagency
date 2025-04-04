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
    booking_type: ''
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
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [messageDetails, setMessageDetails] = useState({
    ticketCost: '',
    bookingCharge: '',
    totalAmount: '',
    additionalInfo: '',
    bookingType: 'General Booking' // Add booking type with default value
  });

  // Memoized values
  const combinedLoading = useMemo(() => bookingLoading || contactsLoading, [bookingLoading, contactsLoading]);

  const bookingStats = useMemo(() => {
    const pending = bookings.filter(b => !b.status || b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const total = bookings.length;
    
    return { pending, completed, total };
  }, [bookings]);
  
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    if (statusFilter === 'pending') return bookings.filter(b => !b.status || b.status === 'pending');
    if (statusFilter === 'completed') return bookings.filter(b => b.status === 'completed');
    return bookings;
  }, [bookings, statusFilter]);

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

    // Return cleanup function
    return () => {
      bookingsUnsubscribe();
      contactsUnsubscribe();
      agentsUnsubscribe();
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

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'completed') => {
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

  const handleEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      from: booking.from,
      to: booking.to,
      journey_date: booking.journey_date || '',
      passengers: booking.passengers || '',
      additional_requirements: booking.additional_requirements || '',
      booking_type: booking.booking_type || ''
    });
  };

  const handleSaveEdit = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        ...editFormData,
        updated_at: serverTimestamp()
      });
      setEditingId(null);
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
    
    // Build the formatted message based on booking type
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
          <TabsList className="mb-6 w-full flex">
            <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
            <TabsTrigger value="agents" className="flex-1">Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-travel-blue-dark">Booking Requests</h2>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {/* Status filter dropdown */}
                  <div className="relative">
                    <select
                      className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Bookings ({bookingStats.total})</option>
                      <option value="pending">Pending ({bookingStats.pending})</option>
                      <option value="completed">Completed ({bookingStats.completed})</option>
                    </select>
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

              {/* Mobile View for Bookings */}
              <div className="block lg:hidden space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {editingId === booking.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Name"
                          />
                          <div className="grid grid-cols-1 gap-2">
                            <input
                              type="email"
                              value={editFormData.email}
                              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                              placeholder="Email"
                            />
                            <input
                              type="tel"
                              value={editFormData.phone}
                              onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                              placeholder="Phone"
                            />
                          </div>
                          <input
                            type="text"
                            value={editFormData.booking_type}
                            onChange={(e) => setEditFormData({...editFormData, booking_type: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Service Type"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editFormData.from}
                              onChange={(e) => setEditFormData({...editFormData, from: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                              placeholder="From"
                            />
                            <input
                              type="text"
                              value={editFormData.to}
                              onChange={(e) => setEditFormData({...editFormData, to: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                              placeholder="To"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={editFormData.journey_date}
                              onChange={(e) => setEditFormData({...editFormData, journey_date: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                            />
                            <input
                              type="number"
                              value={editFormData.passengers}
                              onChange={(e) => setEditFormData({...editFormData, passengers: e.target.value})}
                              className="w-full px-3 py-2 border rounded"
                              placeholder="Passengers"
                            />
                          </div>
                          <textarea
                            value={editFormData.additional_requirements}
                            onChange={(e) => setEditFormData({...editFormData, additional_requirements: e.target.value})}
                            className="w-full px-3 py-2 border rounded"
                            rows={3}
                            placeholder="Additional Requirements"
                          ></textarea>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleSaveEdit(booking.id)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedBookings.includes(booking.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBookings([...selectedBookings, booking.id]);
                                  } else {
                                    setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
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
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
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
                            <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                            <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                            <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                            <div>
                              <span className="font-medium">Passengers:</span>
                              <div className="ml-2">
                                {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                                  <div key={idx} className="text-sm">
                                    {passenger.name} ({passenger.age} years, {passenger.gender})
                                  </div>
                                )) : (
                                  <div>{booking.passengers}</div>
                                )}
                              </div>
                            </div>
                            {booking.additional_requirements && (
                              <p><span className="font-medium">Notes:</span> {booking.additional_requirements}</p>
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

                            {/* Edit/Delete Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(booking)}
                                className="p-2 hover:bg-gray-200 rounded-full"
                                title="Edit"
                              >
                                <PencilIcon size={16} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => deleteBookings([booking.id])}
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
                                onChange={(e) => assignTicket(booking.id, e.target.value)}
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
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No {statusFilter === 'all' ? '' : statusFilter} bookings found</p>
                  </div>
                )}
              </div>

              {/* Desktop View for Bookings */}
              <div className="hidden lg:grid grid-cols-3 gap-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={selectedBookings.includes(booking.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBookings([...selectedBookings, booking.id]);
                              } else {
                                setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
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
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
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
                          <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                          <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                          <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                          <div className="mt-2">
                            <span className="font-medium">Passengers:</span>
                            <div className="ml-2 mt-1">
                              {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                                <div key={idx} className="text-sm bg-gray-50 p-1 rounded mb-1">
                                  {passenger.name} ({passenger.age} yrs, {passenger.gender})
                                </div>
                              )) : (
                                <div>{booking.passengers}</div>
                              )}
                            </div>
                          </div>
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

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-2 hover:bg-gray-200 rounded-full"
                              title="Edit"
                            >
                              <PencilIcon size={16} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteBookings([booking.id])}
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
    </div>
  );
};

export default Admin;