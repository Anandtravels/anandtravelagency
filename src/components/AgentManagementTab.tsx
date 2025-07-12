import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, PencilIcon } from "lucide-react";

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

  // Agent functions
  const createAgent = async (data: any) => {
    try {
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
          phone: data.phone,
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
          phone: data.phone,
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
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={agentFormData.phone}
                  onChange={(e) => setAgentFormData({...agentFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                />
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
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the functions that are needed by other components
export { AgentManagementTab };
export default AgentManagementTab;
