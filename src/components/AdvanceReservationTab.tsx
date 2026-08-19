import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search } from "lucide-react";

interface AdvanceReservationTabProps {
  bookings: any[];
}

const parseJourneyDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    let jDate: Date;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        jDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        jDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else {
      jDate = new Date(dateStr);
    }
    if (isNaN(jDate.getTime())) return null;
    return jDate;
  } catch {
    return null;
  }
};

const AdvanceReservationTab = ({ bookings = [] }: AdvanceReservationTabProps) => {
  const [showAdvanceThisMonth, setShowAdvanceThisMonth] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const advanceBookingsData = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const advance = safeBookings.filter(b => b.advance_booking === true);
    const markedDates: Date[] = [];
    const upcoming: any[] = [];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const oneWeekFromNow = new Date(now);
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    advance.forEach(b => {
      const jDate = parseJourneyDate(b.journey_date);
      if (jDate) {
        // Calculate booking date (60 days prior to journey date)
        const bookingDate = new Date(jDate);
        bookingDate.setDate(bookingDate.getDate() - 60);
        
        // Mark booking date on the calendar instead of journey date
        markedDates.push(new Date(bookingDate));
        
        // Filter logic for the upcoming list
        let include = false;
        
        if (calendarDate) {
          // If a calendar date is selected, show only bookings to be made on that exact date
          const selectedDate = new Date(calendarDate);
          selectedDate.setHours(0, 0, 0, 0);
          const currentBookingDate = new Date(bookingDate);
          currentBookingDate.setHours(0, 0, 0, 0);
          
          if (currentBookingDate.getTime() === selectedDate.getTime()) {
            include = true;
          }
        } else {
          // Default behavior: show upcoming dates >= today
          if (bookingDate >= now) {
            if (showAdvanceThisMonth) {
              if (bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear) {
                include = true;
              }
            } else {
              if (bookingDate <= oneWeekFromNow) {
                include = true;
              }
            }
          }
        }
        
        if (include) {
          upcoming.push({ ...b, parsedJourneyDate: jDate, parsedBookingDate: bookingDate });
        }
      }
    });

    // Apply search query filter
    let finalUpcoming = upcoming;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      finalUpcoming = upcoming.filter(b => 
        (b.name && String(b.name).toLowerCase().includes(query)) || 
        (b.phone && String(b.phone).replace(/\D/g, '').includes(query.replace(/\D/g, '')))
      );
    }

    finalUpcoming.sort((a, b) => a.parsedBookingDate.getTime() - b.parsedBookingDate.getTime());

    return { advance, markedDates, upcoming: finalUpcoming };
  }, [bookings, showAdvanceThisMonth, calendarDate, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Advance Reservation Calendar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-orange-500" />
                Reservation Calendar
             </h3>
             {calendarDate && (
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setCalendarDate(undefined)}
                 className="h-6 px-2 text-[10px] text-gray-500 hover:text-gray-800"
               >
                 Clear
               </Button>
             )}
           </div>
           <Calendar
             mode="single"
             selected={calendarDate}
             onSelect={(date) => {
               setCalendarDate(date);
             }}
             modifiers={{
               booking: advanceBookingsData.markedDates
             }}
             modifiersClassNames={{
               booking: "bg-orange-500 text-white font-bold hover:bg-orange-600 focus:bg-orange-600 rounded-md hover:text-white focus:text-white"
             }}
             className="mx-auto flex justify-center"
           />
           <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 justify-center">
             <div className="w-3 h-3 rounded-full bg-orange-500"></div>
             <span>Booking Date (T-60 days)</span>
           </div>
        </div>
      </div>

      {/* Right Column: Upcoming Bookings List */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-bold text-travel-blue-dark">Upcoming Advance Bookings</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-travel-blue-dark focus:border-travel-blue-dark"
              />
            </div>

            {!calendarDate && (
              <Button 
                variant="outline" 
                onClick={() => setShowAdvanceThisMonth(!showAdvanceThisMonth)}
                className="text-sm h-9 whitespace-nowrap"
              >
                {showAdvanceThisMonth ? 'View This Week' : 'View This Month'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {advanceBookingsData.upcoming.length > 0 ? (
            advanceBookingsData.upcoming.map((booking: any) => (
              <div key={booking.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{booking.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📱 {booking.phone}</span>
                    {booking.train_class && <span>🎫 Class: {booking.train_class}</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    🛤️ Journey: <span className="font-medium text-gray-800">{format(booking.parsedJourneyDate, "MMM dd, yyyy")}</span>
                  </div>
                </div>
                
                <div className="bg-orange-100 border border-orange-200 px-4 py-3 rounded-md text-center shrink-0">
                  <div className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">Make Booking On</div>
                  <div className="text-xl font-bold text-orange-700">
                    {format(booking.parsedBookingDate, "MMM dd, yyyy")}
                  </div>
                  {booking.parsedBookingDate < new Date() && (
                    <div className="text-xs text-red-600 font-bold mt-1 animate-pulse">OVERDUE / TODAY</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-medium">No upcoming bookings found.</p>
              {calendarDate ? (
                <p className="text-sm">There are no advance bookings required on {format(calendarDate, "MMMM do, yyyy")}.</p>
              ) : (
                <p className="text-sm">There are no advance bookings required for {showAdvanceThisMonth ? 'this month' : 'this week'}.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvanceReservationTab;
