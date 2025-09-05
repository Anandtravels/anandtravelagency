import { 
  FileCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Globe, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface VisaApplicationDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedApplication: VisaApplication | null;
  agents: any[];
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const STATUS_CONFIG = {
  'pending': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Pending Review' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
  'visa-processing': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Visa Processing' },
  'visa-approved': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Visa Approved' },
  'visa-rejected': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Visa Rejected' }
};

const VisaApplicationDetailsModal = ({ 
  isOpen, 
  onOpenChange, 
  selectedApplication, 
  agents, 
  formatFirebaseTimestamp 
}: VisaApplicationDetailsModalProps) => {
  if (!selectedApplication) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Visa Application Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Applicant Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Name:</span>
                    <p className="break-words mt-1" title={selectedApplication.name}>
                      {selectedApplication.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Email:</span>
                    <p className="break-all mt-1" title={selectedApplication.email}>
                      {selectedApplication.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Contact:</span>
                    <p className="break-words mt-1" title={selectedApplication.contactNumber}>
                      {selectedApplication.contactNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Travel Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Visa Type:</span>
                    <p className="break-words mt-1" title={selectedApplication.visaType}>
                      {selectedApplication.visaType}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Destination:</span>
                    <p className="break-words mt-1" title={selectedApplication.countryName}>
                      {selectedApplication.countryName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">Travel Date:</span>
                    <p className="break-words mt-1">
                      {new Date(selectedApplication.travelDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Application Status</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Badge className={`${STATUS_CONFIG[selectedApplication.status]?.color} border px-3 py-1`}>
                {STATUS_CONFIG[selectedApplication.status]?.label}
              </Badge>
              <span className="text-sm text-gray-500 break-words">
                Submitted: {formatFirebaseTimestamp(selectedApplication.submittedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex-1">
              <AgentWhatsAppSelector
                application={selectedApplication}
                agents={agents}
                formatFirebaseTimestamp={formatFirebaseTimestamp}
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = `tel:${selectedApplication.contactNumber}`}
              className="flex-shrink-0"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Applicant
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${selectedApplication.email}`}
              className="flex-shrink-0"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisaApplicationDetailsModal;
