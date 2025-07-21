import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, DollarSign, Phone, Mail, MessageSquare, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useHotelBookingManagement } from "@/hooks/useHotelBookingManagement";
import { useToast } from "@/hooks/use-toast";

interface HotelBookingsTabProps {
  user: any;
}

const HotelBookingsTab = ({ user }: HotelBookingsTabProps) => {
  const { toast } = useToast();
  const {
    bookings,
    loading,
    updateBookingStatus
  } = useHotelBookingManagement();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bookings based on status and search
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    const matchesSearch = searchQuery === '' || 
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Bookings</h2>
          <p className="text-gray-600 mt-1">Manage hotel reservations and guest details</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
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
          
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {booking.guestName}
                      <Badge className={getStatusColor(booking.bookingStatus)}>
                        {booking.bookingStatus}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Booking ID: {booking.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-travel-blue-dark">
                      ₹{booking.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.totalNights} night{booking.totalNights !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{booking.hotelName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''} • {booking.numberOfRooms} room{booking.numberOfRooms !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Room Type:</span>
                      <br />
                      <span className="font-medium">{booking.roomTypeId}</span>
                    </div>
                    {booking.paymentStatus && (
                      <div className="text-sm">
                        <span className="text-gray-600">Payment:</span>
                        <br />
                        <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{booking.guestPhone}</span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                    <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="border-t pt-3 flex flex-wrap gap-2">
                  <Select
                    value={booking.bookingStatus}
                    onValueChange={(value) => handleStatusUpdate(booking.id, value as 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled')}
                  >
                    <SelectTrigger className="w-32">
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
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(booking.guestPhone)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEmail(booking.guestEmail)}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {booking.created_at && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Booked on: {booking.created_at.toLocaleDateString()} at {booking.created_at.toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'No bookings match your current filters.' 
                : 'Hotel bookings will appear here once guests make reservations.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotelBookingsTab;
