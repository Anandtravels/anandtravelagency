import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail,
  Phone,
  Shield,
  Key,
  Building,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useHotelManagement } from "@/hooks/useHotelManagement";
import { HotelService } from "@/services/hotelService";
import { useToast } from "@/hooks/use-toast";

interface HotelAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'staff' | 'viewer';
  hotelId: string;
  hotelName: string;
  permissions: {
    manageBookings: boolean;
    manageRooms: boolean;
    viewReports: boolean;
    manageRates: boolean;
    manageInventory: boolean;
  };
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

interface HotelAgentFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'manager' | 'staff' | 'viewer';
  hotelId: string;
  permissions: {
    manageBookings: boolean;
    manageRooms: boolean;
    viewReports: boolean;
    manageRates: boolean;
    manageInventory: boolean;
  };
  status: 'active' | 'inactive';
}

interface HotelAgentsTabProps {
  user: any;
}

const HotelAgentsTab = ({ user }: HotelAgentsTabProps) => {
  const { toast } = useToast();
  const { hotels } = useHotelManagement();
  
  // State
  const [agents, setAgents] = useState<HotelAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<HotelAgent | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<HotelAgentFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    hotelId: '',
    permissions: {
      manageBookings: true,
      manageRooms: false,
      viewReports: false,
      manageRates: false,
      manageInventory: false
    },
    status: 'active'
  });

  // Load agents
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      // In a real implementation, this would fetch from Firebase
      // For now, using mock data
      const mockAgents: HotelAgent[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@hoteldeluxe.com',
          phone: '+91 9876543210',
          role: 'manager',
          hotelId: 'hotel1',
          hotelName: 'Hotel Deluxe',
          permissions: {
            manageBookings: true,
            manageRooms: true,
            viewReports: true,
            manageRates: true,
            manageInventory: true
          },
          status: 'active',
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date('2024-01-20')
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya@grandplaza.com',
          phone: '+91 9876543211',
          role: 'staff',
          hotelId: 'hotel2',
          hotelName: 'Grand Plaza',
          permissions: {
            manageBookings: true,
            manageRooms: false,
            viewReports: false,
            manageRates: false,
            manageInventory: true
          },
          status: 'active',
          createdAt: new Date('2024-01-10'),
          lastLogin: new Date('2024-01-19')
        }
      ];
      setAgents(mockAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load hotel agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      hotelId: '',
      permissions: {
        manageBookings: true,
        manageRooms: false,
        viewReports: false,
        manageRates: false,
        manageInventory: false
      },
      status: 'active'
    });
    setEditingAgent(null);
    setShowPassword(false);
  };

  // Open modal for editing
  const openModal = (agent?: HotelAgent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        password: '', // Don't pre-fill password for security
        role: agent.role,
        hotelId: agent.hotelId,
        permissions: { ...agent.permissions },
        status: agent.status
      });
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (editingAgent) {
        // Update agent
        const updatedAgent: HotelAgent = {
          ...editingAgent,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          hotelId: formData.hotelId,
          hotelName: hotels.find(h => h.id === formData.hotelId)?.name || '',
          permissions: { ...formData.permissions },
          status: formData.status
        };
        
        setAgents(prev => prev.map(a => a.id === editingAgent.id ? updatedAgent : a));
        
        toast({
          title: "Agent Updated",
          description: "Hotel agent has been updated successfully",
        });
      } else {
        // Create new agent
        const newAgent: HotelAgent = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          hotelId: formData.hotelId,
          hotelName: hotels.find(h => h.id === formData.hotelId)?.name || '',
          permissions: { ...formData.permissions },
          status: formData.status,
          createdAt: new Date()
        };
        
        setAgents(prev => [...prev, newAgent]);
        
        toast({
          title: "Agent Created",
          description: "Hotel agent has been created successfully",
        });
      }
      
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save hotel agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle delete
  const handleDelete = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        
        toast({
          title: "Agent Deleted",
          description: "Hotel agent has been deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting agent:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete hotel agent. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Toggle permission
  const togglePermission = (permission: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  // Role-based permission presets
  const applyRolePreset = (role: 'manager' | 'staff' | 'viewer') => {
    const presets = {
      manager: {
        manageBookings: true,
        manageRooms: true,
        viewReports: true,
        manageRates: true,
        manageInventory: true
      },
      staff: {
        manageBookings: true,
        manageRooms: false,
        viewReports: false,
        manageRates: false,
        manageInventory: true
      },
      viewer: {
        manageBookings: false,
        manageRooms: false,
        viewReports: true,
        manageRates: false,
        manageInventory: false
      }
    };
    
    setFormData(prev => ({
      ...prev,
      role,
      permissions: presets[role]
    }));
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-500';
      case 'staff': return 'bg-blue-500';
      case 'viewer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Agents</h2>
          <p className="text-gray-600 mt-1">Manage hotel-level user accounts and permissions</p>
        </div>
        <Button onClick={() => openModal()} className="bg-travel-orange hover:bg-travel-orange/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-travel-blue-light rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-travel-blue-dark" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-600">{agent.hotelName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getRoleBadgeColor(agent.role)}>
                      {agent.role}
                    </Badge>
                    <Badge className={agent.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {agent.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{agent.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{agent.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{agent.hotelName}</span>
                </div>
                
                {agent.lastLogin && (
                  <div className="text-xs text-gray-500">
                    Last login: {agent.lastLogin.toLocaleDateString()}
                  </div>
                )}
                
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(agent.permissions).map(([key, value]) => {
                      if (value) {
                        const labels: Record<string, string> = {
                          manageBookings: 'Bookings',
                          manageRooms: 'Rooms',
                          viewReports: 'Reports',
                          manageRates: 'Rates',
                          manageInventory: 'Inventory'
                        };
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {labels[key]}
                          </Badge>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <div className="text-xs text-gray-500">
                    Created: {agent.createdAt.toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(agent)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first hotel agent.</p>
            <Button onClick={() => openModal()}>Add Agent</Button>
          </CardContent>
        </Card>
      )}

      {/* Agent Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? 'Edit Hotel Agent' : 'Add New Hotel Agent'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editingAgent ? '(Leave blank to keep current)' : '*'}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingAgent ? "Enter new password" : "Enter password"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Role & Hotel */}
            <div className="space-y-4">
              <h3 className="font-semibold">Role & Hotel Assignment</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hotel *</label>
                <Select
                  value={formData.hotelId}
                  onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => applyRolePreset(value as 'manager' | 'staff' | 'viewer')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Role Descriptions:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div><strong>Manager:</strong> Full access to all hotel operations</div>
                  <div><strong>Staff:</strong> Basic booking and inventory management</div>
                  <div><strong>Viewer:</strong> Read-only access to reports</div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageBookings"
                    checked={formData.permissions.manageBookings}
                    onCheckedChange={() => togglePermission('manageBookings')}
                  />
                  <label htmlFor="manageBookings" className="text-sm font-medium">
                    Manage Bookings
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageRooms"
                    checked={formData.permissions.manageRooms}
                    onCheckedChange={() => togglePermission('manageRooms')}
                  />
                  <label htmlFor="manageRooms" className="text-sm font-medium">
                    Manage Rooms
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="viewReports"
                    checked={formData.permissions.viewReports}
                    onCheckedChange={() => togglePermission('viewReports')}
                  />
                  <label htmlFor="viewReports" className="text-sm font-medium">
                    View Reports
                  </label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageRates"
                    checked={formData.permissions.manageRates}
                    onCheckedChange={() => togglePermission('manageRates')}
                  />
                  <label htmlFor="manageRates" className="text-sm font-medium">
                    Manage Rates
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageInventory"
                    checked={formData.permissions.manageInventory}
                    onCheckedChange={() => togglePermission('manageInventory')}
                  />
                  <label htmlFor="manageInventory" className="text-sm font-medium">
                    Manage Inventory
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAgent ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HotelAgentsTab;
