import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Phone, Mail, MessageSquare } from "lucide-react";

interface Passenger {
  name: string;
  age: string | number;
  gender: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  from: string;
  to: string;
  journey_date: string;
  booking_type: string;
  passengers: Passenger[] | string | number;
  status?: 'pending' | 'completed';
  created_at: Date;
  assignedAgent?: string;
}

const AgentDashboard = () => {
  const { user, signOut, loading, isAgent } = useAuth();
  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is an agent
    if (!loading && (!user || !isAgent)) {
      navigate("/agent-login", { replace: true });
      return;
    }

    if (user && isAgent && user.email) {
      // Fetch assigned bookings for this agent
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('assignedAgent', '==', user.email),
        orderBy('created_at', 'desc')
      );

      const unsubscribe = onSnapshot(bookingsQuery, 
        (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate() || new Date()
          })) as Booking[];
          
          setAssignedBookings(bookingsData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error listening to assigned bookings:", error);
          toast({
            title: "Error",
            description: "Failed to load your assigned bookings",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, isAgent, loading, navigate, toast]);

  const formatFirebaseTimestamp = (timestamp: Date | null | undefined) => {
    if (!timestamp) return 'Unknown';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(timestamp);
  };

  const updateStatus = async (bookingId: string, status: 'pending' | 'completed') => {
    if (!user?.email) return;
    
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: status,
        updated_at: serverTimestamp(),
        updated_by: user.email
      });
      
      toast({
        title: "Status Updated",
        description: `Booking status has been changed to ${status}`,
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

  const handleWhatsapp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/agent-login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const bookingStats = useMemo(() => {
    const pending = assignedBookings.filter(b => !b.status || b.status === 'pending').length;
    const completed = assignedBookings.filter(b => b.status === 'completed').length;
    const total = assignedBookings.length;
    
    return { pending, completed, total };
  }, [assignedBookings]);
  
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return assignedBookings;
    if (statusFilter === 'pending') return assignedBookings.filter(b => !b.status || b.status === 'pending');
    if (statusFilter === 'completed') return assignedBookings.filter(b => b.status === 'completed');
    return assignedBookings;
  }, [assignedBookings, statusFilter]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="bg-white shadow-sm mb-6 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-travel-blue-dark">Agent Dashboard</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <Button onClick={handleSignOut} className="bg-travel-blue-dark hover:bg-travel-blue-dark/90">Sign Out</Button>
        </div>
      </header>

      <main className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold">Assigned Bookings</h2>
          
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <select
              className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Bookings ({bookingStats.total})</option>
              <option value="pending">Pending ({bookingStats.pending})</option>
              <option value="completed">Completed ({bookingStats.completed})</option>
            </select>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{booking.name}</h3>
                    <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={booking.status || 'pending'}
                      onChange={(e) => updateStatus(booking.id, e.target.value as 'pending' | 'completed')}
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
                </div>

                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Contact:</span> {booking.phone} | {booking.email}</p>
                  <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                  <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                  <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                  <div>
                    <span className="font-medium">Passengers:</span>
                    <div className="ml-2 mt-1">
                      {Array.isArray(booking.passengers) ? (
                        booking.passengers.map((passenger: Passenger, idx: number) => (
                          <div key={idx} className="text-sm bg-gray-50 p-1 rounded mb-1">
                            {passenger.name} ({passenger.age} yrs, {passenger.gender})
                          </div>
                        ))
                      ) : (
                        <div>{booking.passengers}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleCall(booking.phone)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                    title="Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => handleWhatsapp(booking.phone)}
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No {statusFilter === 'all' ? '' : statusFilter} bookings assigned yet</p>
              {statusFilter !== 'all' && bookingStats.total > 0 && (
                <p className="text-sm mt-2">Try changing the filter to view other bookings</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
