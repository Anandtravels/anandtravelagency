import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const AgentDashboard = () => {
  const { user, isAgent, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [messageDetails, setMessageDetails] = useState({
    ticketCost: '',
    bookingCharge: '',
    totalAmount: '',
    additionalInfo: '',
    bookingType: 'General Booking'
  });
  
  // Check authentication and fetch agent's bookings
  useEffect(() => {
    if (!loading) {
      if (!user || !isAgent) {
        navigate("/agent-login");
        return;
      }
      
      // Fetch bookings assigned to this agent
      const agentEmail = user.email;
      if (!agentEmail) return;
      
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef, 
        where("assignedAgent", "==", agentEmail),
        orderBy("created_at", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        setBookings(bookingsList);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load your assigned bookings",
          variant: "destructive"
        });
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user, isAgent, loading, navigate, toast]);

  // Add a useEffect to fetch package bookings
  useEffect(() => {
    if (!loading && user && isAgent) {
      const agentEmail = user.email;
      if (!agentEmail) return;
      
      // Fetch package bookings assigned to this agent
      const packageBookingsRef = collection(db, "package_bookings");
      const packageQuery = query(
        packageBookingsRef, 
        where("assignedAgent", "==", agentEmail),
        orderBy("created_at", "desc")
      );
      
      const unsubscribe = onSnapshot(packageQuery, (snapshot) => {
        const packageBookingsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date()
        }));
        
        // Add to the existing bookings array with a type indicator
        const packageBookingsWithType = packageBookingsList.map(booking => ({
          ...booking,
          booking_type: 'package'
        }));
        
        setBookings(prevBookings => {
          // Filter out any package bookings that might have been added before
          const regularBookings = prevBookings.filter(b => b.booking_type !== 'package');
          return [...regularBookings, ...packageBookingsWithType];
        });
        
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user, isAgent, loading]);

  // Filter bookings based on status
  const filteredBookings = useCallback(() => {
    if (statusFilter === 'all') return bookings;
    if (statusFilter === 'pending') return bookings.filter(b => !b.status || b.status === 'pending');
    if (statusFilter === 'completed') return bookings.filter(b => b.status === 'completed');
    return bookings;
  }, [bookings, statusFilter]);

  // Helper functions
  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd MMM yyyy, HH:mm");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'completed') => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { 
        status,
        updated_at: serverTimestamp(),
        updated_by: user?.email
      });
      
      toast({
        title: "Status Updated",
        description: `Booking marked as ${status}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/agent-login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  if (!user || !isAgent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container py-4 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-travel-blue-dark">Agent Dashboard</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="container p-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-travel-blue-dark">Your Assigned Bookings</h2>
            
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Bookings ({bookings.length})</option>
                <option value="pending">Pending ({bookings.filter(b => !b.status || b.status === 'pending').length})</option>
                <option value="completed">Completed ({bookings.filter(b => b.status === 'completed').length})</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading your bookings...</p>
          </div>
        ) : filteredBookings().length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings().map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{booking.name}</CardTitle>
                      <p className="text-sm text-gray-500">{formatDate(booking.created_at)}</p>
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
                </CardHeader>
                <CardContent className="pt-2">
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
                      <p><span className="font-medium">Service:</span> {booking.booking_type || 'Not specified'}</p>
                      <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                      <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                      <div className="mt-2">
                        <span className="font-medium">Passengers:</span>
                        <div className="ml-2 mt-1">
                          {Array.isArray(booking.passengers) ? booking.passengers.map((passenger: any, idx: number) => (
                            <div key={idx} className="text-sm bg-gray-50 p-1 rounded mb-1">
                              {passenger.name} ({passenger.age} yrs, {passenger.gender})
                            </div>
                          )) : (
                            <div>{booking.passengers}</div>
                          )}
                        </div>
                      </div>
                      {booking.additional_requirements && (
                        <div className="mt-2">
                          <span className="font-medium">Special Requirements:</span>
                          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{booking.additional_requirements}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-between">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No {statusFilter === 'all' ? '' : statusFilter} bookings assigned to you.</p>
          </div>
        )}
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

export default AgentDashboard;
