import { motion } from 'framer-motion';
import { 
  FileCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Globe, 
  Eye, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AgentWhatsAppSelector from './AgentWhatsAppSelector';

interface VisaApplication {
  id: string;
  visaType: string;
  name: string;
  contactNumber: string;
  email: string;
  travelDate: string;
  countryName: string;
  status: 'pending' | 'in-progress' | 'visa-processing' | 'visa-approved' | 'visa-rejected';
  submittedAt: any;
  createdAt: string;
}

interface VisaApplicationCardProps {
  application: VisaApplication;
  index: number;
  agents: any[];
  formatFirebaseTimestamp: (timestamp: any) => string;
  updateStatus: (applicationId: string, newStatus: string) => void;
  viewDetails: (application: VisaApplication) => void;
}

const STATUS_CONFIG = {
  'pending': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Pending Review' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
  'visa-processing': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Visa Processing' },
  'visa-approved': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Visa Approved' },
  'visa-rejected': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Visa Rejected' }
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'visa-processing', label: 'Visa Processing' },
  { value: 'visa-approved', label: 'Visa Approved' },
  { value: 'visa-rejected', label: 'Visa Rejected' }
];

const VisaApplicationCard = ({ 
  application, 
  index, 
  agents, 
  formatFirebaseTimestamp, 
  updateStatus, 
  viewDetails 
}: VisaApplicationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <CardTitle 
                className="text-lg font-semibold truncate min-w-0" 
                title={application.name}
              >
                {application.name}
              </CardTitle>
            </div>
            <Badge className={`${STATUS_CONFIG[application.status]?.color} border flex-shrink-0 text-xs px-2 py-1`}>
              {STATUS_CONFIG[application.status]?.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Application Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="font-medium truncate" title={application.visaType}>
                {application.visaType}
              </span>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="truncate" title={application.countryName}>
                {application.countryName}
              </span>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">
                {new Date(application.travelDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="truncate" title={application.contactNumber}>
                {application.contactNumber}
              </span>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="truncate text-xs" title={application.email}>
                {application.email}
              </span>
            </div>
          </div>

          {/* Status Update */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Update Status:</label>
            <Select 
              value={application.status} 
              onValueChange={(value) => updateStatus(application.id, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => viewDetails(application)}
              className="flex-1 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            
            <div className="flex-1">
              <AgentWhatsAppSelector
                application={application}
                agents={agents}
                formatFirebaseTimestamp={formatFirebaseTimestamp}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 pt-2 border-t">
            <span className="block truncate" title={`Submitted: ${formatFirebaseTimestamp(application.submittedAt)}`}>
              Submitted: {formatFirebaseTimestamp(application.submittedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VisaApplicationCard;
