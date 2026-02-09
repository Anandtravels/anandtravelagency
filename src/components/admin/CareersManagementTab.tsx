import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  FileText,
  Phone,
  Mail,
  Laptop,
  Globe,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Job {
  id: string;
  title: string;
  type: string;
  description: string;
  requirements: string;
  status: string;
  createdAt: any;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  knowsHindi: string;
  hasLaptop: string;
  resumeFileName: string | null;
  resumeData: string | null;
  message: string;
  status: string;
  createdAt: any;
}

interface CareersManagementTabProps {
  user: any;
}

const CareersManagementTab: React.FC<CareersManagementTabProps> = ({ user }) => {
  const { toast } = useToast();
  const { visibility, updatePageVisibility } = usePageVisibility();

  // State
  const [activeSubTab, setActiveSubTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Job form state
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    type: 'Internship',
    description: '',
    requirements: '',
    status: 'Open',
  });

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Application detail
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appDetailOpen, setAppDetailOpen] = useState(false);

  // Fetch jobs in real-time
  useEffect(() => {
    const q = query(collection(db, 'career_jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsList);
      setJobsLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setJobsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch applications in real-time
  useEffect(() => {
    const q = query(collection(db, 'career_applications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      setApplications(appsList);
      setAppsLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setAppsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Page visibility toggle
  const careersVisible = visibility?.careers ?? false;

  const handleToggleCareersPage = async () => {
    try {
      await updatePageVisibility('careers', !careersVisible, user?.email || 'admin');
    } catch (error) {
      console.error('Error toggling careers page:', error);
    }
  };

  // Job CRUD
  const openAddJob = () => {
    setEditingJob(null);
    setJobForm({ title: '', type: 'Internship', description: '', requirements: '', status: 'Open' });
    setJobDialogOpen(true);
  };

  const openEditJob = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
    });
    setJobDialogOpen(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title.trim()) {
      toast({ title: 'Error', description: 'Job title is required', variant: 'destructive' });
      return;
    }

    try {
      if (editingJob) {
        await updateDoc(doc(db, 'career_jobs', editingJob.id), {
          ...jobForm,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Job Updated', description: `"${jobForm.title}" has been updated.` });
      } else {
        await addDoc(collection(db, 'career_jobs'), {
          ...jobForm,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Job Added', description: `"${jobForm.title}" has been added.` });
      }
      setJobDialogOpen(false);
    } catch (error) {
      console.error('Error saving job:', error);
      toast({ title: 'Error', description: 'Failed to save job. Please try again.', variant: 'destructive' });
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingJobId) return;
    try {
      await deleteDoc(doc(db, 'career_jobs', deletingJobId));
      toast({ title: 'Job Deleted', description: 'The job listing has been removed.' });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({ title: 'Error', description: 'Failed to delete job.', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingJobId(null);
    }
  };

  const toggleJobStatus = async (job: Job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await updateDoc(doc(db, 'career_jobs', job.id), { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: 'Status Updated', description: `Job is now ${newStatus}.` });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Application management
  const updateApplicationStatus = async (appId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'career_applications', appId), { status, updatedAt: serverTimestamp() });
      toast({ title: 'Status Updated', description: `Application marked as ${status}.` });
      if (selectedApp?.id === appId) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const handleDownloadResume = (app: Application) => {
    if (!app.resumeData) return;
    const link = document.createElement('a');
    link.href = app.resumeData;
    link.download = app.resumeFileName || 'resume';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewResume = (app: Application) => {
    if (!app.resumeData) return;
    // Open resume in a new tab for viewing
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${app.resumeFileName || 'Resume'} - ${app.fullName}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f5f5f5; }
              iframe, embed, img { max-width: 100%; max-height: 100vh; border: none; }
              .container { width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <div class="container">
              ${app.resumeData.startsWith('data:application/pdf') 
                ? `<embed src="${app.resumeData}" type="application/pdf" width="100%" height="100%" />`
                : app.resumeData.startsWith('data:image') 
                  ? `<img src="${app.resumeData}" alt="Resume" />`
                  : `<iframe src="${app.resumeData}" width="100%" height="100%"></iframe>`
              }
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' ||
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-yellow-100 text-yellow-700',
      'Selected': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Briefcase className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Careers Management</h1>
            <p className="text-sm text-gray-500">Manage jobs, applications & page visibility</p>
          </div>
        </div>
      </div>

      {/* Page Visibility Control */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            {careersVisible ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-gray-900">Careers Page Visibility</p>
              <p className="text-sm text-gray-500">
                {careersVisible
                  ? 'Careers page is live and visible to visitors'
                  : 'Careers page is hidden from the website'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={careersVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {careersVisible ? 'ON' : 'OFF'}
            </Badge>
            <Switch
              checked={careersVisible}
              onCheckedChange={handleToggleCareersPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs: Jobs / Applications */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications ({applications.length})
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Manage your job listings and internship positions</p>
            <Button onClick={openAddJob} className="bg-travel-orange hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" /> Add Job
            </Button>
          </div>

          {jobsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-travel-orange"></div>
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Jobs Listed</h3>
                <p className="text-gray-500 mb-4">Create your first job listing to start receiving applications.</p>
                <Button onClick={openAddJob} className="bg-travel-orange hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" /> Add First Job
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant="outline" className="text-xs">{job.type}</Badge>
                        <Badge className={`text-xs ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Created: {formatDate(job.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleJobStatus(job)}
                        className={job.status === 'Open' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}
                      >
                        {job.status === 'Open' ? 'Close' : 'Reopen'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditJob(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => { setDeletingJobId(job.id); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Selected">Selected</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', count: applications.length, color: 'bg-blue-100 text-blue-700' },
              { label: 'New', count: applications.filter(a => a.status === 'New').length, color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Selected', count: applications.filter(a => a.status === 'Selected').length, color: 'bg-green-100 text-green-700' },
              { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'bg-red-100 text-red-700' },
            ].map((stat) => (
              <Card key={stat.label} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <Badge className={stat.color}>{stat.count}</Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Applications List */}
          {appsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-travel-orange"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Applications</h3>
                <p className="text-gray-500">{searchTerm || statusFilter !== 'all' ? 'No matching applications found.' : 'No applications received yet.'}</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setSelectedApp(app); setAppDetailOpen(true); }}>
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{app.fullName}</h3>
                        <Badge className={getStatusBadge(app.status)}>{app.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.phone}</span>
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />Hindi: {app.knowsHindi}</span>
                        <span className="flex items-center gap-1"><Laptop className="h-3 w-3" />Laptop: {app.hasLaptop}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(app.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {app.resumeData && (
                        <>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewResume(app); }} title="View Resume">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadResume(app); }} title="Download Resume">
                            <Download className="h-4 w-4 mr-1" /> Resume
                          </Button>
                        </>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'Contacted')}>
                            <Clock className="h-4 w-4 mr-2" /> Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'Selected')}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Mark Selected
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateApplicationStatus(app.id, 'Rejected')} className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" /> Mark Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Add/Edit Dialog */}
      <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
            <DialogDescription>
              {editingJob ? 'Update the job listing details.' : 'Create a new job listing or internship position.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
              <Input
                id="jobTitle"
                value={jobForm.title}
                onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Travel Consultant Intern"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={jobForm.type} onValueChange={(val) => setJobForm(prev => ({ ...prev, type: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="WFH">Work From Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={jobForm.status} onValueChange={(val) => setJobForm(prev => ({ ...prev, status: val }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDesc">Description</Label>
              <Textarea
                id="jobDesc"
                value={jobForm.description}
                onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role and responsibilities..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobReqs">Requirements</Label>
              <Textarea
                id="jobReqs"
                value={jobForm.requirements}
                onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="List the requirements for this position..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJobDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveJob} className="bg-travel-orange hover:bg-orange-600">
              {editingJob ? 'Update Job' : 'Add Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The job listing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Application Detail Dialog */}
      <Dialog open={appDetailOpen} onOpenChange={setAppDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedApp.fullName}</h3>
                <Badge className={getStatusBadge(selectedApp.status)}>{selectedApp.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${selectedApp.email}`} className="text-blue-600 hover:underline">{selectedApp.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${selectedApp.phone}`} className="text-blue-600 hover:underline">{selectedApp.phone}</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>Knows Hindi: <strong>{selectedApp.knowsHindi}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Laptop className="h-4 w-4 text-gray-400" />
                  <span>Has Laptop: <strong>{selectedApp.hasLaptop}</strong></span>
                </div>
              </div>

              {selectedApp.resumeData && (
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{selectedApp.resumeFileName || 'Resume'}</span>
                  <Button variant="outline" size="sm" onClick={() => handleViewResume(selectedApp)} title="View Resume">
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadResume(selectedApp)} title="Download Resume">
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </div>
              )}

              {selectedApp.message && (
                <div>
                  <Label className="flex items-center gap-1 mb-1"><MessageSquare className="h-4 w-4" /> Message</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedApp.message}</p>
                </div>
              )}

              <div className="text-xs text-gray-400">
                <Calendar className="h-3 w-3 inline mr-1" /> Applied: {formatDate(selectedApp.createdAt)}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant={selectedApp.status === 'Contacted' ? 'default' : 'outline'}
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Contacted')}
                  className={selectedApp.status === 'Contacted' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                >
                  <Clock className="h-4 w-4 mr-1" /> Contacted
                </Button>
                <Button
                  size="sm"
                  variant={selectedApp.status === 'Selected' ? 'default' : 'outline'}
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Selected')}
                  className={selectedApp.status === 'Selected' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Selected
                </Button>
                <Button
                  size="sm"
                  variant={selectedApp.status === 'Rejected' ? 'default' : 'outline'}
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Rejected')}
                  className={selectedApp.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Rejected
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareersManagementTab;
