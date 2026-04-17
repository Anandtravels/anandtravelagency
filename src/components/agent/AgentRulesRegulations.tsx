import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee,
  Users,
  Ticket,
  ArrowRightLeft,
  Gift,
  RotateCcw
} from 'lucide-react';
import { AGENT_RULES } from '@/types/agent-tasks';

const AgentRulesRegulations: React.FC = () => {
  return (
    <Card className="border-travel-blue-dark/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          ATA Agent Rules & Regulations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* 1. IRCTC Account Requirements */}
        <div className="bg-travel-blue-dark/5 p-3 rounded-lg border border-travel-blue-dark/10">
          <h3 className="font-medium text-travel-blue-dark flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            1. Account Requirements
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-travel-teal mt-0.5 shrink-0" />
              <span>Each agent must have <strong>{AGENT_RULES.irctcAccounts.required} booking accounts (IDs)</strong>.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-travel-teal mt-0.5 shrink-0" />
              <span>Each account can handle maximum <strong>{AGENT_RULES.irctcAccounts.ticketsPerAccount} tickets</strong> per {AGENT_RULES.irctcAccounts.period}.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-travel-teal mt-0.5 shrink-0" />
              <span>Ticket count <strong>resets every month automatically</strong>.</span>
            </li>
          </ul>
        </div>

        {/* 2. Booking Rotation Logic */}
        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-700 flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            2. Booking Rotation Logic
          </h3>
          <div className="space-y-2 text-xs text-gray-700">
            <p>Follow <strong>sequential booking</strong> using accounts:</p>
            <div className="bg-white p-2 rounded border border-purple-100 font-mono text-[10px] sm:text-xs">
              <p>1st booking → Account 1 (AC)</p>
              <p>2nd booking → Account 2 (SL)</p>
              <p>3rd booking → Account 3 (AC)</p>
              <p>...</p>
              <p>After Account 20 → Restart from Account 1</p>
            </div>
            <p className="flex items-center gap-1">
              <span className="font-medium">Pattern:</span>
              <span className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-700 font-bold">AC</span>
              <span>→</span>
              <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-700 font-bold">SL</span>
              <span>→</span>
              <span className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-700 font-bold">AC</span>
              <span>→</span>
              <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-700 font-bold">SL</span>
            </p>
          </div>
        </div>

        {/* 3. Charges Calculation */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800 flex items-center gap-1.5 text-xs sm:text-sm">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-travel-orange" />
            3. Charges Calculation
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {/* AC Charges */}
            <div className="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-700 mb-2 text-[11px] sm:text-xs">AC Charges:</h4>
              <div className="space-y-1 text-[10px] sm:text-xs">
                {([20, 15, 10] as const).map(t => (
                  <div key={t} className="flex justify-between bg-white px-2 py-1 rounded">
                    <span className="text-gray-600">{t} accs</span>
                    <span className="font-bold text-purple-700">₹{AGENT_RULES.charges.ac[t].perTicket} × {AGENT_RULES.charges.ac[t].multiplier}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sleeper Charges */}
            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
              <h4 className="font-medium text-amber-700 mb-2 text-[11px] sm:text-xs">Sleeper Charges:</h4>
              <div className="space-y-1 text-[10px] sm:text-xs">
                {([20, 15, 10] as const).map(t => (
                  <div key={t} className="flex justify-between bg-white px-2 py-1 rounded">
                    <span className="text-gray-600">{t >= 15 ? `${t}` : '≤10'} accs</span>
                    <span className="font-bold text-amber-700">₹{AGENT_RULES.charges.sleeper[t].perTicket} × {AGENT_RULES.charges.sleeper[t].multiplier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Referral Bonus */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h3 className="font-medium text-green-700 flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            4. Referral Bonus
          </h3>
          <p className="text-xs text-gray-700">
            If agent refers a client and a ticket is booked → <strong className="text-green-700 text-sm">₹{AGENT_RULES.referralBonus} bonus</strong> added to earnings automatically.
          </p>
        </div>

        {/* 5. Booking Completion */}
        <div className="bg-travel-teal/5 p-3 rounded-lg border border-travel-teal/20">
          <h3 className="font-medium text-travel-teal flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            5. On Booking Completion
          </h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li className="flex items-start gap-1.5">
              <span className="text-travel-teal">•</span>
              <span>Ticket count for that account increases by 1</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-travel-teal">•</span>
              <span>Charges calculated based on total account count & booking type</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-travel-teal">•</span>
              <span>Earnings & ATA points credited automatically</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-travel-teal">•</span>
              <span>Rotation moves to next account</span>
            </li>
          </ul>
        </div>

        {/* 6. Minimum Balance */}
        <div className="bg-travel-blue-medium/5 p-2.5 sm:p-3 rounded-lg border border-travel-blue-medium/20">
          <h3 className="font-medium text-travel-blue-medium flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            6. Minimum Balance Requirement
          </h3>
          <p className="text-xs text-gray-700">
            Maintain <strong className="text-travel-blue-dark text-sm sm:text-base">₹{AGENT_RULES.minimumBalance.toLocaleString()}</strong> minimum in bank account.
          </p>
        </div>

        {/* 7. Disclaimer */}
        <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-travel-orange" />
            7. Disclaimer
          </h3>
          <p className="text-[10px] sm:text-xs text-gray-600 italic leading-relaxed">
            "{AGENT_RULES.disclaimer}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentRulesRegulations;
