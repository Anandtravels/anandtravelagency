import { useState, useEffect } from 'react';
import { 
  FileCheck
} from 'lucide-react';
import { collection, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import VisaApplicationCard from './VisaApplicationCard';
import VisaApplicationDetailsModal from './VisaApplicationDetailsModal';
import VisaApplicationFilters from './VisaApplicationFilters';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

interface VisaApplicationsTabProps {
  user: any;
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const VisaApplicationsTab = ({ user, formatFirebaseTimestamp }: VisaApplicationsTabProps) => {
  const [applications, setApplications] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const { toast } = useToast();

  // Set up real-time listeners for visa applications and agents
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Visa applications listener
    const q = query(collection(db, 'visa-services'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().status || 'pending'
        })) as VisaApplication[];
        
        setApplications(applicationsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching visa applications:', error);
        toast({
          title: "Error",
          description: "Failed to fetch visa applications",
          variant: "destructive"
        });
        setLoading(false);
      }
    );
    unsubscribes.push(unsubscribe);

    // Agents listener
    const agentsQuery = query(collection(db, 'agents'), orderBy('created_at', 'desc'));
    const agentsUnsubscribe = onSnapshot(agentsQuery, 
      (snapshot) => {
        const agentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAgents(agentsData);
      },
      (error) => {
        console.error('Error fetching agents:', error);
      }
    );
    unsubscribes.push(agentsUnsubscribe);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [toast]);

  // Manual refresh function
  const refreshApplications = () => {
    setLoading(true);
    // The real-time listener will update the data automatically
    toast({
      title: "Refreshing",
      description: "Fetching latest applications...",
    });
  };

  // Update application status
  const updateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'visa-services', applicationId), {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any }
            : app
        )
      );
      
      // Simple status labels
      const statusLabels: { [key: string]: string } = {
        'pending': 'Pending Review',
        'in-progress': 'In Progress',
        'visa-processing': 'Visa Processing',
        'visa-approved': 'Visa Approved',
        'visa-rejected': 'Visa Rejected'
      };
      
      const statusLabel = statusLabels[newStatus] || newStatus;
      
      toast({
        title: "Status Updated",
        description: `Application status changed to ${statusLabel}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  // Delete application
  const deleteApplication = async (applicationId: string, applicantName: string) => {
    try {
      await deleteDoc(doc(db, 'visa-services', applicationId));
      
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      toast({
        title: "Application Deleted",
        description: `Visa application for ${applicantName} has been removed`,
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Error",
        description: "Failed to delete visa application",
        variant: "destructive"
      });
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.visaType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // View application details
  const viewDetails = (application: VisaApplication) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading visa applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Visa Applications</h1>
              <p className="text-sm text-gray-500">
                {applications.length} total applications
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={refreshApplications} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileCheck className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <VisaApplicationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications match your current filters.' 
                : 'No visa applications have been submitted yet.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredApplications.map((application, index) => (
            <VisaApplicationCard
              key={application.id}
              application={application}
              index={index}
              agents={agents}
              formatFirebaseTimestamp={formatFirebaseTimestamp}
              updateStatus={updateStatus}
              viewDetails={viewDetails}
              deleteApplication={deleteApplication}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <VisaApplicationDetailsModal
        isOpen={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        selectedApplication={selectedApplication}
        agents={agents}
        formatFirebaseTimestamp={formatFirebaseTimestamp}
      />
    </div>
  );
};

export default VisaApplicationsTab;
