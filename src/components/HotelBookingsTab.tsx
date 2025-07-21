import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Clock,
  Users,
  Home,
  CreditCard,
  Check,
  X,
  Eye,
  Edit,
  MessageSquare,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHotelBookingManagement } from "@/hooks/useHotelBookingManagement";
import { HotelBooking } from "@/types/hotel";
import { useToast } from "@/hooks/use-toast";

interface HotelBookingsTabProps {
  user: any;
  agents: any[];
  formatFirebaseTimestamp: (timestamp: any) => string;
  handleCall: (phone: string) => void;
  handleEmail: (email: string) => void;
  handleWhatsapp: (phone: string, booking: any) => void;
}

const HotelBookingsTab = ({
  user,
  agents,
  formatFirebaseTimestamp,
  handleCall,
  handleEmail,
  handleWhatsapp
}: HotelBookingsTabProps) => {
  const { toast } = useToast();
  const {
    bookings,
    loading,
    createBooking,
    updateBooking,
    cancelBooking,
    selectedBooking,
    setSelectedBooking
  } = useHotelBookingManagement();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingForView, setSelectedBookingForView] = useState<HotelBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<HotelBooking | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.bookingStatus === statusFilter;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle status update
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const success = await updateBooking(bookingId, { 
      bookingStatus: newStatus as any 
    });
    
    if (success) {
      toast({
        title: "Status Updated",
        description: `Booking status has been updated to ${newStatus}`,
      });
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (bookingId: string, newStatus: string) => {
    const success = await updateBooking(bookingId, { 
      paymentStatus: newStatus as any 
    });
    
    if (success) {
      toast({
        title: "Payment Status Updated",
        description: `Payment status has been updated to ${newStatus}`,
      });
    }
  };

  // Handle notes update
  const handleNotesUpdate = async (bookingId: string, notes: string) => {
    const success = await updateBooking(bookingId, { 
      adminNotes: notes 
    });
    
    if (success) {
      setAdminNotes({ ...adminNotes, [bookingId]: notes });
      toast({
        title: "Notes Updated",
        description: "Admin notes have been updated",
      });
    }
  };

  // Open edit modal
  const openEditModal = (booking: HotelBooking) => {
    setEditBooking(booking);
    setEditFormData({
      guestName: booking.guestName || '',
      guestEmail: booking.guestEmail || '',
      guestPhone: booking.guestPhone || '',
      numberOfRooms: booking.numberOfRooms || 1,
      numberOfGuests: booking.numberOfGuests || 2,
      specialRequests: booking.specialRequests || '',
      bookingStatus: booking.bookingStatus || 'pending',
      paymentStatus: booking.paymentStatus || 'pending'
    });
    setEditModalOpen(true);
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editBooking) return;

    const success = await updateBooking(editBooking.id, {
      guestName: editFormData.guestName,
      guestEmail: editFormData.guestEmail,
      guestPhone: editFormData.guestPhone,
      numberOfRooms: parseInt(editFormData.numberOfRooms),
      numberOfGuests: parseInt(editFormData.numberOfGuests),
      specialRequests: editFormData.specialRequests,
      bookingStatus: editFormData.bookingStatus,
      paymentStatus: editFormData.paymentStatus
    });

    if (success) {
      setEditModalOpen(false);
      setEditBooking(null);
      setEditFormData({});
    }
  };

  // Assign booking to agent
  const assignToAgent = async (bookingId: string, agentEmail: string) => {
    const success = await updateBooking(bookingId, { 
      assignedAgent: agentEmail,
      assignedAt: new Date()
    });
    
    if (success) {
      toast({
        title: "Agent Assigned",
        description: "Booking has been assigned to agent",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Bookings</h2>
          <p className="text-gray-600 mt-1">Manage hotel bookings and reservations</p>
        </div>
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.bookingStatus === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.bookingStatus === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.bookingStatus === 'checked_in').length}
              </div>
              <div className="text-sm text-gray-600">Checked In</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {bookings.filter(b => b.bookingStatus === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.hotelName}</CardTitle>
                    <p className="text-sm text-gray-600">{booking.roomTypeName}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(booking.bookingStatus)}>
                      {booking.bookingStatus}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Guest Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm font-medium">{booking.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm">{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm">{booking.guestPhone}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm">{booking.checkInDate} to {booking.checkOutDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm">{booking.numberOfRooms} room(s), {booking.numberOfGuests} guest(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold">₹{booking.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-600 font-medium">Special Requests:</p>
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="pt-2">
                  <Textarea
                    placeholder="Add admin notes..."
                    value={adminNotes[booking.id] || booking.adminNotes || ''}
                    onChange={(e) => setAdminNotes({ ...adminNotes, [booking.id]: e.target.value })}
                    onBlur={() => handleNotesUpdate(booking.id, adminNotes[booking.id] || '')}
                    className="text-xs min-h-[60px]"
                  />
                </div>

                {/* Agent Assignment */}
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Assigned Agent</label>
                  <Select
                    value={booking.assignedAgent || ''}
                    onValueChange={(value) => assignToAgent(booking.id, value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.email}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {/* Status Actions */}
                  {booking.bookingStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check size={14} className="mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      >
                        <X size={14} className="mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {booking.bookingStatus === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'checked_in')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Check size={14} className="mr-1" />
                      Check In
                    </Button>
                  )}
                  
                  {booking.bookingStatus === 'checked_in' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(booking.id, 'checked_out')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Check size={14} className="mr-1" />
                      Check Out
                    </Button>
                  )}

                  {/* Communication Actions */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(booking.guestPhone)}
                  >
                    <Phone size={14} className="mr-1" />
                    Call
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsapp(booking.guestPhone, booking)}
                  >
                    <MessageSquare size={14} className="mr-1" />
                    WhatsApp
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(booking)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Booking Timestamp */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Created: {formatFirebaseTimestamp(booking.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotel bookings found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'No hotel bookings have been made yet.' 
                : `No ${statusFilter} hotel bookings found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hotel Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guest Name</label>
              <input
                type="text"
                value={editFormData.guestName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guestName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={editFormData.guestEmail || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guestEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={editFormData.guestPhone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guestPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rooms</label>
                <input
                  type="number"
                  min="1"
                  value={editFormData.numberOfRooms || 1}
                  onChange={(e) => setEditFormData({ ...editFormData, numberOfRooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={editFormData.numberOfGuests || 2}
                  onChange={(e) => setEditFormData({ ...editFormData, numberOfGuests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Special Requests</label>
              <Textarea
                value={editFormData.specialRequests || ''}
                onChange={(e) => setEditFormData({ ...editFormData, specialRequests: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Booking Status</label>
                <Select
                  value={editFormData.bookingStatus}
                  onValueChange={(value) => setEditFormData({ ...editFormData, bookingStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="checked_out">Checked Out</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <Select
                  value={editFormData.paymentStatus}
                  onValueChange={(value) => setEditFormData({ ...editFormData, paymentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelBookingsTab;
