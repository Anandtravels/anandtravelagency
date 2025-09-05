import { useState } from 'react';
import { MessageCircle, Users, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

interface VisaApplication {
  id: string;
  visaType: string;
  name: string;
  contactNumber: string;
  email: string;
  travelDate: string;
  countryName: string;
  status: string;
  submittedAt: any;
}

interface AgentWhatsAppSelectorProps {
  application: VisaApplication;
  agents: Agent[];
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const STATUS_CONFIG = {
  'pending': { label: 'Pending Review' },
  'in-progress': { label: 'In Progress' },
  'visa-processing': { label: 'Visa Processing' },
  'visa-approved': { label: 'Visa Approved' },
  'visa-rejected': { label: 'Visa Rejected' }
};

const AgentWhatsAppSelector = ({ application, agents, formatFirebaseTimestamp }: AgentWhatsAppSelectorProps) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Filter agents with valid phone numbers
  const availableAgents = agents.filter(agent => 
    agent.phone && agent.phone.replace(/\D/g, '').length >= 10
  );

  const handleSendWhatsApp = () => {
    if (!selectedAgentId) {
      toast({
        title: "Select Agent",
        description: "Please select an agent to share the application with.",
        variant: "destructive"
      });
      return;
    }

    const selectedAgent = availableAgents.find(agent => agent.id === selectedAgentId);
    if (!selectedAgent) return;

    const message = `🎯 *New Visa Application Assignment*

👤 *Applicant Details:*
• Name: ${application.name}
• Email: ${application.email}
• Phone: ${application.contactNumber}

✈️ *Travel Information:*
• Visa Type: ${application.visaType}
• Destination: ${application.countryName}
• Travel Date: ${new Date(application.travelDate).toLocaleDateString()}

📋 *Application Status:* ${STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG]?.label || application.status}
📅 *Submitted:* ${formatFirebaseTimestamp(application.submittedAt)}

Please review and assist with this visa application.

*Anand Travel Agency*`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = selectedAgent.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: `Application details shared with ${selectedAgent.name}`,
    });

    setIsOpen(false);
    setSelectedAgentId('');
  };

  if (availableAgents.length === 0) {
    return (
      <Button
        size="sm"
        disabled
        className="flex-1 text-xs bg-gray-400 cursor-not-allowed"
        title="No agents with valid phone numbers available"
      >
        <MessageCircle className="h-3 w-3 mr-1" />
        No Agents
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share via WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Application Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Applicant:</span>
                <span className="font-medium">{application.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{application.countryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Visa Type:</span>
                <span className="font-medium">{application.visaType}</span>
              </div>
            </CardContent>
          </Card>

          {/* Agent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Agent:</label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent to share with..." />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{agent.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {agent.phone}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedAgentId('');
              }}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={!selectedAgentId}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentWhatsAppSelector;
