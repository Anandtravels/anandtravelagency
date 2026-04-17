import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Wallet, TrendingUp, Gift, Star, Sparkles, Pencil, IndianRupee, CalendarDays, ArrowDownUp, Plus, History, Train, Trash2 } from 'lucide-react';
import { AgentWallet, TaskCompletionHistory } from '@/types/agent-tasks';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAgentDailyWallet, BookingType } from '@/hooks/useAgentDailyWallet';

interface AgentWalletCardProps {
  wallet: AgentWallet | null;
  recentHistory?: TaskCompletionHistory[];
  agentEmail?: string;
  showDailyWallet?: boolean;
}

const AgentWalletCard: React.FC<AgentWalletCardProps> = ({ wallet, recentHistory = [], agentEmail, showDailyWallet = false }) => {
  const { toast } = useToast();
  const balance = wallet?.balance || 0;
  const totalEarned = wallet?.totalEarned || 0;
  const [editOpen, setEditOpen] = useState(false);
  const [editBalance, setEditBalance] = useState(0);
  const [saving, setSaving] = useState(false);

  // Daily wallet
  const { entries, summary, todayEntries, loading: dailyLoading, saveDailyEntry, deleteDailyEntry, todayKey } = useAgentDailyWallet(agentEmail);
  const [dailyForm, setDailyForm] = useState({
    receivedAmount: '',
    ticketFare: '',
    charges: '',
    bookingType: 'AC' as BookingType,
    notes: ''
  });
  const [dailySubmitting, setDailySubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Preview: new balance after this entry
  const prevBalance = summary.currentBalance;
  const previewBalance = prevBalance + (parseFloat(dailyForm.receivedAmount) || 0) - (parseFloat(dailyForm.ticketFare) || 0) - (parseFloat(dailyForm.charges) || 0);

  const handleSaveDaily = async () => {
    const received = parseFloat(dailyForm.receivedAmount) || 0;
    const fare = parseFloat(dailyForm.ticketFare) || 0;
    const charges = parseFloat(dailyForm.charges) || 0;

    if (received === 0 && fare === 0 && charges === 0) {
      toast({ title: "Missing Data", description: "Please enter at least one amount", variant: "destructive" });
      return;
    }

    setDailySubmitting(true);
    try {
      await saveDailyEntry(received, fare, charges, dailyForm.bookingType, dailyForm.notes);
      toast({ title: "Saved!", description: `${dailyForm.bookingType} entry added successfully.` });
      setDailyForm({ receivedAmount: '', ticketFare: '', charges: '', bookingType: dailyForm.bookingType, notes: '' });
    } catch (error) {
      console.error('Error saving daily entry:', error);
      toast({ title: "Error", description: "Failed to save entry", variant: "destructive" });
    } finally {
      setDailySubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    setDeletingId(entryId);
    try {
      await deleteDailyEntry(entryId);
      toast({ title: "Deleted", description: "Entry removed and balances recalculated." });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenEdit = () => {
    setEditBalance(balance);
    setEditOpen(true);
  };

  const handleSavePoints = async () => {
    if (!wallet?.agentEmail) return;
    setSaving(true);
    try {
      const val = Math.max(0, editBalance);
      await updateDoc(doc(db, 'agent_wallets', wallet.agentEmail), {
        balance: val,
        lastUpdated: serverTimestamp()
      });
      toast({ title: "Updated", description: `ATA Points set to ${val}` });
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating points:", error);
      toast({ title: "Error", description: "Failed to update points", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <div className="space-y-4">
      {/* ATA Points Card (existing) */}
      <Card className="border-travel-orange/30 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-travel-orange to-orange-500 text-white py-3 px-4">
          <CardTitle className="flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              ATA Wallet
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenEdit}
              className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
              title="Edit ATA Points"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4">
          {/* Main Balance Display */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center justify-center gap-2 bg-travel-orange/10 border border-travel-orange/20 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-travel-orange" />
              <div>
                <motion.span 
                  key={balance}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-travel-orange"
                >
                  {balance.toLocaleString()}
                </motion.span>
                <span className="text-sm sm:text-base text-travel-orange/80 ml-1">pts</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            <div className="bg-travel-teal/10 border border-travel-teal/20 rounded-lg p-2 sm:p-3 text-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-travel-teal mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-gray-600">Total Earned</p>
              <p className="text-base sm:text-lg font-bold text-travel-teal">{totalEarned.toLocaleString()}</p>
            </div>
            
            <div className="bg-travel-blue-dark/10 border border-travel-blue-dark/20 rounded-lg p-2 sm:p-3 text-center">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-travel-blue-dark mx-auto mb-1" />
              <p className="text-[10px] sm:text-xs text-gray-600">Tasks Done</p>
              <p className="text-base sm:text-lg font-bold text-travel-blue-dark">{recentHistory.length}</p>
            </div>
          </div>

          {/* Recent Earnings */}
          {recentHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100">
              <h4 className="font-medium text-gray-800 flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 text-travel-orange" />
                Recent Earnings
              </h4>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {recentHistory.slice(0, 4).map((history) => (
                  <motion.div
                    key={history.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between bg-white p-1.5 sm:p-2 rounded border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {history.taskTitle}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {format(history.completedAt, 'dd MMM, HH:mm')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-travel-teal flex items-center gap-0.5 shrink-0 ml-2">
                      <Star className="w-3 h-3" />
                      +{history.pointsEarned}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {recentHistory.length === 0 && (
            <div className="text-center py-3 text-gray-500">
              <Gift className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="text-xs">Complete tasks to earn points!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Wallet Entry Card */}
      {showDailyWallet && (
        <Card className="border-green-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-base">
              <span className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Payment Entry
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-7 px-2 text-white/80 hover:text-white hover:bg-white/20 text-xs gap-1"
              >
                <History className="w-3.5 h-3.5" />
                {showHistory ? 'Add Entry' : 'History'}
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 sm:p-4">
            {/* Current Balance + Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <p className="text-[10px] sm:text-xs text-blue-500">Total Received</p>
                <p className="text-sm sm:text-base font-bold text-blue-700">₹{summary.totalReceived.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                <p className="text-[10px] sm:text-xs text-orange-500">Total Charges</p>
                <p className="text-sm sm:text-base font-bold text-orange-700">₹{summary.totalCharges.toLocaleString()}</p>
              </div>
              <div className={`border rounded-lg p-2 text-center ${summary.currentBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-[10px] sm:text-xs ${summary.currentBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>Balance</p>
                <p className={`text-sm sm:text-base font-bold ${summary.currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{summary.currentBalance.toLocaleString()}</p>
              </div>
            </div>

            {!showHistory ? (
              /* Entry Form */
              <div className="space-y-3">
                {/* Booking Type + Date */}
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{todayKey}</span>
                  {todayEntries.length > 0 && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {todayEntries.length} entr{todayEntries.length === 1 ? 'y' : 'ies'} today
                    </span>
                  )}
                </div>

                {/* AC / Sleeper selector */}
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Booking Type</Label>
                  <Select
                    value={dailyForm.bookingType}
                    onValueChange={(val) => setDailyForm(prev => ({ ...prev, bookingType: val as BookingType }))}
                    disabled={dailySubmitting}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">
                        <span className="flex items-center gap-1.5"><Train className="w-3.5 h-3.5 text-blue-600" /> AC</span>
                      </SelectItem>
                      <SelectItem value="Sleeper">
                        <span className="flex items-center gap-1.5"><Train className="w-3.5 h-3.5 text-amber-600" /> Sleeper</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Received (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={dailyForm.receivedAmount}
                      onChange={(e) => setDailyForm(prev => ({ ...prev, receivedAmount: e.target.value }))}
                      className="mt-1 text-sm"
                      disabled={dailySubmitting}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Ticket Fare (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={dailyForm.ticketFare}
                      onChange={(e) => setDailyForm(prev => ({ ...prev, ticketFare: e.target.value }))}
                      className="mt-1 text-sm"
                      disabled={dailySubmitting}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Charges (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={dailyForm.charges}
                      onChange={(e) => setDailyForm(prev => ({ ...prev, charges: e.target.value }))}
                      className="mt-1 text-sm"
                      disabled={dailySubmitting}
                    />
                  </div>
                </div>

                {/* Running balance preview */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  previewBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="text-sm text-gray-600">
                    <p className="flex items-center gap-1.5 font-medium">
                      <ArrowDownUp className="w-4 h-4" />
                      New Balance:
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      ₹{prevBalance.toLocaleString()} (prev) + ₹{(parseFloat(dailyForm.receivedAmount) || 0).toLocaleString()} − ₹{(parseFloat(dailyForm.ticketFare) || 0).toLocaleString()} − ₹{(parseFloat(dailyForm.charges) || 0).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${previewBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{previewBalance.toLocaleString()}
                  </span>
                </div>

                <Input
                  placeholder="Notes (optional)"
                  value={dailyForm.notes}
                  onChange={(e) => setDailyForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="text-sm"
                  disabled={dailySubmitting}
                />

                <Button
                  onClick={handleSaveDaily}
                  disabled={dailySubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                >
                  {dailySubmitting ? 'Saving...' : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Entry
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* All Entries History */
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No entries yet. Start adding payments!</p>
                ) : (
                  [...entries].reverse().map((entry) => (
                    <div key={entry.id} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-800">{entry.date}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            entry.bookingType === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {entry.bookingType || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${(entry.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Bal: ₹{(entry.balance ?? 0).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={deletingId === entry.id}
                            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete entry"
                          >
                            <Trash2 className={`w-3.5 h-3.5 ${deletingId === entry.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px] sm:text-xs text-gray-500">
                        <span>Recv: ₹{(entry.receivedAmount || 0).toLocaleString()}</span>
                        <span>Fare: ₹{(entry.ticketFare || 0).toLocaleString()}</span>
                        <span>Chg: ₹{(entry.charges || 0).toLocaleString()}</span>
                      </div>
                      {entry.notes && <p className="text-[10px] text-gray-400 mt-0.5 truncate">📝 {entry.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>

    {/* Edit Points Modal */}
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle className="text-base">Edit ATA Points</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 my-2">
          <div className="bg-orange-50 p-3 rounded-lg text-sm">
            <p><span className="font-medium">Current Balance:</span> {balance} pts</p>
            <p><span className="font-medium">Total Earned:</span> {totalEarned} pts</p>
          </div>
          <div>
            <Label htmlFor="editPoints" className="text-sm font-medium">
              New Points Balance
            </Label>
            <Input
              id="editPoints"
              type="number"
              min={0}
              value={editBalance}
              onChange={(e) => setEditBalance(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSavePoints} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AgentWalletCard;
