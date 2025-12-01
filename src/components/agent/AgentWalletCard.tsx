import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Gift, Star, Sparkles } from 'lucide-react';
import { AgentWallet, TaskCompletionHistory } from '@/types/agent-tasks';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface AgentWalletCardProps {
  wallet: AgentWallet | null;
  recentHistory?: TaskCompletionHistory[];
}

const AgentWalletCard: React.FC<AgentWalletCardProps> = ({ wallet, recentHistory = [] }) => {
  const balance = wallet?.balance || 0;
  const totalEarned = wallet?.totalEarned || 0;

  return (
    <Card className="border-travel-orange/30 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-travel-orange to-orange-500 text-white py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Wallet className="w-4 h-4" />
          <span>ATA Wallet</span>
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

        {/* Empty state */}
        {recentHistory.length === 0 && (
          <div className="text-center py-3 text-gray-500">
            <Gift className="w-8 h-8 mx-auto text-gray-300 mb-1" />
            <p className="text-xs">Complete tasks to earn points!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentWalletCard;
