import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { collection, query, doc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrashIcon, PencilIcon, Check, X, Phone, Mail, FileText, Download, Eye, Filter, DollarSign, Save, Globe, EyeOff, Settings2 } from "lucide-react";
import { debounce } from 'lodash';
import { E_SERVICE_TYPES, EServiceRequest } from "@/types/eservices";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import EServiceExcelExportButton from "@/components/admin/EServiceExcelExportButton";
import EServiceFeeManagement from "@/components/admin/EServiceFeeManagement";
import { useForm } from "react-hook-form";
import { usePageVisibility } from "@/hooks/usePageVisibility";

interface EServicesManagementTabProps {
  user: any;
  formatFirebaseTimestamp: (timestamp: any) => string;
}

const EServicesManagementTab = ({ user, formatFirebaseTimestamp }: EServicesManagementTabProps) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<EServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<EServiceRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<EServiceRequest | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Page visibility settings
  const { visibility, loading: visibilityLoading, updatePageVisibility, isPageVisible } = usePageVisibility();

  // Fetch requests from Firebase
  useEffect(() => {
    const requestsQuery = query(collection(db, 'eservice_requests'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requestsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          setAdminNotes((prev) => ({ ...prev, [doc.id]: data.adminNotes || '' }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date(),
          } as EServiceRequest;
        });
        setRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to E-service requests:", error);
        toast({
          title: "Error",
          description: "Failed to load E-service requests",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesServiceType = serviceTypeFilter === "all" || request.serviceType === serviceTypeFilter;
      
      return matchesSearch && matchesStatus && matchesServiceType;
    });
  }, [requests, searchTerm, statusFilter, serviceTypeFilter]);

  // Update request status
  const updateRequestStatus = async (requestId: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'eservice_requests', requestId), { 
        status,
        updated_at: serverTimestamp(),
        updated_by: user?.email
      });
      
      toast({
        title: "Status Updated",
        description: `Request marked as ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };

  // Update request details
  const updateRequestDetails = async (requestId: string, updatedData: Partial<EServiceRequest>) => {
    // Basic validation
    const errors: {[key: string]: string} = {};
    
    if (!updatedData.name || updatedData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    if (!updatedData.email || !/\S+@\S+\.\S+/.test(updatedData.email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!updatedData.phone || !/^\d{10,15}$/.test(updatedData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Valid phone number is required';
    }
    
    // If there are validation errors, update state and return
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive"
      });
      return;
    }
    
    // Clear form errors
    setFormErrors({});
    
    try {
      await updateDoc(doc(db, 'eservice_requests', requestId), {
        ...updatedData,
        updated_at: serverTimestamp(),
        updated_by: user?.email
      });
      
      toast({
        title: "Request Updated",
        description: "Request details updated successfully",
      });
      setEditingRequest(null);
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update request details",
        variant: "destructive"
      });
    }
  };

  // Delete requests
  const deleteRequests = async (ids: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} request(s)?`)) {
      return;
    }

    try {
      await Promise.all(ids.map(id => deleteDoc(doc(db, 'eservice_requests', id))));
      setSelectedRequests([]);
      toast({
        title: "Requests Deleted",
        description: `${ids.length} request(s) deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting requests:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete requests",
        variant: "destructive"
      });
    }
  };

  // Handle note change with debounce
  const debouncedNoteUpdate = useCallback(
    debounce(async (requestId: string, note: string) => {
      try {
        await updateDoc(doc(db, 'eservice_requests', requestId), {
          adminNotes: note,
          updated_at: serverTimestamp(),
          updated_by: user?.email
        });
      } catch (error) {
        console.error("Error updating note:", error);
        toast({
          title: "Error",
          description: "Failed to save note",
          variant: "destructive"
        });
      }
    }, 1000),
    [user?.email, toast]
  );

  const handleNoteChange = (id: string, note: string) => {
    setAdminNotes(prev => ({ ...prev, [id]: note }));
    debouncedNoteUpdate(id, note);
  };

  // Handle contact actions
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get service type info
  const getServiceInfo = (serviceType: string) => {
    return E_SERVICE_TYPES[serviceType as keyof typeof E_SERVICE_TYPES] || {
      label: serviceType,
      icon: '📄'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-Services Management</h2>
          <p className="text-gray-600">Manage service requests and fee settings</p>
        </div>
      </div>

      {/* Tabs for Request Management and Fee Management */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Application Requests
          </TabsTrigger>
          <TabsTrigger value="fee-management" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fee Management
          </TabsTrigger>
          <TabsTrigger value="page-settings" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Page Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Request Management Section */}
          <div className="space-y-6">
            {/* Tools and Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Application Requests</h3>
                <p className="text-gray-600">Track and manage all e-service requests</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Excel Export Buttons */}
                <EServiceExcelExportButton 
                  requests={requests}
                  filteredRequests={filteredRequests}
                />
                
                {selectedRequests.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRequests(selectedRequests)}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete Selected ({selectedRequests.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: requests.length, color: "blue" },
          { label: "Pending", value: requests.filter(r => r.status === 'pending').length, color: "yellow" },
          { label: "In Progress", value: requests.filter(r => r.status === 'in_progress').length, color: "indigo" },
          { label: "Completed", value: requests.filter(r => r.status === 'completed').length, color: "green" }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                  <FileText className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="service-filter">Service Type</Label>
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {Object.entries(E_SERVICE_TYPES).map(([key, service]) => (
                    <SelectItem key={key} value={key}>{service.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setServiceTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No E-Service Requests Found</h3>
              <p className="text-gray-600">
                {requests.length === 0 
                  ? "No e-service requests have been submitted yet."
                  : "No requests match your current filters. Try adjusting your search criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const serviceInfo = getServiceInfo(request.serviceType);
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRequests(prev => [...prev, request.id]);
                          } else {
                            setSelectedRequests(prev => prev.filter(id => id !== request.id));
                          }
                        }}
                      />
                      <div className="text-2xl">{serviceInfo.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{request.name}</CardTitle>
                        <p className="text-sm text-gray-600">{serviceInfo.label}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingRequest(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormErrors({});
                          setEditingRequest(request);
                        }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contact</p>
                      <p className="text-sm">{request.email}</p>
                      <p className="text-sm">{request.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Submitted</p>
                      <p className="text-sm">{formatFirebaseTimestamp(request.created_at)}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <p className="text-sm">
                        {request.documents?.length || 0} file(s) uploaded
                      </p>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      size="sm"
                      variant={request.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => updateRequestStatus(request.id, 'pending')}
                    >
                      Pending
                    </Button>
                    <Button
                      size="sm"
                      variant={request.status === 'in_progress' ? 'default' : 'outline'}
                      onClick={() => updateRequestStatus(request.id, 'in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant={request.status === 'completed' ? 'default' : 'outline'}
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                    >
                      Completed
                    </Button>
                    <Button
                      size="sm"
                      variant={request.status === 'rejected' ? 'destructive' : 'outline'}
                      onClick={() => updateRequestStatus(request.id, 'rejected')}
                    >
                      Rejected
                    </Button>
                  </div>

                  {/* Admin Notes */}
                  <div className="mb-4">
                    <Label htmlFor={`notes-${request.id}`} className="text-sm font-medium">
                      Admin Notes
                    </Label>
                    <Textarea
                      id={`notes-${request.id}`}
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => handleNoteChange(request.id, e.target.value)}
                      placeholder="Add notes about this request..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCall(request.phone)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmail(request.email)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormErrors({});
                          setEditingRequest(request);
                        }}
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRequests([request.id])}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* View Request Modal */}
      <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-Service Request Details</DialogTitle>
          </DialogHeader>
          
          {viewingRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Service Type</Label>
                  <p>{getServiceInfo(viewingRequest.serviceType).label}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <Badge className={getStatusBadgeColor(viewingRequest.status)}>
                    {viewingRequest.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Name</Label>
                  <p>{viewingRequest.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{viewingRequest.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Phone</Label>
                  <p>{viewingRequest.phone}</p>
                </div>
                <div>
                  <Label className="font-medium">Submitted</Label>
                  <p>{formatFirebaseTimestamp(viewingRequest.created_at)}</p>
                </div>
              </div>

              {viewingRequest.requestDetails.address && (
                <div>
                  <Label className="font-medium">Address</Label>
                  <p>{viewingRequest.requestDetails.address}</p>
                </div>
              )}

              <div>
                <Label className="font-medium">Service-Specific Details</Label>
                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                  {Object.entries(viewingRequest.requestDetails)
                    .filter(([key]) => key !== 'address')
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{value || 'Not provided'}</span>
                      </div>
                    ))}
                </div>
              </div>

              {viewingRequest.documents && viewingRequest.documents.length > 0 && (
                <div>
                  <Label className="font-medium">Uploaded Documents</Label>
                  <div className="space-y-2 mt-2">
                    {viewingRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{doc.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog 
        open={!!editingRequest} 
        onOpenChange={(open) => {
          if (!open) {
            setFormErrors({});
            setEditingRequest(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit E-Service Request</DialogTitle>
          </DialogHeader>
          
          {editingRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name" className="font-medium">Name</Label>
                  <Input 
                    id="edit-name"
                    value={editingRequest.name}
                    onChange={(e) => setEditingRequest({...editingRequest, name: e.target.value})}
                    className={`mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-email" className="font-medium">Email</Label>
                  <Input 
                    id="edit-email"
                    type="email"
                    value={editingRequest.email}
                    onChange={(e) => setEditingRequest({...editingRequest, email: e.target.value})}
                    className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone" className="font-medium">Phone</Label>
                  <Input 
                    id="edit-phone"
                    value={editingRequest.phone}
                    onChange={(e) => setEditingRequest({...editingRequest, phone: e.target.value})}
                    className={`mt-1 ${formErrors.phone ? 'border-red-500' : ''}`}
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-status" className="font-medium">Status</Label>
                  <Select 
                    value={editingRequest.status} 
                    onValueChange={(value) => setEditingRequest({
                      ...editingRequest, 
                      status: value as 'pending' | 'in_progress' | 'completed' | 'rejected'
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address field if it exists */}
              {editingRequest.requestDetails.address !== undefined && (
                <div>
                  <Label htmlFor="edit-address" className="font-medium">Address</Label>
                  <Textarea
                    id="edit-address"
                    value={editingRequest.requestDetails.address}
                    onChange={(e) => setEditingRequest({
                      ...editingRequest,
                      requestDetails: {
                        ...editingRequest.requestDetails,
                        address: e.target.value
                      }
                    })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {/* Service-specific details */}
              <div>
                <Label className="font-medium">Service-Specific Details</Label>
                <div className="space-y-3 mt-2">
                  {Object.entries(editingRequest.requestDetails)
                    .filter(([key]) => key !== 'address')
                    .map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={`edit-${key}`} className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Input
                          id={`edit-${key}`}
                          value={value || ''}
                          onChange={(e) => setEditingRequest({
                            ...editingRequest,
                            requestDetails: {
                              ...editingRequest.requestDetails,
                              [key]: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <Label htmlFor="edit-admin-notes" className="font-medium">Admin Notes</Label>
                <Textarea
                  id="edit-admin-notes"
                  value={editingRequest.adminNotes || ''}
                  onChange={(e) => setEditingRequest({
                    ...editingRequest,
                    adminNotes: e.target.value
                  })}
                  className="mt-1"
                  rows={3}
                  placeholder="Add administrative notes about this request..."
                />
              </div>
              
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormErrors({});
                    setEditingRequest(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateRequestDetails(editingRequest.id, editingRequest)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="fee-management" className="space-y-6">
          <EServiceFeeManagement 
            user={user}
            formatFirebaseTimestamp={formatFirebaseTimestamp}
          />
        </TabsContent>

        <TabsContent value="page-settings" className="space-y-6">
          {/* Page Visibility Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-travel-blue-dark" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Page Visibility Settings</h2>
                <p className="text-gray-600">Control which pages are visible to users on the website</p>
              </div>
            </div>

            {/* E-Services Page Visibility Toggle */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">E-Services Page</CardTitle>
                      <CardDescription className="text-sm">
                        Show or hide the E-Services page in the main navigation menu
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={isPageVisible('eservices') ? "default" : "secondary"}>
                      {isPageVisible('eservices') ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </>
                      )}
                    </Badge>
                    <Switch
                      checked={isPageVisible('eservices')}
                      onCheckedChange={(checked) => {
                        if (user?.email === 'admin@anandtravels.com') {
                          updatePageVisibility('eservices', checked, user.email);
                        } else {
                          toast({
                            title: 'Unauthorized',
                            description: 'Only admin can change page visibility settings',
                            variant: 'destructive'
                          });
                        }
                      }}
                      disabled={visibilityLoading || user?.email !== 'admin@anandtravels.com'}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">What this affects:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• The "E-Services" link in the main navigation menu</li>
                      <li>• The E-Services page at /eservices</li>
                      <li>• Mobile menu E-Services option</li>
                    </ul>
                  </div>
                  
                  {!isPageVisible('eservices') && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <EyeOff className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-orange-800">Page is currently hidden</h4>
                          <p className="text-sm text-orange-700 mt-1">
                            Users will not be able to see the E-Services page in the navigation menu. 
                            Direct access to /eservices will still work but the link won't be visible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {visibility.lastUpdated && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Last updated: {formatFirebaseTimestamp(visibility.lastUpdated)} by {visibility.updatedBy}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Settings2 className="h-5 w-5" />
                  Page Visibility Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <ul className="space-y-2 text-sm">
                  <li>• Toggle ON to show the E-Services page in the website navigation</li>
                  <li>• Toggle OFF to hide the E-Services page from users</li>
                  <li>• Changes take effect immediately across the website</li>
                  <li>• Hidden pages can still be accessed directly via URL if needed</li>
                  <li>• Existing applications and data are not affected by visibility changes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EServicesManagementTab;
