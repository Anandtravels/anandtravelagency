import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, IndianRupee, Users, ChevronRight, Calendar, TrendingUp, ArrowLeft, Loader2 } from 'lucide-react';
import { useAllAgentWalletSummaries, useAgentDailyEntries, DailyWalletEntry } from '@/hooks/useAgentDailyWallet';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAgentWalletsTabProps {
  user: any;
}

const AdminAgentWalletsTab: React.FC<AdminAgentWalletsTabProps> = ({ user }) => {
  const { summaries, loading } = useAllAgentWalletSummaries();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading wallet data...</span>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Wallet className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">No Agent Wallets</h3>
          <p className="text-sm text-gray-400">Agent wallet data will appear here once agents start adding daily entries.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall totals
  const overallTotals = summaries.reduce((acc, s) => ({
    totalReceived: acc.totalReceived + (s.totalReceived || 0),
    totalCharges: acc.totalCharges + (s.totalCharges || 0),
    totalBalance: acc.totalBalance + (s.currentBalance || 0),
  }), { totalReceived: 0, totalCharges: 0, totalBalance: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Wallet className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agent Wallets</h2>
          <p className="text-sm text-gray-500">{summaries.length} agent{summaries.length !== 1 ? 's' : ''} with wallet data</p>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <IndianRupee className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Received (All Agents)</p>
              <p className="text-xl font-bold text-blue-800">₹{overallTotals.totalReceived.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-medium">Total Charges (All Agents)</p>
              <p className="text-xl font-bold text-orange-800">₹{overallTotals.totalCharges.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${overallTotals.totalBalance >= 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${overallTotals.totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Wallet className={`w-5 h-5 ${overallTotals.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className={`text-xs font-medium ${overallTotals.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>Total Balance (All Agents)</p>
              <p className={`text-xl font-bold ${overallTotals.totalBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>₹{overallTotals.totalBalance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((agent) => (
          <motion.div
            key={agent.agentEmail}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
              onClick={() => setSelectedAgent(agent.agentEmail)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{agent.agentEmail}</p>
                      <p className="text-[10px] text-gray-400">{agent.entryCount || 0} entries</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-blue-500">Received</p>
                    <p className="text-xs font-bold text-blue-700">₹{(agent.totalReceived || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-orange-500">Charges</p>
                    <p className="text-xs font-bold text-orange-700">₹{(agent.totalCharges || 0).toLocaleString()}</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${(agent.currentBalance || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-[10px] ${(agent.currentBalance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>Balance</p>
                    <p className={`text-xs font-bold ${(agent.currentBalance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{(agent.currentBalance || 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agent Detail Dialog */}
      {selectedAgent && (
        <AgentWalletDetailDialog
          agentEmail={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
};

/** Dialog showing full daily payment history for one agent */
const AgentWalletDetailDialog: React.FC<{
  agentEmail: string;
  onClose: () => void;
}> = ({ agentEmail, onClose }) => {
  const { entries, loading } = useAgentDailyEntries(agentEmail);

  const totalReceived = entries.reduce((s, e) => s + (e.receivedAmount || 0), 0);
  const totalTicketFare = entries.reduce((s, e) => s + (e.ticketFare || 0), 0);
  const totalCharges = entries.reduce((s, e) => s + (e.charges || 0), 0);
  const latestBalance = entries.length > 0 ? (entries[entries.length - 1].balance || 0) : 0;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-5 h-5 text-green-600" />
            Wallet History — {agentEmail}
          </DialogTitle>
        </DialogHeader>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
            <p className="text-[10px] text-blue-500">Total Received</p>
            <p className="text-sm font-bold text-blue-700">₹{totalReceived.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
            <p className="text-[10px] text-purple-500">Ticket Fare</p>
            <p className="text-sm font-bold text-purple-700">₹{totalTicketFare.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
            <p className="text-[10px] text-orange-500">Charges</p>
            <p className="text-sm font-bold text-orange-700">₹{totalCharges.toLocaleString()}</p>
          </div>
          <div className={`border rounded-lg p-2 text-center ${latestBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-[10px] ${latestBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>Balance</p>
            <p className={`text-sm font-bold ${latestBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹{latestBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No daily entries yet.</p>
            </div>
          ) : (
            [...entries].reverse().map((entry) => (
              <div key={entry.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {entry.date}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      entry.bookingType === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {entry.bookingType || 'N/A'}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${(entry.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Bal: ₹{(entry.balance ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex justify-between bg-white p-1.5 rounded border border-gray-100">
                    <span className="text-gray-500">Received</span>
                    <span className="font-medium text-blue-600">₹{(entry.receivedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-gray-100">
                    <span className="text-gray-500">Fare</span>
                    <span className="font-medium text-purple-600">₹{(entry.ticketFare || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-white p-1.5 rounded border border-gray-100">
                    <span className="text-gray-500">Charges</span>
                    <span className="font-medium text-orange-600">₹{(entry.charges || 0).toLocaleString()}</span>
                  </div>
                </div>
                {entry.notes && (
                  <p className="text-[10px] text-gray-400 mt-1.5 italic">📝 {entry.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAgentWalletsTab;
