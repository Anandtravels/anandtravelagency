import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  IndianRupee,
  Users,
  Ticket
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
        {/* IRCTC Account Requirements */}
        <div className="bg-travel-blue-dark/5 p-3 rounded-lg border border-travel-blue-dark/10">
          <h3 className="font-medium text-travel-blue-dark flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            IRCTC Account Requirements
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-travel-teal mt-0.5 shrink-0" />
              <span>Agent must have <strong>{AGENT_RULES.irctcAccounts.required} IRCTC accounts</strong>.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-travel-teal mt-0.5 shrink-0" />
              <span>Only <strong>{AGENT_RULES.irctcAccounts.ticketsPerAccount} tickets</strong> per account per {AGENT_RULES.irctcAccounts.period}.</span>
            </li>
          </ul>
        </div>

        {/* Payment Criteria - With Previous Failures */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="font-medium text-gray-800 flex items-center gap-1.5 text-xs sm:text-sm">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-travel-orange" />
            Payment Criteria (With Previous Failures)
          </h3>
          
          {/* AC Ticket Failures */}
          <div className="bg-red-50/50 p-2.5 sm:p-3 rounded-lg border border-red-100">
            <h4 className="font-medium text-red-700 flex items-center gap-1 mb-2 text-[11px] sm:text-xs">
              <XCircle className="w-3 h-3" />
              Previous AC Ticket Failures:
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-[10px] sm:text-xs">
              <div className="bg-white p-1.5 sm:p-2 rounded border border-red-100 text-center">
                <span className="text-gray-500 block">Base</span>
                <span className="font-bold text-red-700">₹{AGENT_RULES.paymentCriteria.withPreviousACFailure.base}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-red-100 text-center">
                <span className="text-gray-500 block">+1 Person</span>
                <span className="font-bold text-red-700">+₹{AGENT_RULES.paymentCriteria.withPreviousACFailure.extraPerson}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-red-100 text-center">
                <span className="text-gray-500 block">+2nd</span>
                <span className="font-bold text-red-700">+₹{AGENT_RULES.paymentCriteria.withPreviousACFailure.secondExtra}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-red-100 text-center">
                <span className="text-gray-500 block">+3rd</span>
                <span className="font-bold text-red-700">+₹{AGENT_RULES.paymentCriteria.withPreviousACFailure.thirdExtra}</span>
              </div>
            </div>
          </div>

          {/* Sleeper Ticket Failures */}
          <div className="bg-orange-50/50 p-2.5 sm:p-3 rounded-lg border border-orange-100">
            <h4 className="font-medium text-orange-700 flex items-center gap-1 mb-2 text-[11px] sm:text-xs">
              <XCircle className="w-3 h-3" />
              Previous Sleeper Failures:
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-[10px] sm:text-xs">
              <div className="bg-white p-1.5 sm:p-2 rounded border border-orange-100 text-center">
                <span className="text-gray-500 block">Base</span>
                <span className="font-bold text-orange-700">₹{AGENT_RULES.paymentCriteria.withPreviousSleeperFailure.base}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-orange-100 text-center">
                <span className="text-gray-500 block">+1 Person</span>
                <span className="font-bold text-orange-700">+₹{AGENT_RULES.paymentCriteria.withPreviousSleeperFailure.extraPerson}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-orange-100 text-center">
                <span className="text-gray-500 block">+2nd</span>
                <span className="font-bold text-orange-700">+₹{AGENT_RULES.paymentCriteria.withPreviousSleeperFailure.secondExtra}</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded border border-orange-100 text-center">
                <span className="text-gray-500 block">+3rd</span>
                <span className="font-bold text-orange-700">+₹{AGENT_RULES.paymentCriteria.withPreviousSleeperFailure.thirdExtra}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Criteria - Successful Previous Tickets */}
        <div className="bg-travel-teal/5 p-2.5 sm:p-3 rounded-lg border border-travel-teal/20">
          <h3 className="font-medium text-travel-teal flex items-center gap-1.5 mb-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            If Both AC & Sleeper Were Successful:
          </h3>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* AC Ticket */}
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-travel-teal/20">
              <h4 className="font-medium text-travel-teal mb-1.5 flex items-center gap-1 text-[11px] sm:text-xs">
                <Users className="w-3 h-3" />
                AC Ticket
              </h4>
              <div className="space-y-1 text-[10px] sm:text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base</span>
                  <span className="font-bold text-travel-teal">₹{AGENT_RULES.paymentCriteria.successfulPreviousTickets.ac.base}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Each Extra</span>
                  <span className="font-bold text-travel-teal">+₹{AGENT_RULES.paymentCriteria.successfulPreviousTickets.ac.everyExtraPerson}</span>
                </div>
              </div>
            </div>

            {/* Sleeper Ticket */}
            <div className="bg-white p-2 sm:p-3 rounded-lg border border-travel-teal/20">
              <h4 className="font-medium text-travel-teal mb-1.5 flex items-center gap-1 text-[11px] sm:text-xs">
                <Users className="w-3 h-3" />
                Sleeper
              </h4>
              <div className="space-y-1 text-[10px] sm:text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base</span>
                  <span className="font-bold text-travel-teal">₹{AGENT_RULES.paymentCriteria.successfulPreviousTickets.sleeper.base}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Each Extra</span>
                  <span className="font-bold text-travel-teal">+₹{AGENT_RULES.paymentCriteria.successfulPreviousTickets.sleeper.everyExtraPerson}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimum Balance Requirement */}
        <div className="bg-travel-blue-medium/5 p-2.5 sm:p-3 rounded-lg border border-travel-blue-medium/20">
          <h3 className="font-medium text-travel-blue-medium flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Minimum Balance Requirement
          </h3>
          <p className="text-xs text-gray-700">
            Maintain <strong className="text-travel-blue-dark text-sm sm:text-base">₹{AGENT_RULES.minimumBalance.toLocaleString()}</strong> minimum in bank account.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-700 flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-travel-orange" />
            Disclaimer
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
