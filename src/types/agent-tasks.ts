// Agent Tasks & Reward System Types

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string; // Agent email
  assignedAgentName?: string; // Agent name for display
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
  createdBy: string; // Admin email
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface AgentWallet {
  id: string;
  agentEmail: string;
  agentName: string;
  balance: number; // ATA Wallet Balance (points)
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface TaskCompletionHistory {
  id: string;
  taskId: string;
  taskTitle: string;
  agentEmail: string;
  pointsEarned: number;
  completedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface AgentTaskFormData {
  title: string;
  description: string;
  points: number;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  notes?: string;
}

// Agent Rules for display
export const AGENT_RULES = {
  irctcAccounts: {
    required: 20,
    ticketsPerAccount: 8,
    period: 'month'
  },
  charges: {
    ac: {
      20: { perTicket: 80, multiplier: 4 },   // 20 accounts → ₹80 × 4
      15: { perTicket: 70, multiplier: 4 },   // 15 accounts → ₹70 × 4
      10: { perTicket: 60, multiplier: 4 },   // 10 accounts → ₹60 × 4
    },
    sleeper: {
      20: { perTicket: 70, multiplier: 4 },   // 20 accounts → ₹70 × 4
      15: { perTicket: 60, multiplier: 4 },   // 15 accounts → ₹60 × 4
      10: { perTicket: 50, multiplier: 4 },   // 10 or below → ₹50 × 4
    }
  },
  referralBonus: 100, // ₹100 per referred ticket
  minimumBalance: 2000,
  disclaimer: "To improve the success rate of Tatkal tickets and protect our brand reputation, these rules and regulations are implemented by Admin Anand."
};

/** Determine the charge tier based on total account count */
export const getChargeTier = (accountCount: number): 10 | 15 | 20 => {
  if (accountCount >= 20) return 20;
  if (accountCount >= 15) return 15;
  return 10;
};

/** Calculate charge for a booking based on account count and booking type (AC/SL) */
export const calculateBookingCharge = (
  accountCount: number,
  bookingType: 'ac' | 'sleeper'
): number => {
  const tier = getChargeTier(accountCount);
  const config = AGENT_RULES.charges[bookingType][tier];
  return config.perTicket * config.multiplier;
};

/** Get the next booking type in the AC → SL alternating pattern */
export const getNextBookingType = (currentIndex: number): 'ac' | 'sleeper' => {
  return currentIndex % 2 === 0 ? 'ac' : 'sleeper';
};
