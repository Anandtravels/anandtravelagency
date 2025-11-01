import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Download, 
  Search, 
  FileText,
  Calendar,
  User,
  Phone,
  IndianRupee,
  Trash2
} from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { generateBillPDF } from '@/utils/pdfGenerator';
import { formatCurrency, formatDate } from '@/utils/billUtils';
import { useToast } from '@/hooks/use-toast';

interface BillsManagementTabProps {
  user: { email: string } | null;
}

const BillsManagementTab = ({ user }: BillsManagementTabProps) => {
  const { bills, loading, deleting, deleteBill, deleteBulkBills } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingBill, setDownloadingBill] = useState<string | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [billToDelete, setBillToDelete] = useState<{ id: string; billNumber: string } | null>(null);
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { toast } = useToast();

  const filteredBills = bills.filter(bill => {
    const search = searchTerm.toLowerCase();
    return (
      bill.billNumber.toLowerCase().includes(search) ||
      bill.customerName.toLowerCase().includes(search) ||
      bill.customerPhone.includes(search) ||
      bill.bookingType.toLowerCase().includes(search)
    );
  });

  const handleDownloadPDF = async (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    setDownloadingBill(billId);
    try {
      await generateBillPDF(bill);
      toast({
        title: 'Success',
        description: 'Bill downloaded successfully'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      });
    } finally {
      setDownloadingBill(null);
    }
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
        
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(bills.reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </p>
              </div>
              <IndianRupee className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {bills.filter(bill => {
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
                            onClick={() => handleDownloadPDF(bill.id)}
                            disabled={downloadingBill === bill.id || deletingBillId === bill.id}
                            size="sm"
                            variant="default"
                          >
                            {downloadingBill === bill.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => handleDeleteClick(bill.id, bill.billNumber)}
                            disabled={downloadingBill === bill.id || deletingBillId === bill.id}
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
