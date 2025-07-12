import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportBookingsToExcel, exportFilteredBookings } from '@/utils/excelExport';
import { Booking } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

interface ExcelExportButtonProps {
  bookings: Booking[];
  filteredBookings?: Booking[];
  agents?: any[];
  className?: string;
}

const ExcelExportButton = ({ bookings, filteredBookings, agents, className }: ExcelExportButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeAllBookings: true,
    dateRange: false,
    statusFilter: 'all',
    bookingTypeFilter: 'all',
    includeCommissionData: true,
    includeProfitData: true
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });

  const handleExport = () => {
    try {
      let bookingsToExport = exportOptions.includeAllBookings ? bookings : (filteredBookings || bookings);
      
      // Apply additional filters if specified
      if (exportOptions.statusFilter !== 'all') {
        if (exportOptions.statusFilter === 'pending') {
          bookingsToExport = bookingsToExport.filter(b => !b.status || b.status === 'pending');
        } else {
          bookingsToExport = bookingsToExport.filter(b => b.status === exportOptions.statusFilter);
        }
      }
      
      if (exportOptions.bookingTypeFilter !== 'all') {
        bookingsToExport = bookingsToExport.filter(b => b.booking_type === exportOptions.bookingTypeFilter);
      }
      
      // Apply date range filter
      if (exportOptions.dateRange && dateRange.from && dateRange.to) {
        bookingsToExport = bookingsToExport.filter(booking => {
          const journeyDate = new Date(booking.journey_date);
          return journeyDate >= dateRange.from! && journeyDate <= dateRange.to!;
        });
      }

      if (bookingsToExport.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No bookings match the selected criteria.",
          variant: "destructive"
        });
        return;
      }

      // Generate filename based on filters
      let filterName = '';
      const filters = [];
      
      if (exportOptions.statusFilter !== 'all') {
        filters.push(exportOptions.statusFilter);
      }
      
      if (exportOptions.bookingTypeFilter !== 'all') {
        filters.push(exportOptions.bookingTypeFilter);
      }
      
      if (filters.length > 0) {
        filterName = filters.join('_');
      }

      // Export with custom filename and date range
      const customDateRange = (exportOptions.dateRange && dateRange.from && dateRange.to) 
        ? { start: dateRange.from, end: dateRange.to }
        : undefined;

      exportFilteredBookings(bookingsToExport, filterName, customDateRange, agents);
      
      toast({
        title: "Export Successful",
        description: `Exported ${bookingsToExport.length} bookings to Excel file.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export bookings to Excel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const quickExport = () => {
    try {
      const bookingsToExport = filteredBookings || bookings;
      exportBookingsToExcel(bookingsToExport, undefined, agents);
      
      toast({
        title: "Export Successful",
        description: `Exported ${bookingsToExport.length} bookings to Excel file.`,
      });
    } catch (error) {
      console.error('Quick export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export bookings to Excel. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      {/* Quick Export Button */}
      <Button
        onClick={quickExport}
        variant="outline"
        size="sm"
        className={cn("flex items-center gap-2", className)}
      >
        <Download className="h-4 w-4" />
        Quick Export
      </Button>

      {/* Advanced Export Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className={cn("flex items-center gap-2", className)}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Advanced Export
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Export Bookings to Excel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Data Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Selection</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAllBookings"
                  checked={exportOptions.includeAllBookings}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeAllBookings: checked as boolean }))
                  }
                />
                <Label htmlFor="includeAllBookings" className="text-sm">
                  Export all bookings (ignore current filters)
                </Label>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status Filter</Label>
              <Select 
                value={exportOptions.statusFilter} 
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, statusFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_process">In Process</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Booking Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Booking Type Filter</Label>
              <Select 
                value={exportOptions.bookingTypeFilter} 
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, bookingTypeFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="cab">Cab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dateRange"
                  checked={exportOptions.dateRange}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, dateRange: checked as boolean }))
                  }
                />
                <Label htmlFor="dateRange" className="text-sm font-medium">
                  Filter by Journey Date Range
                </Label>
              </div>
              
              {exportOptions.dateRange && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Export Summary */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Export will include:</strong> Phone Number, Date of Tatkal, Date of Journey, 
                From & To, Class, Train No, Person Count, Status, Booked By, and Profit calculations.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelExportButton;
