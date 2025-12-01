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
    required: 10,
    ticketsPerAccount: 6,
    period: 'month'
  },
  paymentCriteria: {
    withPreviousACFailure: {
      base: 80,
      extraPerson: 40,
      secondExtra: 30,
      thirdExtra: 30
    },
    withPreviousSleeperFailure: {
      base: 70,
      extraPerson: 40,
      secondExtra: 30,
      thirdExtra: 30
    },
    successfulPreviousTickets: {
      ac: {
        base: 80,
        everyExtraPerson: 80
      },
      sleeper: {
        base: 70,
        everyExtraPerson: 70
      }
    }
  },
  minimumBalance: 2000,
  disclaimer: "To improve the success rate of Tatkal tickets and protect our brand reputation, these rules and regulations are implemented by Admin Anand."
};
