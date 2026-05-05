import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, IndianRupee, ArrowDownUp, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminWalletEditDialogProps {
  open: boolean;
  agentEmail: string;
  agentName: string;
  currentBalance: number;
  onClose: () => void;
  onSave: (entry: AdminWalletEntry) => Promise<void>;
}

export interface AdminWalletEntry {
  receivedAmount: number;
  ticketFare: number;
  charges: number;
  bookingType: 'AC' | 'Sleeper';
  notes: string;
}

const AdminWalletEditDialog: React.FC<AdminWalletEditDialogProps> = ({
  open,
  agentEmail,
  agentName,
  currentBalance,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AdminWalletEntry>({
    receivedAmount: 0,
    ticketFare: 0,
    charges: 0,
    bookingType: 'AC',
    notes: ''
  });

  // Calculate preview balance
  const previewBalance = currentBalance + form.receivedAmount - form.ticketFare - form.charges;

  const handleReset = () => {
    setForm({
      receivedAmount: 0,
      ticketFare: 0,
      charges: 0,
      bookingType: 'AC',
      notes: ''
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSave = async () => {
    if (form.receivedAmount === 0 && form.ticketFare === 0 && form.charges === 0) {
      toast({
        title: 'Missing Data',
        description: 'Please enter at least one amount',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      toast({
        title: 'Success!',
        description: `Wallet entry added for ${agentName}`
      });
      handleReset();
      onClose();
    } catch (error) {
      console.error('Error saving wallet entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save wallet entry',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-600" />
            Admin Wallet Entry — {agentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Current Balance Info */}
          <div className={`p-3 rounded-lg border ${currentBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm">
              <span className={`font-medium ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Current Balance:
              </span>
              <span className={`ml-2 text-lg font-bold ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₹{currentBalance.toLocaleString()}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-1">Agent Email: {agentEmail}</p>
          </div>

          {/* Booking Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Booking Type</Label>
            <Select
              value={form.bookingType}
              onValueChange={(val) => setForm(prev => ({ ...prev, bookingType: val as 'AC' | 'Sleeper' }))}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="Sleeper">Sleeper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="received" className="text-xs font-medium text-gray-600">
                Received (₹)
              </Label>
              <Input
                id="received"
                type="number"
                min={0}
                placeholder="0"
                value={form.receivedAmount}
                onChange={(e) => setForm(prev => ({ ...prev, receivedAmount: parseFloat(e.target.value) || 0 }))}
                className="mt-1.5 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="fare" className="text-xs font-medium text-gray-600">
                Ticket Fare (₹)
              </Label>
              <Input
                id="fare"
                type="number"
                min={0}
                placeholder="0"
                value={form.ticketFare}
                onChange={(e) => setForm(prev => ({ ...prev, ticketFare: parseFloat(e.target.value) || 0 }))}
                className="mt-1.5 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="charges" className="text-xs font-medium text-gray-600">
                Charges (₹)
              </Label>
              <Input
                id="charges"
                type="number"
                min={0}
                placeholder="0"
                value={form.charges}
                onChange={(e) => setForm(prev => ({ ...prev, charges: parseFloat(e.target.value) || 0 }))}
                className="mt-1.5 text-sm"
                disabled={saving}
              />
            </div>
          </div>

          {/* Preview Balance */}
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            previewBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm text-gray-600">
              <p className="flex items-center gap-1.5 font-medium">
                <ArrowDownUp className="w-4 h-4" />
                New Balance:
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                ₹{currentBalance.toLocaleString()} (current) + ₹{form.receivedAmount.toLocaleString()} − ₹{form.ticketFare.toLocaleString()} − ₹{form.charges.toLocaleString()}
              </p>
            </div>
            <span className={`text-lg font-bold ${previewBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ₹{previewBalance.toLocaleString()}
            </span>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs font-medium text-gray-600 mb-1.5 block">
              Notes (Admin Reference)
            </Label>
            <Input
              id="notes"
              placeholder="E.g., 'Refund for cancelled booking' or 'Manual adjustment'"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="text-sm"
              disabled={saving}
            />
          </div>

          {/* Info Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
            <p className="font-medium mb-1">📋 Admin Entry Info:</p>
            <ul className="space-y-0.5 text-[11px] ml-3">
              <li>• Entry marked as "admin" in wallet history</li>
              <li>• Balance updated immediately in agent dashboard</li>
              <li>• Agent can see this entry in their wallet history</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Entry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminWalletEditDialog;
