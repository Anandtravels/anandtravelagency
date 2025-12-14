import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, PencilIcon, KeyIcon, Copy, Eye, EyeOff, CheckCircle2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-travel-blue-dark">Manage Agents</h2>
        <Button onClick={handleAddNewAgent} variant="default">
          Add New Agent
        </Button>
      </div>

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
        {agents.map((agent: any) => (
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
              <p><span className="font-medium">Phone:</span> {agent.phone}</p>
              <p><span className="font-medium">Address:</span> {agent.address}</p>
            </div>
            {/* View Booking IDs Button */}
            <div className="mt-4 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleViewCredentials(agent)}
                className="w-full gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              >
                <KeyIcon size={14} />
                View Booking IDs
              </Button>
            </div>
          </div>
        ))}
      </div>

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
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Export the functions that are needed by other components
export { AgentManagementTab };
export default AgentManagementTab;
