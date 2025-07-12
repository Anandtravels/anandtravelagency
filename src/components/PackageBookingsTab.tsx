import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { collection, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from "@/components/ui/checkbox";
import { TrashIcon, Phone, Mail, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import debounce from 'lodash/debounce';

interface PackageBookingsTabProps {
  user: any;
  agents: any[];
  adminNotes: { [key: string]: string };
  setAdminNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleCall: (phone: string) => void;
  handleEmail: (email: string) => void;
  handleWhatsapp: (phone: string, booking?: any) => void;
  formatFirebaseTimestamp: (timestamp: any) => string;
  assignPackageTicket?: (bookingId: string, agentEmail: string) => Promise<void>;
}

const PackageBookingsTab = ({ 
  user, 
  agents, 
  adminNotes, 
  setAdminNotes, 
  handleCall, 
  handleEmail, 
  handleWhatsapp,
  formatFirebaseTimestamp,
  assignPackageTicket 
}: PackageBookingsTabProps) => {
  const { toast } = useToast();

  // Package booking specific state
  const [packageBookings, setPackageBookings] = useState<any[]>([]);
  const [packageBookingLoading, setPackageBookingLoading] = useState(true);
  const [selectedPackageBookings, setSelectedPackageBookings] = useState<string[]>([]);
  const [packageStatusFilter, setPackageStatusFilter] = useState<string>('all');

  // Memoized values for package bookings
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

  // Debounced note update function
  const debouncedNoteUpdate = useCallback(
    debounce(async (id: string, note: string) => {
      try {
        await updateDoc(doc(db, 'package_bookings', id), {
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
    debouncedNoteUpdate(id, note);
  }, [debouncedNoteUpdate, setAdminNotes]);

  // Package booking functions
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

  // Setup real-time listener for package bookings
  useEffect(() => {
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

    // Cleanup function
    return () => {
      packageBookingsUnsubscribe();
    };
  }, [toast, setAdminNotes]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedNoteUpdate.cancel();
    };
  }, [debouncedNoteUpdate]);

  return (
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
              <option value="completed">Payment Done ({packageBookingStats.completed})</option>
            </select>
          </div>
          
          {/* Select All and Delete selected buttons */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={filteredPackageBookings.length > 0 && selectedPackageBookings.length === filteredPackageBookings.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPackageBookings(filteredPackageBookings.map(b => b.id));
                  } else {
                    setSelectedPackageBookings([]);
                  }
                }}
                id="select-all-packages"
              />
              <label 
                htmlFor="select-all-packages" 
                className="text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                Select All
              </label>
            </div>
            
            {selectedPackageBookings.length > 0 && (
              <button
                onClick={() => deletePackageBookings(selectedPackageBookings)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow"
              >
                <TrashIcon size={16} className="animate-pulse" />
                <span className="font-medium">Delete ({selectedPackageBookings.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Package bookings list */}
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
                  <option value="completed">Payment Done</option>
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
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Admin Notes</label>
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
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    title="Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => handleWhatsapp(booking.phone, booking)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    title="WhatsApp"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={() => handleEmail(booking.email)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="Email"
                  >
                    <Mail size={16} />
                  </button>
                </div>

                {/* Delete Button */}
                <div>
                  <button
                    onClick={() => deletePackageBookings([booking.id])}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 group"
                    title="Delete this package booking"
                  >
                    <TrashIcon size={16} className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Assign to Agent</label>
                <div className="w-full max-w-full overflow-hidden">
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={booking.assignedAgent || ''}
                    onChange={(e) => assignPackageTicket && assignPackageTicket(booking.id, e.target.value)}
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
    </div>
  );
};

export default PackageBookingsTab;
