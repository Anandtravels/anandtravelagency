import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Mail,
  Clock,
  Home,
  Download,
  Share2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { HotelService } from "../services/hotelService";
import { HotelBooking } from "../types/hotel";

const HotelBookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        navigate('/hotels');
        return;
      }
      
      try {
        const bookingData = await HotelService.getHotelBooking(bookingId);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error loading booking:', error);
        navigate('/hotels');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  const shareBooking = () => {
    if (navigator.share && booking) {
      navigator.share({
        title: `Hotel Booking Confirmation`,
        text: `My hotel booking at ${booking.hotelName} is confirmed!`,
        url: window.location.href,
      });
    }
  };

  const downloadBooking = () => {
    if (!booking) return;
    
    // Create a simple text receipt
    const receiptText = `
HOTEL BOOKING CONFIRMATION
========================

Booking ID: ${booking.id}
Hotel: ${booking.hotelName}
Room Type: ${booking.roomTypeName}

Guest Details:
Name: ${booking.guestName}
Email: ${booking.guestEmail}
Phone: ${booking.guestPhone}

Booking Details:
Check-in: ${booking.checkInDate}
Check-out: ${booking.checkOutDate}
Nights: ${booking.totalNights}
Rooms: ${booking.numberOfRooms}
Guests: ${booking.numberOfGuests}

Amount Details:
Price per night: ₹${booking.pricePerNight.toLocaleString()}
Total Amount: ₹${booking.totalAmount.toLocaleString()}

Special Requests: ${booking.specialRequests || 'None'}

Status: ${booking.bookingStatus.toUpperCase()}
Payment: ${booking.paymentStatus.toUpperCase()}

Booked on: ${booking.created_at instanceof Date ? booking.created_at.toLocaleDateString() : new Date(booking.created_at).toLocaleDateString()}

Thank you for choosing Anand Travel Agency!
Contact: +91 8985816481
Email: info@anandtravelagency.com
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-booking-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/hotels')} variant="outline">
              Back to Hotels
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container-custom">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Your hotel booking has been successfully submitted. You will receive a confirmation email shortly.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-travel-blue-dark text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Booking Confirmation</h2>
                    <p className="text-blue-100">Booking ID: #{booking.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Status</div>
                    <div className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                      {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{booking.hotelName}</h3>
                <div className="text-gray-600 mb-2">{booking.roomTypeName}</div>
              </div>

              {/* Guest Details */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Guest Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Guest Name</div>
                      <div className="font-medium">{booking.guestName}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{booking.guestEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{booking.guestPhone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Check-in</div>
                        <div className="font-medium">{booking.checkInDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Check-out</div>
                        <div className="font-medium">{booking.checkOutDate}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Duration</div>
                        <div className="font-medium">{booking.totalNights} night{booking.totalNights > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Rooms & Guests</div>
                        <div className="font-medium">{booking.numberOfRooms} room{booking.numberOfRooms > 1 ? 's' : ''}, {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {booking.specialRequests && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                    <div className="text-gray-900">{booking.specialRequests}</div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Payment Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per night</span>
                    <span>₹{booking.pricePerNight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of nights</span>
                    <span>{booking.totalNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of rooms</span>
                    <span>{booking.numberOfRooms}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-travel-blue-dark">
                        ₹{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={downloadBooking}
                variant="outline"
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Confirmation
              </Button>
              
              {navigator.share && (
                <Button
                  onClick={shareBooking}
                  variant="outline"
                  className="flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
              )}
              
              <Button
                onClick={() => navigate('/hotels')}
                className="bg-travel-orange hover:bg-travel-orange/90 text-white flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Book Another Hotel
              </Button>
            </div>

            {/* Important Information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">Important Information</h4>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• Please carry a valid ID proof during check-in</li>
                <li>• Check-in time is typically 2:00 PM and check-out is 11:00 AM</li>
                <li>• For any changes or cancellations, please contact us at +91 8985816481</li>
                <li>• Payment can be made at the hotel during check-in or online</li>
                <li>• A confirmation email with hotel contact details will be sent shortly</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-2">Need help with your booking?</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <a 
                  href="tel:+918985816481" 
                  className="flex items-center text-travel-orange hover:text-travel-orange/80"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  +91 8985816481
                </a>
                <a 
                  href="mailto:info@anandtravelagency.com" 
                  className="flex items-center text-travel-orange hover:text-travel-orange/80"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  info@anandtravelagency.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HotelBookingSuccess;
