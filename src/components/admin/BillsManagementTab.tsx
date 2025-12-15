import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Receipt, 
  Eye, 
  Search, 
  FileText,
  Calendar,
  CalendarIcon,
  User,
  Phone,
  IndianRupee,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useBills } from '@/hooks/useBills';
import { formatCurrency, formatDate } from '@/utils/billUtils';
import { useToast } from '@/hooks/use-toast';

interface BillsManagementTabProps {
  user: { email: string } | null;
}

const BillsManagementTab = ({ user }: BillsManagementTabProps) => {
  const { bills, loading, deleting, deleteBill, deleteBulkBills } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [billToDelete, setBillToDelete] = useState<{ id: string; billNumber: string } | null>(null);
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  // Calendar and filter states
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  
  const { toast } = useToast();

  const filteredBills = bills.filter(bill => {
    // Search term filter - now includes PNR search
    const search = searchTerm.toLowerCase();
    const matchesSearch = (
      bill.billNumber.toLowerCase().includes(search) ||
      bill.customerName.toLowerCase().includes(search) ||
      bill.customerPhone.includes(search) ||
      bill.bookingType.toLowerCase().includes(search) ||
      (bill.agentPnr && bill.agentPnr.toLowerCase().includes(search))
    );
    
    // Calendar date filter
    let matchesDate = true;
    if (calendarDate) {
      try {
        const billDate = bill.createdAt.toDate ? bill.createdAt.toDate() : new Date(bill.createdAt);
        const selectedDate = new Date(calendarDate);
        
        // Compare dates (ignore time)
        billDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        matchesDate = billDate.getTime() === selectedDate.getTime();
      } catch (e) {
        matchesDate = false;
      }
    }
    
    // Month filter
    let matchesMonth = true;
    if (monthFilter !== 'all') {
      try {
        const billDate = bill.createdAt.toDate ? bill.createdAt.toDate() : new Date(bill.createdAt);
        const billMonth = billDate.getMonth(); // 0-11
        matchesMonth = billMonth === parseInt(monthFilter);
      } catch (e) {
        matchesMonth = false;
      }
    }
    
    // Booking type filter
    let matchesBookingType = true;
    if (bookingTypeFilter !== 'all') {
      matchesBookingType = bill.bookingType.toLowerCase() === bookingTypeFilter.toLowerCase();
    }
    
    return matchesSearch && matchesDate && matchesMonth && matchesBookingType;
  });

  const handleViewBill = (billId: string) => {
    // Open invoice in new window
    const invoiceUrl = `/invoice-print?id=${billId}`;
    window.open(invoiceUrl, '_blank', 'width=1200,height=900,scrollbars=yes,resizable=yes');
  };

  const handleDeleteClick = (billId: string, billNumber: string) => {
    setBillToDelete({ id: billId, billNumber });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!billToDelete) return;

    setDeletingBillId(billToDelete.id);
    try {
      await deleteBill(billToDelete.id);
      setShowDeleteDialog(false);
      setBillToDelete(null);
    } catch (error) {
      console.error('Error deleting bill:', error);
    } finally {
      setDeletingBillId(null);
    }
  };

  const handleSelectBill = (billId: string) => {
    const newSelected = new Set(selectedBills);
    if (newSelected.has(billId)) {
      newSelected.delete(billId);
    } else {
      newSelected.add(billId);
    }
    setSelectedBills(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBills.size === filteredBills.length) {
      setSelectedBills(new Set());
    } else {
      setSelectedBills(new Set(filteredBills.map(bill => bill.id)));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedBills.size === 0) {
      toast({
        title: 'No bills selected',
        description: 'Please select at least one bill to delete',
        variant: 'destructive'
      });
      return;
    }
    setShowBulkDeleteDialog(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await deleteBulkBills(Array.from(selectedBills));
      setShowBulkDeleteDialog(false);
      setSelectedBills(new Set());
    } catch (error) {
      console.error('Error deleting bills:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bills Management</h2>
            <p className="text-sm text-gray-500">All generated invoices and bills</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, PNR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Month Filter Dropdown */}
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="0">January</SelectItem>
              <SelectItem value="1">February</SelectItem>
              <SelectItem value="2">March</SelectItem>
              <SelectItem value="3">April</SelectItem>
              <SelectItem value="4">May</SelectItem>
              <SelectItem value="5">June</SelectItem>
              <SelectItem value="6">July</SelectItem>
              <SelectItem value="7">August</SelectItem>
              <SelectItem value="8">September</SelectItem>
              <SelectItem value="9">October</SelectItem>
              <SelectItem value="10">November</SelectItem>
              <SelectItem value="11">December</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Booking Type Dropdown */}
          <Select value={bookingTypeFilter} onValueChange={setBookingTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Booking Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general booking">General Booking</SelectItem>
              <SelectItem value="tatkal booking">Tatkal Booking</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Calendar Date Picker */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[200px] justify-start text-left font-normal ${
                  calendarDate ? 'bg-blue-50 text-blue-700 border-blue-200' : ''
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {calendarDate ? format(calendarDate, "MMM dd, yyyy") : "Pick a date"}
                {calendarDate && (
                  <X 
                    className="ml-auto h-4 w-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCalendarDate(undefined);
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={calendarDate}
                onSelect={(date) => {
                  setCalendarDate(date);
                  if (date) {
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {selectedBills.size > 0 && (
            <Button
              onClick={handleBulkDeleteClick}
              variant="destructive"
              size="sm"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedBills.size})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Turnover</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(bills.reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </p>
              </div>
              <IndianRupee className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        {/* Selected Month Bills Count */}
        <Card className={monthFilter !== 'all' ? 'border-purple-200 bg-purple-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {monthFilter !== 'all' 
                    ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(monthFilter)]} Bills`
                    : 'This Month Bills'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {monthFilter !== 'all' 
                    ? filteredBills.length
                    : bills.filter(bill => {
                        const billDate = bill.createdAt.toDate ? bill.createdAt.toDate() : new Date(bill.createdAt);
                        const now = new Date();
                        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
                      }).length}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        {/* Selected Month Turnover */}
        <Card className={monthFilter !== 'all' ? 'border-orange-200 bg-orange-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {monthFilter !== 'all' 
                    ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(monthFilter)]} Turnover`
                    : 'This Month Turnover'}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {monthFilter !== 'all'
                    ? formatCurrency(filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0))
                    : formatCurrency(bills.filter(bill => {
                        const billDate = bill.createdAt.toDate ? bill.createdAt.toDate() : new Date(bill.createdAt);
                        const now = new Date();
                        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
                      }).reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </p>
              </div>
              <IndianRupee className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {searchTerm ? 'No bills found matching your search' : 'No bills generated yet'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Bills will appear here when you send pricing messages to customers
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedBills.size === filteredBills.length && filteredBills.length > 0}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Select All ({filteredBills.length} bills)
                </label>
                {selectedBills.size > 0 && (
                  <Badge variant="secondary">
                    {selectedBills.size} selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bills Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={selectedBills.has(bill.id)}
                        onCheckedChange={() => handleSelectBill(bill.id)}
                        id={`bill-${bill.id}`}
                      />
                    </div>

                    {/* Bill Content */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Bill Info */}
                      <div className="lg:col-span-2 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{bill.billNumber}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(bill.createdAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">{bill.bookingType}</Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{bill.customerName}</span>
                          </p>
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{bill.customerPhone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Journey Info */}
                      <div className="space-y-2">
                        {bill.journeyFrom && bill.journeyTo && (
                          <>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Journey:</span>
                            </p>
                            <p className="text-sm">
                              {bill.journeyFrom} → {bill.journeyTo}
                            </p>
                            {bill.journeyDate && (
                              <p className="text-xs text-gray-500">{bill.journeyDate}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {bill.passengerCount} {bill.passengerCount === 1 ? 'Passenger' : 'Passengers'}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(bill.totalAmount)}
                          </p>
                          {bill.couponCode && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Coupon: {bill.couponCode}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleViewBill(bill.id)}
                            disabled={deletingBillId === bill.id}
                            size="sm"
                            variant="default"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Bill
                          </Button>
                          
                          <Button
                            onClick={() => handleDeleteClick(bill.id, bill.billNumber)}
                            disabled={deletingBillId === bill.id}
                            size="sm"
                            variant="destructive"
                          >
                            {deletingBillId === bill.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete bill <strong>{billToDelete?.billNumber}</strong>? 
              This action cannot be undone and will permanently remove this bill from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBillId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingBillId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingBillId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Bill'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Bills?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedBills.size} bill{selectedBills.size > 1 ? 's' : ''}</strong>? 
              This action cannot be undone and will permanently remove these bills from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedBills.size} Bill${selectedBills.size > 1 ? 's' : ''}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default BillsManagementTab;
