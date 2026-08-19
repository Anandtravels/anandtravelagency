import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';

// UI Components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import { Ticket, Plus, Trash2, Edit, Copy, CalendarDays, Users, PercentIcon, DollarSign, Check, X, RefreshCw, ArrowLeft } from 'lucide-react';

interface Coupon {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed'; 
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number | null;
  usedCount: number;
  active: boolean;
  usedBy: string[];
  description?: string;
  createdAt?: Date;
  redemptions?: Redemption[];
}

interface Redemption {
  bookingId: string;
  bookingType: string;
  appliedAt: Date;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  personName?: string; // Added person name
  personPhone?: string; // Added person phone
}

interface UsageDetails {
  userId: string;
  userName?: string;
  email?: string;
  usedOn: Date;
  orderAmount?: number;
  discountAmount?: number;
}

const CouponManager = () => {
  // Authentication and navigation
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      navigate("/admin-login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  // State management
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [usageDetails, setUsageDetails] = useState<UsageDetails[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Form state for creating/editing coupons
  const [couponForm, setCouponForm] = useState<Coupon>({
    code: '',
    type: 'percentage',
    value: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days from now
    maxUses: null,
    usedCount: 0,
    active: true,
    usedBy: [],
    description: ''
  });
  
  // Add state for redemption deletion confirmation
  const [selectedRedemptions, setSelectedRedemptions] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [redemptionToDelete, setRedemptionToDelete] = useState<{index: number, couponId: string} | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!loading && (!user || user.email !== 'admin@anandtravels.com')) {
      navigate('/admin-login');
    } else if (!loading) {
      fetchCoupons();
    }
  }, [user, loading, navigate]);
  
  // Fetch coupons from Firestore
  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const couponsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code,
          type: data.type,
          value: data.value,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          maxUses: data.maxUses,
          usedCount: data.usedCount || 0,
          active: data.active,
          usedBy: data.usedBy || [],
          description: data.description,
          createdAt: data.createdAt?.toDate(),
          redemptions: data.redemptions || []
        } as Coupon;
      });
      
      setCoupons(couponsList);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating a new coupon
  const handleCreateCoupon = async () => {
    try {
      // Input validation
      if (!couponForm.code || couponForm.value <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly.",
          variant: "destructive"
        });
        return;
      }
      
      // Normalize coupon code to uppercase
      const normalizedCode = couponForm.code.toUpperCase();
      
      // Check if coupon code already exists
      if (!editMode) {
        const codeCheck = query(collection(db, 'coupons'), where('code', '==', normalizedCode));
        const existingCoupons = await getDocs(codeCheck);
        if (!existingCoupons.empty) {
          toast({
            title: "Error",
            description: "Coupon code already exists. Please choose another code.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Prepare coupon data
      const couponData = {
        ...couponForm,
        code: normalizedCode,
        startDate: couponForm.startDate,
        endDate: couponForm.endDate,
        usedCount: editMode ? couponForm.usedCount : 0,
        usedBy: editMode ? couponForm.usedBy : [],
        createdAt: editMode ? couponForm.createdAt : serverTimestamp()
      };
      
      // Save to Firestore
      if (editMode && activeCoupon?.id) {
        await updateDoc(doc(db, 'coupons', activeCoupon.id), couponData);
        toast({
          title: "Success",
          description: "Coupon updated successfully!",
        });
      } else {
        await addDoc(collection(db, 'coupons'), {
          ...couponData,
          createdAt: serverTimestamp()
        });
        toast({
          title: "Success",
          description: "New coupon created successfully!",
        });
      }
      
      // Reset form and reload coupons
      resetForm();
      setShowCreateModal(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle deleting a coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(coupon => coupon.id !== id));
      toast({
        title: "Success",
        description: "Coupon deleted successfully!"
      });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle toggling coupon active status
  const handleToggleActive = async (coupon: Coupon) => {
    if (!coupon.id) return;
    
    try {
      const newStatus = !coupon.active;
      await updateDoc(doc(db, 'coupons', coupon.id), {
        active: newStatus
      });
      setCoupons(coupons.map(c => (
        c.id === coupon.id ? { ...c, active: newStatus } : c
      )));
      toast({
        title: newStatus ? "Coupon Activated" : "Coupon Deactivated",
        description: newStatus 
          ? "The coupon is now active and can be used." 
          : "The coupon has been deactivated.",
      });
    } catch (error) {
      console.error("Error updating coupon status:", error);
      toast({
        title: "Error",
        description: "Failed to update coupon status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle editing a coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setActiveCoupon(coupon);
    setCouponForm({
      ...coupon,
      startDate: coupon.startDate || new Date(),
      endDate: coupon.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    setEditMode(true);
    setShowCreateModal(true);
  };
  
  // Handle viewing coupon usage details
  const handleViewUsage = async (coupon: Coupon) => {
    setActiveCoupon(coupon);
    setShowUsageModal(true);
    
    // In a real application, you'd fetch more usage details here
    // For now, we'll create sample data based on usedBy array
    const mockUsageDetails = coupon.usedBy.map((userId, index) => ({
      userId,
      userName: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      usedOn: new Date(Date.now() - (Math.random() * 10 * 24 * 60 * 60 * 1000)), // Random date within last 10 days
      orderAmount: Math.floor(Math.random() * 5000) + 1000, // Random amount between 1000-6000
      discountAmount: coupon.type === 'percentage' 
        ? Math.floor((Math.random() * 5000 + 1000) * (coupon.value / 100)) 
        : coupon.value
    }));
    
    setUsageDetails(mockUsageDetails.sort((a, b) => b.usedOn.getTime() - a.usedOn.getTime()));
  };
  
  // Reset form to default values
  const resetForm = () => {
    setCouponForm({
      code: '',
      type: 'percentage',
      value: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxUses: null,
      usedCount: 0,
      active: true,
      usedBy: [],
      description: ''
    });
    setActiveCoupon(null);
    setEditMode(false);
  };
  
  // Format dates for input fields
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Calculate coupon status
  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    
    if (!coupon.active) {
      return { status: 'inactive', label: 'Inactive' };
    }
    
    if (now < coupon.startDate) {
      return { status: 'pending', label: 'Pending' };
    }
    
    if (now > coupon.endDate) {
      return { status: 'expired', label: 'Expired' };
    }
    
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { status: 'depleted', label: 'Depleted' };
    }
    
    return { status: 'active', label: 'Active' };
  };
  
  // Copy coupon code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Coupon code ${code} copied to clipboard.`,
    });
  };
  
  // Filter coupons based on selected filter
  const getFilteredCoupons = () => {
    if (filter === 'all') return coupons;
    if (filter === 'active') {
      return coupons.filter(coupon => {
        const now = new Date();
        return coupon.active && now >= coupon.startDate && now <= coupon.endDate && 
               (!coupon.maxUses || coupon.usedCount < coupon.maxUses);
      });
    }
    if (filter === 'pending') {
      return coupons.filter(coupon => {
        const now = new Date();
        return coupon.active && now < coupon.startDate;
      });
    }
    if (filter === 'expired') {
      return coupons.filter(coupon => {
        const now = new Date();
        return now > coupon.endDate || !coupon.active || 
               (coupon.maxUses && coupon.usedCount >= coupon.maxUses);
      });
    }
    return coupons;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.07 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };
  
  // Add a function to get the correct booking charge based on booking type
  const getBookingChargeForType = (bookingType: string): number => {
    // Check for premium booking types
    if (bookingType.toLowerCase().includes('premium') || 
        bookingType.toLowerCase().includes('premium_tatkal')) {
      return 250;
    }
    // Check for tatkal booking types
    else if (bookingType.toLowerCase().includes('tatkal')) {
      return 200;
    }
    else if (bookingType.toLowerCase().includes('advance')) {
      return 150; // Defaulting to Sleeper since class isn't known here
    }
    // Default is general booking
    else {
      return 50;
    }
  };
  
  // Format display of booking type for better readability
  const formatBookingTypeDisplay = (bookingType: string): string => {
    if (bookingType.toLowerCase().includes('premium') || 
        bookingType.toLowerCase().includes('premium_tatkal')) {
      return 'Premium Booking';
    } else if (bookingType.toLowerCase().includes('tatkal')) {
      return 'Tatkal Booking';  
    } else if (bookingType.toLowerCase().includes('advance')) {
      return 'Advance Booking';
    } else if (bookingType.toLowerCase() === 'train' || 
              bookingType.toLowerCase() === 'bus' || 
              bookingType.toLowerCase() === 'flight') {
      return `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} (General)`;
    } else {
      return bookingType;
    }
  };
  
  // Handle individual redemption deletion
  const handleDeleteRedemption = async (couponId: string, redemptionIndex: number) => {
    setRedemptionToDelete({ index: redemptionIndex, couponId });
    setBulkDeleteMode(false);
    setShowDeleteConfirm(true);
  };
  
  // Toggle selection of a redemption record
  const toggleRedemptionSelection = (index: number) => {
    setSelectedRedemptions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  // Toggle selection of all redemption records
  const toggleAllRedemptions = (checked: boolean) => {
    if (checked && activeCoupon?.redemptions) {
      setSelectedRedemptions([...Array(activeCoupon.redemptions.length).keys()]);
    } else {
      setSelectedRedemptions([]);
    }
  };
  
  // Handle bulk deletion of selected redemptions
  const handleDeleteSelected = () => {
    if (selectedRedemptions.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteConfirm(true);
    }
  };
  
  // Reset selections when modal is closed or different coupon is selected
  useEffect(() => {
    setSelectedRedemptions([]);
    setBulkDeleteMode(false);
  }, [showUsageModal, activeCoupon]);
  
  // Implement the actual deletion process for single or multiple records
  const confirmDeleteRedemption = async () => {
    if ((!redemptionToDelete && !bulkDeleteMode) || !activeCoupon) return;
    
    try {
      if (bulkDeleteMode) {
        // Sort indices in descending order to avoid index shifting during deletion
        const sortedIndices = [...selectedRedemptions].sort((a, b) => b - a);
        
        // Create a copy of the redemptions array
        const updatedRedemptions = [...activeCoupon.redemptions || []];
        
        // Remove the selected indices
        sortedIndices.forEach(index => {
          updatedRedemptions.splice(index, 1);
        });
        
        // Update Firestore document
        await updateDoc(doc(db, 'coupons', activeCoupon.id!), {
          redemptions: updatedRedemptions,
          // Also decrement the usedCount by the number of deleted redemptions
          usedCount: Math.max(0, (activeCoupon.usedCount || selectedRedemptions.length) - selectedRedemptions.length)
        });
        
        // Update local state
        const updatedCoupon = {
          ...activeCoupon,
          redemptions: updatedRedemptions,
          usedCount: Math.max(0, (activeCoupon.usedCount || selectedRedemptions.length) - selectedRedemptions.length)
        };
        
        setActiveCoupon(updatedCoupon);
        
        // Update coupons list
        setCoupons(coupons.map(c => 
          c.id === activeCoupon.id ? updatedCoupon : c
        ));
        
        toast({
          title: `${selectedRedemptions.length} Redemptions Deleted`,
          description: "The selected redemption records have been removed."
        });
        
      } else if (redemptionToDelete) {
        // Single redemption deletion logic
        const updatedRedemptions = [...activeCoupon.redemptions || []];
        updatedRedemptions.splice(redemptionToDelete.index, 1);
        
        // Update Firestore document
        await updateDoc(doc(db, 'coupons', redemptionToDelete.couponId), {
          redemptions: updatedRedemptions,
          // Also decrement the usedCount
          usedCount: Math.max(0, (activeCoupon.usedCount || 1) - 1)
        });
        
        // Update local state
        const updatedCoupon = {
          ...activeCoupon,
          redemptions: updatedRedemptions,
          usedCount: Math.max(0, (activeCoupon.usedCount || 1) - 1)
        };
        
        setActiveCoupon(updatedCoupon);
        
        // Update coupons list
        setCoupons(coupons.map(c => 
          c.id === redemptionToDelete.couponId ? updatedCoupon : c
        ));
        
        toast({
          title: "Redemption Deleted",
          description: "The redemption record has been removed successfully."
        });
      }
      
    } catch (error) {
      console.error("Error deleting redemption(s):", error);
      toast({
        title: "Error",
        description: "Failed to delete the redemption record(s).",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setRedemptionToDelete(null);
      setBulkDeleteMode(false);
      setSelectedRedemptions([]);
    }
  };
  
  // Check if there are any redemptions to display
  const hasRedemptions = activeCoupon?.redemptions && activeCoupon.redemptions.length > 0;
  
  return (
    <AdminLayout userEmail={user?.email} onSignOut={handleSignOut}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Ticket className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Coupon Management</h1>
                <p className="text-sm text-gray-500">Create and manage promotional coupons</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {/* Stats Cards - Improved responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-blue-100 p-3">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                Total
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">{coupons.length}</h3>
              <p className="text-gray-500 text-sm">Total Coupons</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
                Active
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">
                {coupons.filter(coupon => {
                  const now = new Date();
                  return coupon.active && now >= coupon.startDate && now <= coupon.endDate && 
                        (!coupon.maxUses || coupon.usedCount < coupon.maxUses);
                }).length}
              </h3>
              <p className="text-gray-500 text-sm">Active Coupons</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-amber-100 p-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                Usage
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">
                {coupons.reduce((total, coupon) => total + coupon.usedCount, 0)}
              </h3>
              <p className="text-gray-500 text-sm">Total Redemptions</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-red-100 p-3">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
                Expired
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold">
                {coupons.filter(coupon => {
                  const now = new Date();
                  return now > coupon.endDate || 
                         (coupon.maxUses && coupon.usedCount >= coupon.maxUses);
                }).length}
              </h3>
              <p className="text-gray-500 text-sm">Expired Coupons</p>
            </div>
          </motion.div>
        </div>
        
        {/* Coupons Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-travel-blue-dark">All Coupons</h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchCoupons}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </Button>
                
                <Tabs defaultValue="all" value={filter} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                    <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
                    <TabsTrigger value="active" onClick={() => setFilter('active')}>Active</TabsTrigger>
                    <TabsTrigger value="pending" onClick={() => setFilter('pending')}>Pending</TabsTrigger>
                    <TabsTrigger value="expired" onClick={() => setFilter('expired')}>Expired</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-32 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-travel-blue-dark border-r-transparent mb-4"></div>
              <p>Loading coupons...</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Make tables responsive */}
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredCoupons().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                          <div className="flex flex-col items-center">
                            <Ticket className="h-12 w-12 text-gray-300 mb-2" />
                            <p className="text-lg font-medium mb-1">No coupons found</p>
                            <p className="text-sm">Create your first coupon to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getFilteredCoupons().map((coupon, index) => {
                        const status = getCouponStatus(coupon);
                        
                        return (
                          <motion.tr 
                            key={coupon.id}
                            variants={itemVariants}
                            className="border-b hover:bg-gray-50/50"
                          >
                            <TableCell className="py-4 font-medium">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-travel-blue-dark hover:bg-travel-blue font-mono tracking-wider">
                                  {coupon.code}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => copyToClipboard(coupon.code)}
                                  title="Copy to clipboard"
                                  className="h-6 w-6 rounded-full hover:bg-travel-blue-dark/10"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {coupon.type === 'percentage' ? (
                                  <div className="bg-blue-100 p-1 rounded">
                                    <PercentIcon className="h-4 w-4 text-blue-600" />
                                  </div>
                                ) : (
                                  <div className="bg-green-100 p-1 rounded">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                  </div>
                                )}
                                <span>
                                  {coupon.type === 'percentage' 
                                    ? `${coupon.value}% off`
                                    : `₹${coupon.value} off`
                                  }
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <div className="text-sm">
                                  <div>{coupon.startDate?.toLocaleDateString()}</div>
                                  <div className="text-gray-500">to {coupon.endDate?.toLocaleDateString()}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {status.status === 'active' && (
                                <Badge className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300">Active</Badge>
                              )}
                              {status.status === 'inactive' && (
                                <Badge className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300">Inactive</Badge>
                              )}
                              {status.status === 'pending' && (
                                <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300">Pending</Badge>
                              )}
                              {status.status === 'expired' && (
                                <Badge className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300">Expired</Badge>
                              )}
                              {status.status === 'depleted' && (
                                <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300">Depleted</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {(coupon.usedBy.length > 0 || (coupon.redemptions && coupon.redemptions.length > 0)) ? (
                                    <button
                                      onClick={() => handleViewUsage(coupon)}
                                      className="text-left text-travel-blue-dark hover:underline"
                                    >
                                      View Details
                                    </button>
                                  ) : (
                                    "Never used"
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <div className="flex items-center h-8 px-2 border border-gray-300 rounded-md">
                                  <Switch 
                                    checked={coupon.active} 
                                    onCheckedChange={() => handleToggleActive(coupon)}
                                    className="mr-2 h-4" 
                                  />
                                  <span className="text-sm">{coupon.active ? 'Active' : 'Inactive'}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600"
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => handleDeleteCoupon(coupon.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </div>
      
      {/* Create/Edit Coupon Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl flex justify-center items-center gap-2">
              <Ticket className="h-5 w-5 text-travel-orange" />
              <span>{editMode ? 'Edit Coupon' : 'Create New Coupon'}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code <span className="text-red-500">*</span></Label>
              <Input
                id="code"
                value={couponForm.code}
                onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                placeholder="SUMMER25"
                className="uppercase"
                maxLength={15}
              />
              <p className="text-xs text-gray-500">
                Use short, memorable codes (e.g. SUMMER25, WELCOME10)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Discount Type <span className="text-red-500">*</span></Label>
                <Select
                  value={couponForm.type}
                  onValueChange={(value) => setCouponForm({...couponForm, type: value as 'percentage' | 'fixed'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">
                  {couponForm.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={couponForm.value}
                  onChange={(e) => setCouponForm({...couponForm, value: parseFloat(e.target.value) || 0})}
                  min="0"
                  max={couponForm.type === 'percentage' ? 100 : undefined}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Valid From <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formatDateForInput(couponForm.startDate)}
                  onChange={(e) => setCouponForm({...couponForm, startDate: new Date(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Valid Until <span className="text-red-500">*</span></Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formatDateForInput(couponForm.endDate)}
                  onChange={(e) => setCouponForm({...couponForm, endDate: new Date(e.target.value)})}
                  min={formatDateForInput(couponForm.startDate)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Uses (leave empty for unlimited)</Label>
              <Input
                id="maxUses"
                type="number"
                value={couponForm.maxUses === null ? '' : couponForm.maxUses}
                onChange={(e) => setCouponForm({
                  ...couponForm, 
                  maxUses: e.target.value === '' ? null : parseInt(e.target.value)
                })}
                min="0"
                placeholder="Unlimited"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={couponForm.description || ''}
                onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                placeholder="Summer sale discount"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={couponForm.active}
                onCheckedChange={(checked) => setCouponForm({...couponForm, active: checked})}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleCreateCoupon} className="bg-travel-blue-dark hover:bg-travel-blue-dark/90 w-full sm:w-auto">
              {editMode ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usage Details Modal */}
      <Dialog open={showUsageModal} onOpenChange={setShowUsageModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-travel-orange" />
              <span>Usage Details: {activeCoupon?.code}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-500">Discount Value</p>
              <p className="text-lg font-bold">
                {activeCoupon?.type === 'percentage' 
                  ? `${activeCoupon?.value}% off`
                  : `₹${activeCoupon?.value} off`
                }
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-500">Usage Count</p>
              <p className="text-lg font-bold">
                {activeCoupon?.usedCount}{activeCoupon?.maxUses ? `/${activeCoupon?.maxUses}` : ''}
                {' '}<span className="text-sm font-normal text-gray-500">times</span>
              </p>
            </div>
          </div>
          
          <p className="text-sm font-medium mb-2">Usage History</p>
          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Order Amount</TableHead>
                    <TableHead>Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{detail.userName}</p>
                          <p className="text-xs text-gray-500">{detail.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(detail.usedOn, { addSuffix: true })}
                      </TableCell>
                      <TableCell>₹{detail.orderAmount?.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">
                        -₹{detail.discountAmount?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Updated Redemption History section with person info */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Redemption History</h3>
              
              {/* Add controls for multi-select and delete */}
              {hasRedemptions && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="select-all-redemptions"
                      checked={
                        activeCoupon?.redemptions?.length > 0 && 
                        selectedRedemptions.length === activeCoupon.redemptions.length
                      }
                      onCheckedChange={(checked) => toggleAllRedemptions(!!checked)}
                    />
                    <label 
                      htmlFor="select-all-redemptions" 
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                  
                  {selectedRedemptions.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete ({selectedRedemptions.length})</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {activeCoupon?.redemptions && activeCoupon.redemptions.length > 0 ? (
              <div className="space-y-4">
                {activeCoupon.redemptions.map((redemption, index) => {
                  // Calculate correct original amount based on booking type
                  const correctOriginalAmount = getBookingChargeForType(redemption.bookingType);
                  
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border relative group">
                      {/* Add checkbox for selection */}
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedRedemptions.includes(index)}
                          onCheckedChange={() => toggleRedemptionSelection(index)}
                          className="bg-white border-gray-300"
                        />
                      </div>
                      
                      {/* Add delete button */}
                      <button 
                        onClick={() => handleDeleteRedemption(activeCoupon.id!, index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        title="Delete redemption record"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                      
                      {/* Add padding to accommodate the checkbox */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pl-8">
                        {/* Person information */}
                        {redemption.personName && (
                          <div>
                            <span className="font-medium">Person:</span>
                            <span className="ml-2">{redemption.personName}</span>
                          </div>
                        )}
                        {redemption.personPhone && (
                          <div>
                            <span className="font-medium">Phone:</span>
                            <span className="ml-2">{redemption.personPhone}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Booking Type:</span>
                          <span className="ml-2">{formatBookingTypeDisplay(redemption.bookingType)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Applied On:</span>
                          <span className="ml-2">{formatFirebaseTimestamp(redemption.appliedAt)}</span>
                        </div>

                        {/* Format amounts based on booking type */}
                        <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-gray-200">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-gray-500">Original Amount</p>
                              <p className="font-semibold">₹{correctOriginalAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-red-100">
                              <p className="text-xs text-gray-500">Discount</p>
                              <p className="font-semibold text-red-600">-₹{redemption.discountAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-2 rounded border border-green-100">
                              <p className="text-xs text-gray-500">Final Amount</p>
                              <p className="font-semibold text-green-600">
                                ₹{(correctOriginalAmount - redemption.discountAmount).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">No redemptions yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Confirmation Dialog for redemption deletion */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {bulkDeleteMode ? 'Delete Multiple Redemptions' : 'Delete Redemption Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {bulkDeleteMode ? (
              <p>Are you sure you want to delete {selectedRedemptions.length} redemption records? This action cannot be undone.</p>
            ) : (
              <p>Are you sure you want to delete this redemption record? This action cannot be undone.</p>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteRedemption}
            >
              {bulkDeleteMode ? 'Delete Selected' : 'Delete Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CouponManager;

const formatFirebaseTimestamp = (timestamp: any) => {
  if (!timestamp) return "N/A";
  
  if (timestamp?.toDate) {
    return format(timestamp.toDate(), "dd MMM yyyy, HH:mm");
  }
  
  try {
    return format(new Date(timestamp), "dd MMM yyyy, HH:mm");
  } catch (error) {
    return "Invalid Date";
  }
};
