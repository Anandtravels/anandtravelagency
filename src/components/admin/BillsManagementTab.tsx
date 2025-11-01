import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Receipt, 
  Download, 
  Search, 
  FileText,
  Calendar,
  User,
  Phone,
  IndianRupee
} from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { generateBillPDF } from '@/utils/pdfGenerator';
import { formatCurrency, formatDate } from '@/utils/billUtils';
import { useToast } from '@/hooks/use-toast';

interface BillsManagementTabProps {
  user: { email: string } | null;
}

const BillsManagementTab = ({ user }: BillsManagementTabProps) => {
  const { bills, loading } = useBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingBill, setDownloadingBill] = useState<string | null>(null);
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
        <div className="grid grid-cols-1 gap-4">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
                    
                    <Button
                      onClick={() => handleDownloadPDF(bill.id)}
                      disabled={downloadingBill === bill.id}
                      size="sm"
                      className="mt-2"
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillsManagementTab;
