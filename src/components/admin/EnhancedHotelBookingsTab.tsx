import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  UserCheck,
  Bed
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useHotelBookingManagement } from "@/hooks/useHotelBookingManagement";
import { useToast } from "@/hooks/use-toast";
import { HotelBooking } from "@/types/hotel";

interface HotelBookingsTabProps {
  user: any;
}

const HotelBookingsTab = ({ user }: HotelBookingsTabProps) => {
  const { toast } = useToast();
  const {
    bookings,
    loading,
    updateBookingStatus,
    updateBooking,
    cancelBooking,
    assignToAgent
  } = useHotelBookingManagement();
  
  // State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [viewingBooking, setViewingBooking] = useState<HotelBooking | null>(null);
  const [editingBooking, setEditingBooking] = useState<HotelBooking | null>(null);
  const [adminNotes, setAdminNotes] = useState<{[key: string]: string}>({});

  // Filter bookings based on status, search, and date
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    const matchesSearch = searchQuery === '' || 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.checkInDate);
      const today = new Date();
      const daysDiff = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'tomorrow':
          matchesDate = daysDiff === 1;
          break;
        case 'week':
          matchesDate = daysDiff >= 0 && daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff >= 0 && daysDiff <= 30;
          break;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Get booking stats
  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    checkedIn: bookings.filter(b => b.bookingStatus === 'checked_in').length,
    completed: bookings.filter(b => b.bookingStatus === 'checked_out').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    revenue: bookings
      .filter(b => b.bookingStatus === 'checked_out')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'checked_in': return 'bg-blue-500';
      case 'checked_out': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'checked_in': return 'default';
      case 'checked_out': return 'default';
      default: return 'outline';
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled') => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success) {
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.length === 0) return;
    
    const confirmMessage = `Are you sure you want to update ${selectedBookings.length} booking(s) to ${status}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await Promise.all(
        selectedBookings.map(id => updateBookingStatus(id, status as any))
      );
      setSelectedBookings([]);
      toast({
        title: "Bulk Update Completed",
        description: `${selectedBookings.length} booking(s) updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Bulk Update Failed",
        description: "Some bookings could not be updated",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      const success = await cancelBooking(bookingId, 'Deleted by admin');
      if (success) {
        toast({
          title: "Booking Deleted",
          description: "Booking has been deleted successfully",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Bookings</h2>
          <p className="text-gray-600 mt-1">Manage hotel reservations and guest details</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{bookingStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{bookingStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{bookingStats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-blue-600">{bookingStats.checkedIn}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{bookingStats.completed}</p>
              </div>
              <Home className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{bookingStats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-green-600">₹{(bookingStats.revenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by guest name, email, booking ID, or hotel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedBookings.length} booking(s) selected
          </span>
          <Select onValueChange={handleBulkStatusUpdate}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
              <SelectItem value="checked_in">Mark as Checked In</SelectItem>
              <SelectItem value="checked_out">Mark as Checked Out</SelectItem>
              <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedBookings([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings([...selectedBookings, booking.id]);
                          } else {
                            setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{booking.guestName}</h3>
                        <p className="text-sm text-gray-600">ID: {booking.id.slice(-8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(booking.bookingStatus)}>
                        {booking.bookingStatus.replace('_', ' ')}
                      </Badge>
                      <Select
                        value={booking.bookingStatus}
                        onValueChange={(value) => handleStatusUpdate(booking.id, value as any)}
                      >
                        <SelectTrigger className="w-32 h-8">
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
                  </div>

                  {/* Hotel & Room Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{booking.hotelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <span>{booking.roomTypeName}</span>
                      <span className="text-gray-400">•</span>
                      <span>{booking.numberOfRooms} room(s)</span>
                      <span className="text-gray-400">•</span>
                      <span>{booking.numberOfGuests} guest(s)</span>
                    </div>
                  </div>

                  {/* Dates & Duration */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{booking.totalNights} night(s)</span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${booking.guestPhone}`} className="hover:text-blue-600">
                        {booking.guestPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${booking.guestEmail}`} className="hover:text-blue-600">
                        {booking.guestEmail}
                      </a>
                    </div>
                  </div>

                  {/* Amount & Payment Status */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div>
                      <span className="text-lg font-bold">{formatCurrency(booking.totalAmount)}</span>
                      <Badge 
                        variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingBooking(booking)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingBooking(booking)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCall(booking.guestPhone)}
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="pt-2 border-t">
                    <Textarea
                      placeholder="Add admin notes..."
                      value={adminNotes[booking.id] || booking.adminNotes || ''}
                      onChange={(e) => setAdminNotes(prev => ({
                        ...prev,
                        [booking.id]: e.target.value
                      }))}
                      className="text-sm resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-600">No hotel bookings match your current filters.</p>
        </div>
      )}

      {/* View Booking Modal */}
      <Dialog open={!!viewingBooking} onOpenChange={() => setViewingBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {viewingBooking && (
            <div className="space-y-6">
              {/* Booking info content would go here */}
              <p>Full booking details for {viewingBooking.guestName}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-6">
              {/* Edit booking form would go here */}
              <p>Edit form for {editingBooking.guestName}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelBookingsTab;