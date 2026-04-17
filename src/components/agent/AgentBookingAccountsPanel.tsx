import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AGENT_RULES, getChargeTier } from '@/types/agent-tasks';
import type { BookingAccount, BookingRotationState, AgentEarnings } from '@/hooks/useAgentBookingAccounts';
import {
  BarChart3,
  ArrowRightLeft,
  IndianRupee,
  Users,
  Ticket,
  Target,
  TrendingUp,
  Gift,
  CheckCircle2
} from 'lucide-react';

interface AgentBookingAccountsPanelProps {
  accounts: BookingAccount[];
  rotationState: BookingRotationState;
  earnings: AgentEarnings;
  maxTicketsPerAccount: number;
}

const AgentBookingAccountsPanel: React.FC<AgentBookingAccountsPanelProps> = ({
  accounts,
  rotationState,
  earnings,
  maxTicketsPerAccount
}) => {
  const totalAccounts = accounts.length;
  const tier = getChargeTier(totalAccounts);
  const acCharge = AGENT_RULES.charges.ac[tier];
  const slCharge = AGENT_RULES.charges.sleeper[tier];
  const currentAccountIndex = rotationState.currentAccountIndex % Math.max(totalAccounts, 1);
  const nextBookingType = rotationState.totalBookingsThisMonth % 2 === 0 ? 'AC' : 'SL';

  return (
    <div className="space-y-4">
      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 text-travel-blue-dark mx-auto mb-1" />
            <p className="text-2xl font-bold text-travel-blue-dark">{totalAccounts}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Total Accounts</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 text-center">
            <Ticket className="w-5 h-5 text-travel-teal mx-auto mb-1" />
            <p className="text-2xl font-bold text-travel-teal">{rotationState.totalBookingsThisMonth}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Bookings This Month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 text-center">
            <IndianRupee className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">₹{earnings.totalEarnings.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Total Earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 text-center">
            <Gift className="w-5 h-5 text-travel-orange mx-auto mb-1" />
            <p className="text-2xl font-bold text-travel-orange">₹{earnings.referralBonuses.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Referral Bonuses</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Rotation Indicator */}
      <Card className="shadow-sm border-travel-teal/30">
        <CardHeader className="py-2.5 px-4 bg-gradient-to-r from-travel-teal/10 to-travel-blue-dark/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-travel-blue-dark">
            <ArrowRightLeft className="w-4 h-4" />
            Booking Rotation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {totalAccounts === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">Add booking accounts in the Credentials tab to start rotation.</p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Target className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-[10px] text-blue-500">Next Account</p>
                  <p className="text-sm font-bold text-blue-800">
                    #{currentAccountIndex + 1} — {accounts[currentAccountIndex]?.bookingId || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                nextBookingType === 'AC' 
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <Ticket className={`w-4 h-4 ${nextBookingType === 'AC' ? 'text-purple-600' : 'text-amber-600'}`} />
                <div>
                  <p className={`text-[10px] ${nextBookingType === 'AC' ? 'text-purple-500' : 'text-amber-500'}`}>Next Type</p>
                  <p className={`text-sm font-bold ${nextBookingType === 'AC' ? 'text-purple-800' : 'text-amber-800'}`}>
                    {nextBookingType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-[10px] text-green-500">Tier</p>
                  <p className="text-sm font-bold text-green-800">{tier} Accounts</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charges Table */}
      <Card className="shadow-sm">
        <CardHeader className="py-2.5 px-4 bg-gradient-to-r from-travel-orange/10 to-amber-50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-travel-orange">
            <IndianRupee className="w-4 h-4" />
            Your Charges (Tier: {tier} accounts)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border ${tier === getChargeTier(totalAccounts) ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="text-xs font-semibold text-purple-700 mb-1">AC Charge</h4>
              <p className="text-xl font-bold text-purple-800">₹{acCharge.perTicket} × {acCharge.multiplier}</p>
              <p className="text-xs text-purple-600 mt-0.5">= ₹{acCharge.perTicket * acCharge.multiplier} per booking</p>
            </div>
            <div className={`p-3 rounded-lg border ${tier === getChargeTier(totalAccounts) ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="text-xs font-semibold text-amber-700 mb-1">Sleeper Charge</h4>
              <p className="text-xl font-bold text-amber-800">₹{slCharge.perTicket} × {slCharge.multiplier}</p>
              <p className="text-xs text-amber-600 mt-0.5">= ₹{slCharge.perTicket * slCharge.multiplier} per booking</p>
            </div>
          </div>

          {/* Full charges reference */}
          <div className="mt-3 text-[10px] sm:text-xs text-gray-500">
            <p className="font-medium mb-1">All tiers:</p>
            <div className="grid grid-cols-3 gap-1">
              {([20, 15, 10] as const).map(t => (
                <div key={t} className={`p-1.5 rounded text-center ${t === tier ? 'bg-travel-teal/10 font-semibold' : ''}`}>
                  <p>{t} accs</p>
                  <p>AC: ₹{AGENT_RULES.charges.ac[t].perTicket}×{AGENT_RULES.charges.ac[t].multiplier}</p>
                  <p>SL: ₹{AGENT_RULES.charges.sleeper[t].perTicket}×{AGENT_RULES.charges.sleeper[t].multiplier}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Account Usage */}
      <Card className="shadow-sm">
        <CardHeader className="py-2.5 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-800">
            <BarChart3 className="w-4 h-4 text-travel-blue-dark" />
            Account Usage ({accounts.filter(a => a.bookingCount >= maxTicketsPerAccount).length}/{totalAccounts} full)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {totalAccounts === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">No accounts yet. Go to Credentials tab to add accounts.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account, idx) => {
                const isActive = idx === currentAccountIndex;
                const isFull = account.bookingCount >= maxTicketsPerAccount;
                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isActive
                        ? 'border-travel-teal bg-travel-teal/5 ring-1 ring-travel-teal/30'
                        : isFull
                        ? 'border-red-200 bg-red-50/50 opacity-75'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive ? 'bg-travel-teal text-white' : isFull ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {account.label || account.bookingId}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isFull ? 'bg-red-500' : account.bookingCount >= 6 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (account.bookingCount / maxTicketsPerAccount) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-medium shrink-0 ${isFull ? 'text-red-600' : 'text-gray-500'}`}>
                          {account.bookingCount}/{maxTicketsPerAccount}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-travel-teal shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentBookingAccountsPanel;
