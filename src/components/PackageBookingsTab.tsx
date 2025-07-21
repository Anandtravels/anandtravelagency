import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { collection, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from "@/components/ui/checkbox";
import { TrashIcon, Phone, Mail, MessageSquare, Edit3, Calendar, Users, MapPin, DollarSign } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

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

  // Edit booking functions
  const openEditModal = (booking: any) => {
    setEditBooking(booking);
    setEditFormData({
      fullName: booking.fullName || booking.name || '',
      email: booking.email || '',
      phone: booking.phone || '',
      numberOfPeople: booking.numberOfPeople || booking.adults_count || 1,
      departureDate: booking.departureDate || booking.travel_date || '',
      message: booking.message || booking.special_requests || '',
      packageTitle: booking.packageTitle || booking.package_name || '',
      totalAmount: booking.totalAmount || 0
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editBooking) return;

    try {
      if (!user || user.email !== 'admin@anandtravels.com') {
        throw new Error('Unauthorized access');
      }

      await updateDoc(doc(db, 'package_bookings', editBooking.id), {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
        numberOfPeople: parseInt(editFormData.numberOfPeople),
        departureDate: editFormData.departureDate,
        message: editFormData.message,
        packageTitle: editFormData.packageTitle,
        totalAmount: parseFloat(editFormData.totalAmount),
        updated_at: serverTimestamp(),
        updated_by: user.email
      });

      toast({
        title: "Booking Updated",
        description: "Package booking has been updated successfully",
      });

      setEditModalOpen(false);
      setEditBooking(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update package booking. Please check your permissions.",
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

      {/* Package Bookings Grid View - All Screen Sizes */}
      {packageBookingLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
        </div>
      ) : filteredPackageBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredPackageBookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 hover:shadow-lg transition-all duration-300 relative">
              {/* Header with Checkbox and Status */}
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
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {booking.fullName || booking.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      {formatFirebaseTimestamp(booking.created_at)}
                    </p>
                  </div>
                </div>
                <select
                  value={booking.status || 'pending'}
                  onChange={(e) => updatePackageBookingStatus(booking.id, e.target.value as 'pending' | 'completed')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 ${
                    booking.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Payment Done</option>
                </select>
              </div>

              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {booking.packageTitle || booking.package_name}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <span className="text-gray-700">{booking.departureDate || booking.travel_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-gray-700">
                      {booking.numberOfPeople || `${booking.adults_count} Adults`}
                    </span>
                  </div>
                </div>

                {booking.totalAmount && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-bold text-green-600 text-lg">
                      ₹{booking.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Contact Information</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span className="text-gray-700">{booking.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-gray-700">{booking.phone}</span>
                  </p>
                </div>
              </div>

              {/* Message/Special Requests */}
              {(booking.message || booking.special_requests) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Message</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    {booking.message || booking.special_requests}
                  </p>
                </div>
              )}

              {/* Agent Assignment */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Assign to Agent</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={booking.assignedAgent || ''}
                  onChange={(e) => assignPackageTicket && assignPackageTicket(booking.id, e.target.value)}
                >
                  <option value="">Select Agent</option>
                  {agents.map((agent: any) => {
                    const hasValidPhone = agent.phone && agent.phone.replace(/\D/g, '').length >= 10;
                    return (
                      <option key={agent.id} value={agent.email}>
                        {agent.name}{!hasValidPhone ? ' ⚠️ (No WhatsApp)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Admin Notes</label>
                <Textarea
                  value={adminNotes[booking.id] || ''}
                  onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                  placeholder="Add notes about this booking..."
                  className="w-full text-sm resize-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(booking.phone)}
                    className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    title="Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => handleWhatsapp(booking.phone, booking)}
                    className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
                    title="WhatsApp"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    onClick={() => handleEmail(booking.email)}
                    className="p-2.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                    title="Email"
                  >
                    <Mail size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(booking)}
                    className="p-2.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                    title="Edit Booking"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>

                <button
                  onClick={() => deletePackageBookings([booking.id])}
                  className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  title="Delete this package booking"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Package Bookings Found</h3>
            <p className="text-gray-500">
              No {packageStatusFilter === 'all' ? '' : packageStatusFilter} package bookings available at the moment.
            </p>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Package Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-fullName">Full Name *</Label>
                <Input
                  id="edit-fullName"
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-numberOfPeople">Number of People *</Label>
                <Input
                  id="edit-numberOfPeople"
                  type="number"
                  min="1"
                  value={editFormData.numberOfPeople || 1}
                  onChange={(e) => setEditFormData({...editFormData, numberOfPeople: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-packageTitle">Package Title *</Label>
              <Input
                id="edit-packageTitle"
                value={editFormData.packageTitle || ''}
                onChange={(e) => setEditFormData({...editFormData, packageTitle: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-departureDate">Departure Date *</Label>
                <Input
                  id="edit-departureDate"
                  type="date"
                  value={editFormData.departureDate || ''}
                  onChange={(e) => setEditFormData({...editFormData, departureDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-totalAmount">Total Amount</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  min="0"
                  value={editFormData.totalAmount || ''}
                  onChange={(e) => setEditFormData({...editFormData, totalAmount: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-message">Message/Special Requests</Label>
              <Textarea
                id="edit-message"
                placeholder="Any special requirements or questions..."
                value={editFormData.message || ''}
                onChange={(e) => setEditFormData({...editFormData, message: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageBookingsTab;
