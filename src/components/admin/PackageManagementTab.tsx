import { useState } from "react";
import { Package, PackageFormData } from "@/types/package";
import { usePackageManagement } from "@/hooks/usePackageManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Trash2, Plus, MapPin, Calendar, Users, Star, Package2 } from "lucide-react";
import PackageForm from "@/components/admin/PackageForm";

interface PackageManagementTabProps {
  user: any;
}

const PackageManagementTab = ({ user }: PackageManagementTabProps) => {
  const { 
    packages, 
    loading, 
    creating,
    updating,
    deleting,
    createPackage, 
    updatePackage, 
    deletePackage,
    getActivePackages,
    getPackagesByCategory
  } = usePackageManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const handleCreatePackage = async (data: PackageFormData) => {
    const success = await createPackage(data, user?.email || 'admin@anandtravels.com');
    if (success) {
      setShowCreateModal(false);
    }
  };

  const handleEditPackage = async (data: PackageFormData) => {
    if (!selectedPackage) return;
    
    const success = await updatePackage(selectedPackage.id, data, user?.email || 'admin@anandtravels.com');
    if (success) {
      setShowEditModal(false);
      setSelectedPackage(null);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    await deletePackage(packageId);
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEditModal(true);
  };

  const getFilteredPackages = () => {
    switch (activeTab) {
      case "domestic":
        return getPackagesByCategory("domestic");
      case "international":
        return getPackagesByCategory("international");
      case "active":
        return getActivePackages();
      case "inactive":
        return packages.filter(pkg => pkg.status === 'inactive');
      default:
        return packages;
    }
  };

  const filteredPackages = getFilteredPackages();

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-travel-blue-dark">Package Management</h2>
          <p className="text-gray-600">Create and manage tour packages</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-travel-blue-dark hover:bg-travel-blue-medium">
              <Plus className="w-4 h-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
            </DialogHeader>
            <PackageForm
              onSubmit={handleCreatePackage}
              onCancel={() => setShowCreateModal(false)}
              loading={creating}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-travel-blue-dark">{packages.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {packages.filter(pkg => pkg.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Domestic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {packages.filter(pkg => pkg.category === 'domestic').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">International</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {packages.filter(pkg => pkg.category === 'international').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="domestic">Domestic</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Packages Grid */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden rounded-t-lg">
                <img
                  src={pkg.images[0] || '/placeholder.svg'}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-travel-blue-dark line-clamp-1">
                    {pkg.title}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                      {pkg.status}
                    </Badge>
                    {pkg.featured && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{pkg.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{pkg.days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Max {pkg.maxPeople} people</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <p className="text-xl font-bold text-travel-blue-dark">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(pkg)}
                      disabled={updating}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePackage(pkg.id)}
                      disabled={deleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Package2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No packages found</p>
              <p className="text-sm">
                {activeTab === "all" 
                  ? "Get started by creating your first package" 
                  : `No ${activeTab} packages available`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <PackageForm
              initialData={selectedPackage}
              onSubmit={handleEditPackage}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedPackage(null);
              }}
              loading={updating}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagementTab;
