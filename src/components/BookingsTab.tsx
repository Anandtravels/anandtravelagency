import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { collection, query, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, PencilIcon, Check, X, Phone, Mail, MessageSquare } from "lucide-react";
import { debounce } from 'lodash';

interface BookingsTabProps {
  user: any;
  bookings: any[];
  bookingLoading: boolean;
  adminNotes: { [key: string]: string };
  setAdminNotes: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  agents: any[];
  formatFirebaseTimestamp: (timestamp: any) => string;
  handleNoteChange: (id: string, note: string) => void;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'completed' | 'in_process' | 'booked' | 'hold') => Promise<void>;
  deleteBookings: (ids: string[]) => Promise<void>;
  openEditModal: (booking: any) => void;
  handleCall: (phone: string) => void;
  handleEmail: (email: string) => void;
  handleWhatsapp: (phone: string, booking?: any) => void;
  assignTicket: (bookingId: string, agentEmail: string) => Promise<void>;
}

const BookingsTab = ({ 
  user, 
  bookings, 
  bookingLoading, 
  adminNotes, 
  setAdminNotes, 
  agents,
  formatFirebaseTimestamp,
  handleNoteChange,
  updateBookingStatus,
  deleteBookings,
  openEditModal,
  handleCall,
  handleEmail,
  handleWhatsapp,
  assignTicket
}: BookingsTabProps) => {
  const { toast } = useToast();

  // State declarations
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortByJourneyDate, setSortByJourneyDate] = useState<boolean>(false);
  const [trainClassFilter, setTrainClassFilter] = useState<string>('all');

  // Memoized filtered bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(b => !b.status || b.status === 'pending');
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(b => b.status === 'completed');
      } else if (statusFilter === 'in_process') {
        filtered = filtered.filter(b => b.status === 'in_process');
      } else if (statusFilter === 'booked') {
        filtered = filtered.filter(b => b.status === 'booked');
      } else if (statusFilter === 'hold') {
        filtered = filtered.filter(b => b.status === 'hold');
      }
    }
    
    // Apply booking type filter
    if (bookingTypeFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_type === bookingTypeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(b => {
          try {
            const journeyDate = new Date(b.journey_date);
            journeyDate.setHours(0, 0, 0, 0);
            return journeyDate.getTime() === today.getTime();
          } catch (e) {
            return false;
          }
        });
      } else if (dateFilter === 'tomorrow') {
        filtered = filtered.filter(b => {
          try {
            const journeyDate = new Date(b.journey_date);
            journeyDate.setHours(0, 0, 0, 0);
            return journeyDate.getTime() === tomorrow.getTime();
          } catch (e) {
            return false;
          }
        });
      } else if (dateFilter === 'dayAfterTomorrow') {
        filtered = filtered.filter(b => {
          try {
            const journeyDate = new Date(b.journey_date);
            journeyDate.setHours(0, 0, 0, 0);
            return journeyDate.getTime() === dayAfterTomorrow.getTime();
          } catch (e) {
            return false;
          }
        });
      }
    }
    
    // Apply train class filter
    if (trainClassFilter !== 'all') {
      if (trainClassFilter === 'ac') {
        filtered = filtered.filter(b => 
          b.train_class === '3A' || 
          b.train_class === '2A' || 
          b.train_class === '1A' || 
          b.train_class === 'CC' || 
          b.train_class === 'EC'
        );
      } else if (trainClassFilter === 'sleeper') {
        filtered = filtered.filter(b => 
          b.train_class === 'SL' || 
          b.train_class === '2S'
        );
      }
    }
    
    // Sort by journey date if enabled
    if (sortByJourneyDate) {
      filtered = [...filtered].sort((a, b) => {
        // Handle null/undefined journey_date values
        if (!a.journey_date) return 1;
        if (!b.journey_date) return -1;
        
        // Compare dates
        return a.journey_date.localeCompare(b.journey_date);
      });
    }
    
    return filtered;
  }, [bookings, statusFilter, bookingTypeFilter, dateFilter, sortByJourneyDate, trainClassFilter]);

  // Loading state
  if (bookingLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-blue-dark"></div>
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      </div>
    );
  }

  // Component return
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-travel-blue-dark">Booking Requests</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Enhanced filter section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full">
            {/* Status filter dropdown */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Payment Done</option>
                <option value="in_process">In Process</option>
                <option value="booked">Booked</option>
                <option value="hold">Hold</option>
              </select>
            </div>
            
            {/* Booking Type filter dropdown */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                value={bookingTypeFilter}
                onChange={(e) => setBookingTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="flight">Flight</option>
                <option value="cab">Cab</option>
              </select>
            </div>
            
            {/* Date filter dropdown */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="dayAfterTomorrow">Day After Tomorrow</option>
              </select>
            </div>
            
            {/* Train Class filter dropdown */}
            <div className="relative">
              <select
                className="pl-3 pr-10 py-2 text-sm border rounded-md bg-white w-full"
                value={trainClassFilter}
                onChange={(e) => setTrainClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                <option value="ac">AC (3A, 2A, 1A, CC, EC)</option>
                <option value="sleeper">Sleeper (SL, 2S)</option>
              </select>
            </div>
          </div>
          
          {/* Sort toggle button */}
          <div className="flex items-center mb-2 sm:mb-0">
            <button
              onClick={() => setSortByJourneyDate(prev => !prev)}
              className={`px-2.5 py-1.5 text-xs font-medium border rounded-md flex items-center gap-1.5 transition-all hover:shadow-sm ${
                sortByJourneyDate 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              title="Sort by journey date (earliest first)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="hidden sm:inline">Sort by Date</span>
              {sortByJourneyDate && (
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" aria-hidden="true"></span>
              )}
            </button>
          </div>
          
          {/* Select All and Delete selected buttons */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBookings(filteredBookings.map(b => b.id));
                  } else {
                    setSelectedBookings([]);
                  }
                }}
                id="select-all-bookings"
              />
              <label 
                htmlFor="select-all-bookings" 
                className="text-sm font-medium whitespace-nowrap cursor-pointer"
              >
                Select All
              </label>
            </div>
            
            {selectedBookings.length > 0 && (
              <button
                onClick={() => deleteBookings(selectedBookings)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow"
              >
                <TrashIcon size={16} className="animate-pulse" />
                <span className="font-medium">Delete ({selectedBookings.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View for Bookings */}
      <div className="block lg:hidden space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedBookings.includes(booking.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBookings([...selectedBookings, booking.id]);
                      } else {
                        setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <h3 className="font-semibold text-base">{booking.name}</h3>
                    <p className="text-xs text-gray-500">{formatFirebaseTimestamp(booking.created_at)}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {booking.booking_type || 'Not specified'}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'in_process'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'booked'
                          ? 'bg-purple-100 text-purple-800'
                          : booking.status === 'hold'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'completed' ? 'Payment Done' : booking.status === 'in_process' ? 'In Process' : booking.status === 'booked' ? 'Booked' : booking.status === 'hold' ? 'Hold' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <select
                  value={booking.status || 'pending'}
                  onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed' | 'in_process' | 'booked' | 'hold')}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    booking.status === 'completed' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : booking.status === 'in_process'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : booking.status === 'booked'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : booking.status === 'hold'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_process">In Process</option>
                  <option value="booked">Booked</option>
                  <option value="hold">Hold</option>
                  <option value="completed">Payment Done</option>
                </select>
              </div>

              {/* Collapsible Sections */}
              <div className="mt-4 space-y-2">
                <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <summary className="font-medium text-sm cursor-pointer">Journey Details</summary>
                  <div className="mt-2 pt-2 border-t text-sm space-y-1.5">
                    <p><span className="font-medium text-gray-500">From:</span> {booking.from}</p>
                    <p><span className="font-medium text-gray-500">To:</span> {booking.to}</p>
                    <p><span className="font-medium text-gray-500">Date:</span> {booking.journey_date}</p>
                    {booking.station_name && <p><span className="font-medium text-gray-500">Station:</span> {booking.station_name}</p>}
                  </div>
                </details>
                
                <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <summary className="font-medium text-sm cursor-pointer">Contact Information</summary>
                  <div className="mt-2 pt-2 border-t space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <a href={`tel:${booking.phone}`} className="text-sm hover:underline">{booking.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <a href={`mailto:${booking.email}`} className="text-sm hover:underline text-xs sm:text-sm truncate max-w-[200px]">
                        {booking.email}
                      </a>
                    </div>
                  </div>
                </details>
                
                <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <summary className="font-medium text-sm cursor-pointer">Passenger Info</summary>
                  <div className="mt-2 pt-2 border-t text-sm">
                    <div className="max-h-32 overflow-y-auto">
                      {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded mb-1">
                          {passenger.name} <span className="text-gray-500 text-xs">({passenger.age} yrs, {passenger.gender})</span>
                        </div>
                      )) : (
                        <div className="bg-gray-50 p-2 rounded">{booking.passengers}</div>
                      )}
                    </div>
                  </div>
                </details>
                
                {/* Additional Details Section */}
                {(booking.travel_class || booking.class_preference || booking.train_booking_type || 
                  booking.train_class || booking.ticket_number || booking.pnr || 
                  booking.booking_reference || booking.fare_details || booking.preferred_trains) && (
                  <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <summary className="font-medium text-sm cursor-pointer">Additional Details</summary>
                    <div className="mt-2 pt-2 border-t text-sm">
                      {booking.travel_class && <p className="mb-1.5"><span className="font-medium text-gray-500">Travel Class:</span> {booking.travel_class}</p>}
                      {booking.class_preference && <p className="mb-1.5"><span className="font-medium text-gray-500">Class Preference:</span> {booking.class_preference}</p>}
                      {booking.train_booking_type && <p className="mb-1.5"><span className="font-medium text-gray-500">Train Booking Type:</span> {booking.train_booking_type}</p>}
                      {booking.train_class && <p className="mb-1.5"><span className="font-medium text-gray-500">Train Class:</span> {booking.train_class}</p>}
                      {booking.preferred_trains && <p className="mb-1.5"><span className="font-medium text-gray-500">Preferred Trains:</span> {booking.preferred_trains}</p>}
                      {booking.ticket_number && <p className="mb-1.5"><span className="font-medium text-gray-500">Ticket Number:</span> {booking.ticket_number}</p>}
                      {booking.pnr && <p className="mb-1.5"><span className="font-medium text-gray-500">PNR:</span> {booking.pnr}</p>}
                      {booking.booking_reference && <p className="mb-1.5"><span className="font-medium text-gray-500">Booking Reference:</span> {booking.booking_reference}</p>}
                      {booking.fare_details && <p className="mb-1.5"><span className="font-medium text-gray-500">Fare Details:</span> {booking.fare_details}</p>}
                    </div>
                  </details>
                )}
                
                {booking.additional_requirements && (
                  <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <summary className="font-medium text-sm cursor-pointer">Special Requirements</summary>
                    <div className="mt-2 pt-2 border-t text-sm">
                      <p className="text-gray-700">{booking.additional_requirements}</p>
                    </div>
                  </details>
                )}
                
                <details className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                  <summary className="font-medium text-sm cursor-pointer">Admin Notes</summary>
                  <div className="mt-2 pt-2 border-t">
                    <Textarea
                      value={adminNotes[booking.id] || ''}
                      onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                      placeholder="Add notes about this booking..."
                      className="w-full min-h-[80px] text-sm"
                    />
                  </div>
                </details>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCall(booking.phone)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Phone size={14} />
                      <span className="text-xs">Call</span>
                    </button>
                    <button
                      onClick={() => handleWhatsapp(booking.phone, booking)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      <span className="text-xs">WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(booking)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    >
                      <PencilIcon size={14} className="text-blue-600" />
                      <span className="text-xs">Edit</span>
                    </button>
                    <button
                      onClick={() => deleteBookings([booking.id])}
                      className="p-2 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors duration-200 group"
                      title="Delete this booking"
                    >
                      <TrashIcon size={14} className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                      <span className="text-xs group-hover:text-red-600 transition-colors duration-200">Delete</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assign to Agent</label>
                  <select
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                    value={booking.assignedAgent || ''}
                    onChange={(e) => assignTicket(booking.id, e.target.value)}
                  >
                    <option value="">Select Agent</option>
                    {agents.map((agent: any) => (
                      <option key={agent.id} value={agent.email} className="truncate">
                        {agent.name.length > 15 ? agent.name.substring(0, 15) + '...' : agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {statusFilter === 'all' ? '' : statusFilter} bookings found</p>
          </div>
        )}
      </div>

      {/* Desktop View for Bookings */}
      <div className="hidden lg:grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all">
              {/* Card Header */}
              <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-100">
                <div className="absolute right-4 top-4">
                  <select
                    value={booking.status || 'pending'}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value as 'pending' | 'completed' | 'in_process' | 'booked' | 'hold')}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      booking.status === 'completed' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : booking.status === 'in_process'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : booking.status === 'booked'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : booking.status === 'hold'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_process">In Process</option>
                    <option value="booked">Booked</option>
                    <option value="hold">Hold</option>
                    <option value="completed">Payment Done</option>
                  </select>
                </div>

                <div className="flex items-start mb-2">
                  <Checkbox 
                    checked={selectedBookings.includes(booking.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBookings([...selectedBookings, booking.id]);
                      } else {
                        setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                      }
                    }}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{booking.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatFirebaseTimestamp(booking.created_at)}</span>
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {booking.booking_type || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone size={14} className="text-blue-500" />
                    <a href={`tel:${booking.phone}`} className="text-sm hover:underline">{booking.phone}</a>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail size={14} className="text-blue-500" />
                    <a href={`mailto:${booking.email}`} className="text-sm hover:underline">{booking.email}</a>
                  </div>
                </div>
              </div>

              {/* Card Content - Tabbed Interface */}
              <div className="p-4">
                <div className="flex border-b border-gray-200 mb-4">
                  <button 
                    onClick={() => document.getElementById(`journey-${booking.id}`)?.click()}
                    className="pb-2 px-3 text-sm font-medium border-b-2 border-travel-blue-dark text-travel-blue-dark"
                  >
                    Journey
                  </button>
                  <button 
                    onClick={() => document.getElementById(`passengers-${booking.id}`)?.click()}
                    className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Passengers
                  </button>
                  <button 
                    onClick={() => document.getElementById(`details-${booking.id}`)?.click()}
                    className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => document.getElementById(`notes-${booking.id}`)?.click()}
                    className="pb-2 px-3 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Notes
                  </button>
                </div>
                
                {/* Collapsible Content */}
                <div className="space-y-4">
                  <details open>
                    <summary id={`journey-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                      <span className="bg-blue-50 p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </span>
                      Journey Information
                    </summary>
                    <div className="pl-8 pt-2 text-sm space-y-2">
                      <div className="grid gap-1">
                        <p className="flex items-start">
                          <span className="font-medium min-w-[80px] inline-block">From:</span> 
                          <span className="break-all">{booking.from}</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-medium min-w-[80px] inline-block">To:</span>
                          <span className="break-all">{booking.to}</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-medium min-w-[80px] inline-block">Date:</span>
                          <span>{booking.journey_date}</span>
                        </p>
                        {booking.station_name && <p><span className="font-medium min-w-[80px] inline-block">Station:</span> <span className="break-all">{booking.station_name}</span></p>}
                      </div>
                    </div>
                  </details>
                  
                  <details>
                    <summary id={`passengers-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                      <span className="bg-green-50 p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </span>
                      Passenger Information
                    </summary>
                    <div className="pl-8 pt-2 text-sm">
                      <div className="overflow-y-auto max-h-32 space-y-1">
                        {Array.isArray(booking.passengers) ? booking.passengers.map((passenger, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded mb-1 flex items-center">
                            <span className="h-5 w-5 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center mr-2">
                              {idx + 1}
                            </span>
                            <span>{passenger.name} <span className="text-gray-500">({passenger.age} yrs, {passenger.gender})</span></span>
                          </div>
                        )) : (
                          <div className="bg-gray-50 p-2 rounded">{booking.passengers}</div>
                        )}
                      </div>
                    </div>
                  </details>
                  
                  <details>
                    <summary id={`details-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                      <span className="bg-purple-50 p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      Additional Details
                    </summary>
                    <div className="pl-8 pt-2 text-sm space-y-2">
                      {(booking.travel_class || booking.class_preference || booking.train_booking_type || booking.train_class) && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-100">
                          {booking.travel_class && <p><span className="text-xs text-purple-700">Travel Class:</span> <span className="text-sm">{booking.travel_class}</span></p>}
                          {booking.class_preference && <p><span className="text-xs text-purple-700">Class Preference:</span> <span className="text-sm">{booking.class_preference}</span></p>}
                          {booking.train_booking_type && <p><span className="text-xs text-purple-700">Train Booking Type:</span> <span className="text-sm">{booking.train_booking_type}</span></p>}
                          {booking.train_class && <p><span className="text-xs text-purple-700">Train Class:</span> <span className="text-sm">{booking.train_class}</span></p>}
                          {booking.preferred_trains && <p><span className="text-xs text-purple-700">Preferred Trains:</span> <span className="text-sm">{booking.preferred_trains}</span></p>}
                        </div>
                      )}
                      
                      {(booking.ticket_number || booking.pnr || booking.booking_reference || booking.fare_details) && (
                        <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">Ticket Information</p>
                          {booking.ticket_number && <p><span className="text-xs text-yellow-700">Ticket Number:</span> <span className="text-sm">{booking.ticket_number}</span></p>}
                          {booking.pnr && <p><span className="text-xs text-yellow-700">PNR:</span> <span className="text-sm">{booking.pnr}</span></p>}
                          {booking.booking_reference && <p><span className="text-xs text-yellow-700">Booking Ref:</span> <span className="text-sm">{booking.booking_reference}</span></p>}
                          {booking.fare_details && <p><span className="text-xs text-yellow-700">Fare Details:</span> <span className="text-sm">{booking.fare_details}</span></p>}
                        </div>
                      )}
                      
                      {booking.additional_requirements && (
                        <div className="bg-red-50 p-2 rounded border border-red-100">
                          <p className="text-xs font-semibold text-red-800 mb-1">Special Requirements</p>
                          <p className="text-sm">{booking.additional_requirements}</p>
                        </div>
                      )}
                    </div>
                  </details>
                  
                  <details>
                    <summary id={`notes-${booking.id}`} className="cursor-pointer list-none font-medium text-sm text-gray-700 flex items-center">
                      <span className="bg-amber-50 p-1 rounded mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </span>
                      Admin Notes
                    </summary>
                    <div className="pl-8 pt-2 text-sm">
                      <Textarea
                        value={adminNotes[booking.id] || ''}
                        onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full min-h-[80px] text-sm border-amber-200 focus:border-amber-300 focus:ring-amber-200"
                      />
                    </div>
                  </details>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCall(booking.phone)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                        title="Call"
                      >
                        <Phone size={14} />
                        <span className="text-xs font-medium">Call</span>
                      </button>
                      <button
                        onClick={() => handleWhatsapp(booking.phone, booking)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center gap-1"
                        title="WhatsApp"
                      >
                        <MessageSquare size={14} />
                        <span className="text-xs font-medium">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleEmail(booking.email)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-1"
                        title="Email"
                      >
                        <Mail size={14} />
                        <span className="text-xs font-medium">Email</span>
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal(booking)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                        title="Edit"
                      >
                        <PencilIcon size={14} className="text-blue-600" />
                        <span className="text-xs font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => deleteBookings([booking.id])}
                        className="p-2 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors duration-200 group"
                        title="Delete this booking"
                      >
                        <TrashIcon size={14} className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                        <span className="text-xs font-medium group-hover:text-red-600 transition-colors duration-200">Delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign to Agent</label>
                    <select
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
                      value={booking.assignedAgent || ''}
                      onChange={(e) => assignTicket(booking.id, e.target.value)}
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent: any) => (
                        <option key={agent.id} value={agent.email}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 text-gray-500">
            <p>No {statusFilter === 'all' ? '' : statusFilter} bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsTab;
