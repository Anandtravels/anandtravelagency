import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, PencilIcon, KeyIcon, Copy, Eye, EyeOff, CheckCircle2, X, Wallet, IndianRupee, Calendar, Loader2, BarChart3, Phone, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DailyWalletEntry, saveAdminWalletEntry } from "@/hooks/useAgentDailyWallet";
import AdminWalletEditDialog from "@/components/admin/AdminWalletEditDialog";

const MAX_BOOKINGS_PER_MONTH = 8;

/** Returns current month key like "2026-04" */
const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

interface AgentManagementTabProps {
  user: any;
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const AgentManagementTab = ({ user, formatFirebaseTimestamp }: AgentManagementTabProps) => {
  const { toast } = useToast();

  // Agent-specific state
  const [agents, setAgents] = useState<any[]>([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    address: '',
    email: '',
    password: ''
  });
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  // View Agent Booking IDs state
  const [viewCredentialsModal, setViewCredentialsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [agentCredentials, setAgentCredentials] = useState<any[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // View agent booking credentials
  const handleViewCredentials = async (agent: any) => {
    setSelectedAgent(agent);
    setViewCredentialsModal(true);
    setLoadingCredentials(true);
    setVisiblePasswords(new Set());

    try {
      const credentialsRef = collection(db, 'agent_booking_credentials');
      const q = query(
        credentialsRef,
        where('agentEmail', '==', agent.email.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const credentials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAgentCredentials(credentials);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      toast({
        title: "Error",
        description: "Failed to load booking credentials",
        variant: "destructive"
      });
    } finally {
      setLoadingCredentials(false);
    }
  };

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId);
      } else {
        newSet.add(credentialId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `Copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  // Agent functions
  const createAgent = async (data: any) => {
    try {
      // Validate phone number
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        toast({
          title: "Invalid Phone Number",
          description: "Please provide a valid 10-digit phone number for WhatsApp notifications",
          variant: "destructive"
        });
        return;
      }

      // Normalize phone number to ensure it starts with country code
      let normalizedPhone = cleanPhone;
      if (cleanPhone.length === 10) {
        normalizedPhone = '+91' + cleanPhone; // Add India country code
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        normalizedPhone = '+' + cleanPhone;
      }

      // First check if the email already exists
      const agentsQuery = query(
        collection(db, 'agents'),
        where('email', '==', data.email.toLowerCase())
      );
      const existingAgents = await getDocs(agentsQuery);
      if (!existingAgents.empty && !editingAgentId) {
        toast({
          title: "Error",
          description: "An agent with this email already exists",
          variant: "destructive"
        });
        return;
      }

      if (editingAgentId) {
        // If editing, update the existing agent
        await updateDoc(doc(db, 'agents', editingAgentId), {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: normalizedPhone,
          age: data.age.toString(),
          gender: data.gender,
          address: data.address,
          role: 'agent',
          updated_at: serverTimestamp(),
          updated_by: user.email
        });
        
        toast({
          title: "Agent Updated",
          description: "Agent information has been updated successfully."
        });
      } else {
        // If creating new agent, add the agent to Firestore
        const agentData = {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: normalizedPhone,
          age: data.age.toString(),
          gender: data.gender,
          address: data.address,
          role: 'agent',
          created_at: serverTimestamp(),
          created_by: user.email,
          updated_at: serverTimestamp(),
          // Add these fields to trigger the AuthAccountCreator
          needsAuthAccount: true,
          password: data.password
        };
        
        // Add to agents collection
        await addDoc(collection(db, 'agents'), agentData);
        
        toast({
          title: "Agent Created",
          description: "New agent has been added successfully. They can now login using their email and password."
        });
      }
      
      // Reset state
      setShowAgentForm(false);
      setEditingAgentId(null);
      setAgentFormData({
        name: '',
        age: '',
        gender: 'male',
        phone: '',
        address: '',
        email: '',
        password: ''
      });
    } catch (error: any) {
      console.error('Error creating/updating agent:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create/update agent",
        variant: "destructive"
      });
    }
  };

  const handleAddNewAgent = () => {
    setEditingAgentId(null);
    setAgentFormData({
      name: '',
      age: '',
      gender: 'male',
      phone: '',
      address: '',
      email: '',
      password: ''
    });
    setShowAgentForm(true);
  };

  const handleEditAgent = (agent: any) => {
    setEditingAgentId(agent.id);
    setAgentFormData({
      name: agent.name,
      age: agent.age,
      gender: agent.gender,
      phone: agent.phone,
      address: agent.address,
      email: agent.email,
      password: '' // Don't populate password for security
    });
    setShowAgentForm(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteDoc(doc(db, 'agents', agentId));
      toast({
        title: "Agent Deleted",
        description: "Agent has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive"
      });
    }
  };

  // Setup real-time listener for agents
  useEffect(() => {
    const agentsQuery = query(
      collection(db, 'agents'),
      orderBy('created_at', 'desc')
    );

    const agentsUnsubscribe = onSnapshot(agentsQuery, 
      (snapshot) => {
        const agentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAgents(agentsData);
      },
      (error) => {
        console.error("Error listening to agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents data",
          variant: "destructive"
        });
      }
    );

    // Cleanup function
    return () => {
      agentsUnsubscribe();
    };
  }, [toast]);

  // --- Monthly booking credentials aggregation for all agents ---
  const [allCredentialsByAgent, setAllCredentialsByAgent] = useState<Record<string, { total: number; count: number; credentials: any[] }>>({});

  // Real-time listener for all agent_booking_credentials (aggregated per agent)
  useEffect(() => {
    const currentMonth = getCurrentMonthKey();
    const unsubscribe = onSnapshot(
      collection(db, 'agent_booking_credentials'),
      (snapshot) => {
        const map: Record<string, { total: number; count: number; credentials: any[] }> = {};
        snapshot.docs.forEach(d => {
          const data = d.data();
          const email = (data.agentEmail || '').toLowerCase();
          if (!map[email]) map[email] = { total: 0, count: 0, credentials: [] };
          const bookingCount = data.lastResetMonth === currentMonth ? (data.bookingCount || 0) : 0;
          map[email].total += MAX_BOOKINGS_PER_MONTH;
          map[email].count += bookingCount;
          map[email].credentials.push({ id: d.id, ...data, bookingCount });
        });
        setAllCredentialsByAgent(map);
      }
    );
    return () => unsubscribe();
  }, []);

  // --- Wallet data for all agents ---
  const [walletSummaries, setWalletSummaries] = useState<Record<string, any>>({});
  const [todayEntriesMap, setTodayEntriesMap] = useState<Record<string, DailyWalletEntry[]>>({});
  const [walletViewAgent, setWalletViewAgent] = useState<string | null>(null);
  const [walletHistory, setWalletHistory] = useState<DailyWalletEntry[]>([]);
  const [walletHistoryLoading, setWalletHistoryLoading] = useState(false);
  
  // Admin wallet edit dialog state
  const [adminWalletEditOpen, setAdminWalletEditOpen] = useState(false);
  const [adminWalletEditAgent, setAdminWalletEditAgent] = useState<any>(null);

  const getTodayKey = () => {
    // Use IST consistently (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + (istOffset + now.getTimezoneOffset() * 60 * 1000));
    return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
  };

  // Single real-time listener on ALL agent_daily_wallet entries (source of truth)
  // Computes per-agent wallet summaries AND today's entries from one snapshot
  useEffect(() => {
    const today = getTodayKey();

    const unsubscribe = onSnapshot(
      collection(db, 'agent_daily_wallet'),
      (snapshot) => {
        // Accumulate per-agent totals and today's entries in one pass
        const perAgent: Record<string, { totalReceived: number; totalTicketFare: number; totalCharges: number; entryCount: number }> = {};
        const todayMap: Record<string, DailyWalletEntry[]> = {};

        snapshot.docs.forEach(d => {
          const data = d.data();
          const email = (data.agentEmail || '').toLowerCase();

          // Accumulate totals
          if (!perAgent[email]) {
            perAgent[email] = { totalReceived: 0, totalTicketFare: 0, totalCharges: 0, entryCount: 0 };
          }
          perAgent[email].totalReceived += (data.receivedAmount || 0);
          perAgent[email].totalTicketFare += (data.ticketFare || 0);
          perAgent[email].totalCharges += (data.charges || 0);
          perAgent[email].entryCount += 1;

          // Collect today's entries
          if (data.date === today) {
            const entry = { id: d.id, ...data } as DailyWalletEntry;
            if (!todayMap[email]) todayMap[email] = [];
            todayMap[email].push(entry);
          }
        });

        // Compute currentBalance from totals (always accurate)
        const walletMap: Record<string, any> = {};
        Object.entries(perAgent).forEach(([email, totals]) => {
          walletMap[email] = {
            agentEmail: email,
            totalReceived: totals.totalReceived,
            totalTicketFare: totals.totalTicketFare,
            totalCharges: totals.totalCharges,
            currentBalance: totals.totalReceived - totals.totalTicketFare - totals.totalCharges,
            entryCount: totals.entryCount,
          };
        });

        setWalletSummaries(walletMap);
        setTodayEntriesMap(todayMap);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load wallet history for a specific agent
  const openWalletHistory = (agentEmail: string) => {
    setWalletViewAgent(agentEmail);
    setWalletHistoryLoading(true);
    setWalletHistory([]);
  };

  // Open admin wallet edit dialog
  const handleAdminWalletEdit = (agent: any) => {
    setAdminWalletEditAgent(agent);
    setAdminWalletEditOpen(true);
  };

  // Handle admin wallet entry save
  const handleAdminWalletSave = async (entry: any) => {
    if (!adminWalletEditAgent?.email) return;
    await saveAdminWalletEntry(
      adminWalletEditAgent.email,
      entry.receivedAmount,
      entry.ticketFare,
      entry.charges,
      entry.bookingType,
      entry.notes
    );
  };

  // Real-time listener for selected agent's wallet history
  useEffect(() => {
    if (!walletViewAgent) return;

    const q = query(
      collection(db, 'agent_daily_wallet'),
      where('agentEmail', '==', walletViewAgent.toLowerCase()),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as DailyWalletEntry[];
      setWalletHistory(list);
      setWalletHistoryLoading(false);
    });

    return () => unsubscribe();
  }, [walletViewAgent]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-travel-blue-dark">Manage Agents</h2>
        <Button onClick={handleAddNewAgent} variant="default">
          Add New Agent
        </Button>
      </div>

      {/* Total Wallet Balance Summary */}
      {(() => {
        // Compute total ONLY from active agents displayed below (ensures total = sum of card balances)
        const totalBalance = agents.reduce((sum: number, agent: any) => {
          const email = agent.email?.toLowerCase();
          return sum + (walletSummaries[email]?.currentBalance || 0);
        }, 0);
        const positiveCount = agents.filter((agent: any) => {
          const email = agent.email?.toLowerCase();
          return (walletSummaries[email]?.currentBalance || 0) > 0;
        }).length;
        const negativeCount = agents.filter((agent: any) => {
          const email = agent.email?.toLowerCase();
          return (walletSummaries[email]?.currentBalance || 0) < 0;
        }).length;
        const totalPositive = agents.reduce((sum: number, agent: any) => {
          const email = agent.email?.toLowerCase();
          const bal = walletSummaries[email]?.currentBalance || 0;
          return bal > 0 ? sum + bal : sum;
        }, 0);
        const totalNegative = agents.reduce((sum: number, agent: any) => {
          const email = agent.email?.toLowerCase();
          const bal = walletSummaries[email]?.currentBalance || 0;
          return bal < 0 ? sum + bal : sum;
        }, 0);

        return (
          <div className={`mb-6 p-4 rounded-xl border-2 ${totalBalance >= 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Wallet className={`w-6 h-6 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Wallet Balance</p>
                  <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{totalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                {totalPositive > 0 && (
                  <div className="bg-white/70 border border-green-200 rounded-lg px-3 py-1.5 text-center">
                    <p className="text-[10px] text-green-600 font-medium">{positiveCount} agent{positiveCount !== 1 ? 's' : ''} positive</p>
                    <p className="text-sm font-bold text-green-700">+₹{totalPositive.toLocaleString()}</p>
                  </div>
                )}
                {totalNegative < 0 && (
                  <div className="bg-white/70 border border-red-200 rounded-lg px-3 py-1.5 text-center">
                    <p className="text-[10px] text-red-600 font-medium">{negativeCount} agent{negativeCount !== 1 ? 's' : ''} negative</p>
                    <p className="text-sm font-bold text-red-700">-₹{Math.abs(totalNegative).toLocaleString()}</p>
                  </div>
                )}
                <Button
                  onClick={() => {
                    const walletText = agents
                      .map((agent: any) => {
                        const email = agent.email?.toLowerCase();
                        const balance = walletSummaries[email]?.currentBalance || 0;
                        return `${agent.name}: ₹${balance.toLocaleString()}`;
                      })
                      .join('\n');
                    navigator.clipboard.writeText(walletText).then(() => {
                      toast({
                        title: "Copied!",
                        description: "All wallet balances copied to clipboard"
                      });
                    }).catch(() => {
                      toast({
                        title: "Error",
                        description: "Failed to copy to clipboard",
                        variant: "destructive"
                      });
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <Copy size={14} />
                  Copy All
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Warning for agents without phone numbers */}
      {(() => {
        const agentsWithoutPhone = agents.filter(agent => !agent.phone || agent.phone.replace(/\D/g, '').length < 10);
        if (agentsWithoutPhone.length > 0) {
          return (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Agents Missing Valid Phone Numbers</h3>
              <p className="text-sm text-yellow-700 mb-2">
                The following agents cannot receive WhatsApp notifications when bookings are assigned:
              </p>
              <div className="space-y-1">
                {agentsWithoutPhone.map(agent => (
                  <div key={agent.id} className="text-sm text-yellow-700 flex justify-between items-center">
                    <span>• {agent.name} ({agent.email})</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditAgent(agent)}
                      className="text-xs"
                    >
                      Update Phone
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Agent Form Modal */}
      {showAgentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingAgentId ? 'Edit Agent' : 'Add New Agent'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              createAgent(agentFormData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={agentFormData.name}
                  onChange={(e) => setAgentFormData({...agentFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={agentFormData.age}
                    onChange={(e) => setAgentFormData({...agentFormData, age: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    required
                    value={agentFormData.gender}
                    onChange={(e) => setAgentFormData({...agentFormData, gender: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <div className="flex">
                  <div className="bg-gray-100 flex items-center px-3 border border-r-0 border-gray-300 rounded-l">
                    <span className="text-gray-600 font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={agentFormData.phone}
                    onChange={(e) => {
                      // Only allow numbers and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAgentFormData({...agentFormData, phone: value});
                    }}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-r flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for WhatsApp notifications when bookings are assigned
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  required
                  value={agentFormData.address}
                  onChange={(e) => setAgentFormData({...agentFormData, address: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={agentFormData.email}
                  onChange={(e) => setAgentFormData({...agentFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              {!editingAgentId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required={!editingAgentId}
                    value={agentFormData.password}
                    onChange={(e) => setAgentFormData({...agentFormData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only required for new agents
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAgentForm(false);
                  setEditingAgentId(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAgentId ? 'Update Agent' : 'Add Agent'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agents List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents
          .sort((a: any, b: any) => {
            const emailA = a.email?.toLowerCase();
            const emailB = b.email?.toLowerCase();
            const balanceA = walletSummaries[emailA]?.currentBalance || 0;
            const balanceB = walletSummaries[emailB]?.currentBalance || 0;
            return balanceB - balanceA; // Sort high to low (descending)
          })
          .map((agent: any) => (
          <div key={agent.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-lg">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.email}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewCredentials(agent)} 
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors duration-200 group"
                  title="View Booking IDs"
                >
                  <KeyIcon size={16} className="text-purple-600" />
                </button>
                <button onClick={() => handleEditAgent(agent)} className="p-2 hover:bg-gray-100 rounded-full">
                  <PencilIcon size={16} className="text-blue-600" />
                </button>
                <button onClick={() => handleDeleteAgent(agent.id)} className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200 group" title="Delete this agent">
                  <TrashIcon size={16} className="text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Age:</span> {agent.age}</p>
              <p><span className="font-medium">Gender:</span> {agent.gender}</p>
              <div className="flex items-center justify-between">
                <p><span className="font-medium">Phone:</span> {agent.phone}</p>
                {agent.phone && (() => {
                  const digits = agent.phone.replace(/\D/g, '');
                  const phoneForCall = digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
                  const phoneForWA = digits.startsWith('91') ? digits : `91${digits}`;
                  return (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${phoneForCall}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title={`Call ${agent.name}`}
                      >
                        <Phone size={14} className="text-blue-600" />
                      </a>
                      <a
                        href={`https://wa.me/${phoneForWA}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                        title={`WhatsApp ${agent.name}`}
                      >
                        <MessageCircle size={14} className="text-green-600" />
                      </a>
                    </div>
                  );
                })()}
              </div>
              <p><span className="font-medium">Address:</span> {agent.address}</p>
            </div>

            {/* Wallet Balance & Today's Entries */}
            {(() => {
              const email = agent.email?.toLowerCase();
              const agentSummary = walletSummaries[email];
              const todayList = todayEntriesMap[email] || [];
              const currentBalance = agentSummary?.currentBalance ?? 0;
              const todayReceived = todayList.reduce((s: number, e: DailyWalletEntry) => s + (e.receivedAmount || 0), 0);
              const todayCharges = todayList.reduce((s: number, e: DailyWalletEntry) => s + (e.charges || 0), 0);

              return (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {/* Current Balance */}
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all hover:shadow-md ${currentBalance >= 0 ? 'bg-green-50 border border-green-200 hover:border-green-400' : 'bg-red-50 border border-red-200 hover:border-red-400'}`}
                    onDoubleClick={() => handleAdminWalletEdit(agent)}
                    title="Double-click to edit wallet (Admin)"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <Wallet size={14} className={currentBalance >= 0 ? 'text-green-600' : 'text-red-600'} />
                      Wallet Balance
                    </span>
                    <span className={`text-base font-bold ${currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      ₹{currentBalance.toLocaleString()}
                    </span>
                  </div>

                  {/* Today's Entries Summary */}
                  {todayList.length > 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <p className="text-[10px] font-medium text-blue-600 mb-1.5">Today ({todayList.length} entr{todayList.length === 1 ? 'y' : 'ies'})</p>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div className="text-center">
                          <p className="text-gray-500">Received</p>
                          <p className="font-semibold text-blue-700">₹{todayReceived.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Charges</p>
                          <p className="font-semibold text-orange-600">₹{todayCharges.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Types</p>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {todayList.map((e: DailyWalletEntry, i: number) => (
                              <span key={i} className={`text-[9px] px-1 py-0.5 rounded ${e.bookingType === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {e.bookingType || '?'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-gray-400">No entry today</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewCredentials(agent)}
                className="flex-1 gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-xs"
              >
                <KeyIcon size={13} />
                Booking IDs
              </Button>

              {/* Monthly Bookings Summary on Agent Card */}
              {(() => {
                const email = agent.email?.toLowerCase();
                const credData = allCredentialsByAgent[email];
                if (!credData || credData.credentials.length === 0) return null;
                const { count, total } = credData;
                const pct = total > 0 ? Math.min(100, (count / total) * 100) : 0;
                return (
                  <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50">
                    <BarChart3 size={13} className={count >= total ? 'text-red-500' : 'text-green-500'} />
                    <div className="flex-1 min-w-0">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            count >= total ? 'bg-red-500' : count >= total * 0.75 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold whitespace-nowrap ${count >= total ? 'text-red-600' : 'text-green-600'}`}>
                      {count}/{total}
                    </span>
                  </div>
                );
              })()}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openWalletHistory(agent.email?.toLowerCase())}
                className="flex-1 gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 text-xs"
              >
                <Wallet size={13} />
                View Wallet
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* View Wallet History Dialog */}
      <Dialog open={!!walletViewAgent} onOpenChange={(open) => { if (!open) setWalletViewAgent(null); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Wallet className="w-5 h-5 text-green-600" />
              Wallet History — {walletViewAgent}
            </DialogTitle>
          </DialogHeader>

          {/* Summary */}
          {(() => {
            const totalReceived = walletHistory.reduce((s, e) => s + (e.receivedAmount || 0), 0);
            const totalTicketFare = walletHistory.reduce((s, e) => s + (e.ticketFare || 0), 0);
            const totalCharges = walletHistory.reduce((s, e) => s + (e.charges || 0), 0);
            const latestBalance = totalReceived - totalTicketFare - totalCharges;

            return (
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
            );
          })()}

          {/* Entries list (newest first for display) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {walletHistoryLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : walletHistory.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No entries yet.</p>
              </div>
            ) : (
              [...walletHistory].reverse().map((entry) => (
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

      {/* View Agent Booking IDs Modal */}
      <Dialog open={viewCredentialsModal} onOpenChange={setViewCredentialsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-purple-600" />
              {selectedAgent?.name}'s Booking IDs
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {loadingCredentials ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent"></div>
              </div>
            ) : agentCredentials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <KeyIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No booking credentials saved by this agent yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Monthly Bookings Summary */}
                {(() => {
                  const currentMonth = getCurrentMonthKey();
                  const totalUsed = agentCredentials.reduce((sum, cred) => {
                    const count = cred.lastResetMonth === currentMonth ? (cred.bookingCount || 0) : 0;
                    return sum + count;
                  }, 0);
                  const totalLimit = agentCredentials.length * MAX_BOOKINGS_PER_MONTH;
                  const pct = totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0;
                  const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4" />
                          This Month's Bookings — {monthLabel}
                        </h4>
                        <span className={`text-lg font-bold ${totalUsed >= totalLimit ? 'text-red-600' : 'text-purple-700'}`}>
                          {totalUsed}/{totalLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            totalUsed >= totalLimit ? 'bg-red-500' : totalUsed >= totalLimit * 0.75 ? 'bg-amber-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-gray-500">{agentCredentials.length} account{agentCredentials.length !== 1 ? 's' : ''}</span>
                        {totalUsed >= totalLimit && (
                          <span className="text-[10px] text-red-500 font-medium">All limits reached</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {agentCredentials.map((credential) => (
                  <div 
                    key={credential.id} 
                    className="bg-gradient-to-br from-gray-50 to-white border rounded-lg p-4"
                  >
                    {credential.label && (
                      <p className="text-xs font-medium text-purple-600 mb-2 uppercase tracking-wide">
                        {credential.label}
                      </p>
                    )}
                    
                    {/* Booking ID */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 block mb-1">Booking ID</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-blue-50 px-3 py-2 rounded text-sm font-mono text-blue-800 truncate">
                          {credential.bookingId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(credential.bookingId, `ID-${credential.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-md shrink-0"
                          title="Copy Booking ID"
                        >
                          {copiedField === `ID-${credential.id}` ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Password</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-amber-50 px-3 py-2 rounded text-sm font-mono text-amber-800 truncate">
                          {visiblePasswords.has(credential.id) ? credential.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePasswordVisibility(credential.id)}
                          className="p-2 hover:bg-gray-100 rounded-md shrink-0"
                          title={visiblePasswords.has(credential.id) ? "Hide Password" : "Show Password"}
                        >
                          {visiblePasswords.has(credential.id) ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(credential.password, `PWD-${credential.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-md shrink-0"
                          title="Copy Password"
                        >
                          {copiedField === `PWD-${credential.id}` ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Monthly Booking Count */}
                    {(() => {
                      const currentMonth = getCurrentMonthKey();
                      const bookingCount = credential.lastResetMonth === currentMonth ? (credential.bookingCount || 0) : 0;
                      const pct = Math.min(100, (bookingCount / MAX_BOOKINGS_PER_MONTH) * 100);
                      return (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              Monthly Bookings
                            </label>
                            <span className={`text-xs font-bold ${bookingCount >= MAX_BOOKINGS_PER_MONTH ? 'text-red-600' : 'text-green-600'}`}>
                              {bookingCount}/{MAX_BOOKINGS_PER_MONTH}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                bookingCount >= MAX_BOOKINGS_PER_MONTH
                                  ? 'bg-red-500'
                                  : bookingCount >= 6
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {bookingCount >= MAX_BOOKINGS_PER_MONTH && (
                            <p className="text-[10px] text-red-500 mt-0.5">Limit reached — resets next month</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Wallet Edit Dialog */}
      {adminWalletEditAgent && (
        <AdminWalletEditDialog
          open={adminWalletEditOpen}
          agentEmail={adminWalletEditAgent.email}
          agentName={adminWalletEditAgent.name}
          currentBalance={walletSummaries[adminWalletEditAgent.email?.toLowerCase()]?.currentBalance ?? 0}
          onClose={() => {
            setAdminWalletEditOpen(false);
            setAdminWalletEditAgent(null);
          }}
          onSave={handleAdminWalletSave}
        />
      )}
    </div>
  );
};

// Export the functions that are needed by other components
export { AgentManagementTab };
export default AgentManagementTab;
