import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageSquare, ClipboardList, Wallet, BookOpen, Calendar, Star, Sparkles, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { CouponInput } from "@/components/CouponSystem/CouponInput";
import { motion } from "framer-motion";
import { useAgentTasks } from "@/hooks/useAgentTasks";
import AgentTaskList from "@/components/agent/AgentTaskList";
import AgentWalletCard from "@/components/agent/AgentWalletCard";
import AgentRulesRegulations from "@/components/agent/AgentRulesRegulations";

const AgentDashboard = () => {
  const { user, isAgent, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [agentName, setAgentName] = useState<string>("");
  const [messageDetails, setMessageDetails] = useState({
    ticketCost: '',
    bookingCharge: '',
    totalAmount: '',
    additionalInfo: '',
    bookingType: 'General Booking',
    couponCode: '',
    couponDiscount: 0,
    couponType: null as 'fixed' | 'percentage' | null
  });

  // Agent Tasks Hook
  const { 
    tasks, 
    wallet, 
    taskHistory, 
    loading: tasksLoading, 
    completeTask,
    getPendingTasksCount
  } = useAgentTasks(user?.email || undefined);

  // Task status filter for agent view
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');

  // Fetch agent name from agents collection
  useEffect(() => {
    const fetchAgentName = async () => {
      if (!user?.email) return;
      
      try {
        const agentsRef = collection(db, 'agents');
        const q = query(agentsRef, where('email', '==', user.email.toLowerCase()));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const agentData = snapshot.docs[0].data();
            setAgentName(agentData.name || 'Agent');
          }
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching agent name:', error);
      }
    };
    
    if (user && isAgent) {
      fetchAgentName();
    }
  }, [user, isAgent]);

  // Handle task completion with celebration toast
  const handleCompleteTask = async (taskId: string): Promise<boolean> => {
    const success = await completeTask(taskId);
    
    if (success) {
      toast({
        title: "🎉 Congratulations!",
        description: "Hey! You have earned your points. Complete more tasks to earn more! 🚀",
        duration: 5000,
      });
    }
    
    return success;
  };
  
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
        bookingType: initialBookingType,
        // Include the coupon fields with default values
        couponCode: '',
        couponDiscount: 0,
        couponType: null
      });
    } else {
      // Direct WhatsApp chat without booking context
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  // Add the missing handleBookingTypeChange function
  const handleBookingTypeChange = (newType: string) => {
    // Calculate the booking charge based on the new booking type
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    const bookingCharge = calculateBookingCharge(newType, ticketCost).toFixed(2);
    
    setMessageDetails({
      ...messageDetails,
      bookingType: newType,
      bookingCharge: bookingCharge
    });
  };

  const calculateBookingCharge = (bookingType: string, basePrice: number): number => {
    switch(bookingType) {
      case 'Tatkal Sleeper':
        return 250;
      case 'Tatkal 3AC':
        return 350;
      case 'Tatkal 2AC':
        return 400;
      case 'Tatkal Booking':
        return 250; // Legacy support - default to Sleeper rate
      case 'Premium Booking':
        return 400; // Map Premium to Tatkal 2AC rate
      case 'Advance Reservation':
        return 150;
      case 'General Booking':
      default:
        return 100;
    }
  };

  const calculateTotal = () => {
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    let bookingCharge = parseFloat(messageDetails.bookingCharge) || 0;
    
    // If booking charge was not manually set, calculate it based on booking type
    if (messageDetails.bookingCharge === '') {
      bookingCharge = calculateBookingCharge(messageDetails.bookingType, ticketCost);
    }
    
    // Calculate the base amount
    const baseAmount = ticketCost + bookingCharge;
    
    // Apply coupon discount if available
    let discountAmount = 0;
    if (messageDetails.couponType && messageDetails.couponDiscount > 0) {
      discountAmount = messageDetails.couponType === 'percentage' 
        ? baseAmount * (messageDetails.couponDiscount / 100) 
        : Math.min(messageDetails.couponDiscount, baseAmount); // Fixed discount capped at base amount
    }
    
    return (baseAmount - discountAmount).toFixed(2);
  };
  
  // Handle applying a coupon
  const handleApplyCoupon = (discount: number, code: string, type: 'fixed' | 'percentage') => {
    setMessageDetails(prev => ({
      ...prev,
      couponCode: code,
      couponDiscount: discount,
      couponType: type
    }));
  };

  const sendWhatsappMessage = () => {
    if (!currentBooking) return;
    
    // Format passengers data
    let passengerInfo = '';
    if (Array.isArray(currentBooking.passengers)) {
      const validPassengers = currentBooking.passengers.filter((p: any) => p && (p.name || p.age || p.gender));
      passengerInfo = `*Passengers:* ${validPassengers.length}\n`;
      validPassengers.forEach((passenger: any, index: number) => {
        passengerInfo += `   ${index + 1}. ${passenger.name || 'N/A'} (${passenger.age || 'N/A'} yrs, ${passenger.gender || 'N/A'})\n`;
      });
    } else {
      passengerInfo = `*Passengers:* ${currentBooking.passengers}\n`;
    }
    
    // Calculate discount amount for display
    const ticketCost = parseFloat(messageDetails.ticketCost) || 0;
    let bookingCharge = parseFloat(messageDetails.bookingCharge) || 0;
    if (messageDetails.bookingCharge === '') {
      bookingCharge = calculateBookingCharge(messageDetails.bookingType, ticketCost);
    }
    
    const baseAmount = ticketCost + bookingCharge;
    let discountAmount = 0;
    
    if (messageDetails.couponType && messageDetails.couponDiscount > 0) {
      discountAmount = messageDetails.couponType === 'percentage' 
        ? baseAmount * (messageDetails.couponDiscount / 100) 
        : Math.min(messageDetails.couponDiscount, baseAmount);
    }
    
    // Build the formatted message based on booking type
    let pricingDetails = '';
    
    if (messageDetails.bookingType === 'Tatkal Booking') {
      pricingDetails = 
`*Pricing Details:*
Tatkal Cost: ₹${messageDetails.ticketCost}
Tatkal Booking Charge: ₹${messageDetails.bookingCharge}
${discountAmount > 0 ? `Coupon Discount (${messageDetails.couponCode}): -₹${discountAmount.toFixed(2)}` : ''}
*Total Amount: ₹${calculateTotal()}*`;
    } else if (messageDetails.bookingType === 'Premium Booking') {
      pricingDetails = 
`*Pricing Details:*
Premium Ticket Cost: ₹${messageDetails.ticketCost}
Premium Booking Charge: ₹${messageDetails.bookingCharge}
${discountAmount > 0 ? `Coupon Discount (${messageDetails.couponCode}): -₹${discountAmount.toFixed(2)}` : ''}
*Total Amount: ₹${calculateTotal()}*`;
    } else {
      pricingDetails = 
`*Pricing Details:*
Ticket Cost: ₹${messageDetails.ticketCost}
Booking Charge: ₹${messageDetails.bookingCharge}
${discountAmount > 0 ? `Coupon Discount (${messageDetails.couponCode}): -₹${discountAmount.toFixed(2)}` : ''}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container py-3 px-3 sm:px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-travel-blue-dark rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {agentName.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-travel-blue-dark">Agent Dashboard</h1>
              <p className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-none">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm">Sign Out</Button>
        </div>
      </header>

      <main className="container p-3 sm:p-4 space-y-4">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-travel-blue-dark via-travel-blue-medium to-travel-blue-dark rounded-xl p-3 sm:p-5 text-white shadow-lg relative z-0"
        >
          <div className="relative">
            {/* Top row - Welcome message */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg md:text-xl font-bold flex items-center gap-1">
                  Welcome, {agentName || 'Agent'} 
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-travel-orange" />
                </h2>
                <p className="text-[10px] sm:text-sm text-blue-100">Complete tasks to earn ATA points!</p>
              </div>
            </div>
            
            {/* Bottom row - Stats cards */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 text-center bg-white/10 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-blue-100">Pending</p>
                <p className="text-base sm:text-xl font-bold">{getPendingTasksCount()}</p>
              </div>
              <div className="flex-1 text-center bg-travel-orange/90 backdrop-blur-sm rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
                <p className="text-[10px] sm:text-xs text-orange-100">ATA Points</p>
                <p className="text-base sm:text-xl font-bold flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  {wallet?.balance || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-0.5 bg-gray-100 shadow-sm rounded-lg p-0.5 h-auto">
            <TabsTrigger value="tasks" className="flex items-center justify-center gap-1 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-travel-blue-dark data-[state=active]:text-white rounded-md">
              <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center justify-center gap-1 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-travel-orange data-[state=active]:text-white rounded-md">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center justify-center gap-1 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-travel-teal data-[state=active]:text-white rounded-md">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center justify-center gap-1 py-2 px-1 text-xs sm:text-sm data-[state=active]:bg-travel-blue-medium data-[state=active]:text-white rounded-md">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Rules</span>
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 order-2 lg:order-1">
                {/* Task Filter Dropdown */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-travel-blue-dark">Your Tasks</h3>
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-travel-blue-dark/20"
                  >
                    <option value="all">All Tasks ({tasks.length})</option>
                    <option value="pending">Pending ({tasks.filter(t => t.status === 'pending').length})</option>
                    <option value="in-progress">In Progress ({tasks.filter(t => t.status === 'in-progress').length})</option>
                    <option value="completed">Completed ({tasks.filter(t => t.status === 'completed' || t.status === 'verified').length})</option>
                  </select>
                </div>
                <AgentTaskList 
                  tasks={taskStatusFilter === 'all' 
                    ? tasks 
                    : taskStatusFilter === 'completed' 
                      ? tasks.filter(t => t.status === 'completed' || t.status === 'verified')
                      : tasks.filter(t => t.status === taskStatusFilter)
                  } 
                  onCompleteTask={handleCompleteTask}
                  loading={tasksLoading}
                  showAllTasks={taskStatusFilter !== 'all'}
                />
              </div>
              <div className="order-1 lg:order-2">
                <AgentWalletCard wallet={wallet} recentHistory={taskHistory.slice(0, 5)} />
              </div>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="mt-4">
            <div className="max-w-md mx-auto">
              <AgentWalletCard wallet={wallet} recentHistory={taskHistory} />
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Your Assigned Bookings
                </h2>
                
                <div className="relative">
                  <select
                    className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full shadow-sm"
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
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading your bookings...</p>
              </div>
            ) : filteredBookings().length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookings().map((booking) => (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                              {Array.isArray(booking.passengers) ? booking.passengers
                                .filter((passenger: any) => passenger && (passenger.name || passenger.age || passenger.gender))
                                .map((passenger: any, idx: number) => (
                                <div key={idx} className="text-sm bg-gray-50 p-1 rounded mb-1">
                                  {passenger.name || 'N/A'} ({passenger.age || 'N/A'} yrs, {passenger.gender || 'N/A'})
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
                              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                              title="Call"
                            >
                              <Phone size={16} />
                            </button>
                            <button
                              onClick={() => handleWhatsapp(booking.phone, booking)}
                              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button
                              onClick={() => handleEmail(booking.email)}
                              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
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
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No {statusFilter === 'all' ? '' : statusFilter} bookings assigned to you.</p>
              </div>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="mt-6">
            <AgentRulesRegulations />
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
                        // Keep the existing booking charge - don't recalculate when ticket cost changes
                        setMessageDetails({
                          ...messageDetails,
                          ticketCost: newTicketCost
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
                
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <Label htmlFor="couponCode" className="text-sm font-medium mb-2 block">Apply Coupon</Label>
                  <CouponInput onApplyCoupon={handleApplyCoupon} />
                </div>
                
                <div>
                  <Label htmlFor="totalAmount" className="flex justify-between">
                    <span>Total Amount (₹)</span>
                    {messageDetails.couponDiscount > 0 && (
                      <span className="text-green-600 text-sm font-medium">
                        Discount: {messageDetails.couponType === 'percentage' 
                          ? `${messageDetails.couponDiscount}%` 
                          : `₹${messageDetails.couponDiscount}`}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="totalAmount"
                    type="text"
                    value={calculateTotal()}
                    readOnly
                    className={`bg-gray-50 ${messageDetails.couponDiscount > 0 ? 'border-green-500 shadow-sm' : ''}`}
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
