import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

const AgentDashboard = () => {
  const [assignedBookings, setAssignedBookings] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'bookings'),
      where('assignedAgent', '==', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignedBookings(bookings);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (bookingId: string, status: 'pending' | 'completed') => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: status
      });
      
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="bg-white shadow-sm mb-6 p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-travel-blue-dark">Agent Dashboard</h1>
        <p className="text-gray-600">{user?.email}</p>
      </header>

      <main className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Assigned Bookings</h2>
        
        <div className="grid gap-4">
          {assignedBookings.map((booking: any) => (
            <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{booking.name}</h3>
                  <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                </div>
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

              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Contact:</span> {booking.phone} | {booking.email}</p>
                <p><span className="font-medium">Service:</span> {booking.booking_type}</p>
                <p><span className="font-medium">Journey:</span> {booking.from} to {booking.to}</p>
                <p><span className="font-medium">Date:</span> {booking.journey_date}</p>
                <div>
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
              </div>
            </div>
          ))}

          {assignedBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings assigned yet
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;
