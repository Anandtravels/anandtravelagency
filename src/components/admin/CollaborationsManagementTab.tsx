import { useState, useRef } from "react";
import { Plus, Edit, Trash2, ExternalLink, Building2, Plane, AlertCircle, RefreshCw, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollaborations } from "@/hooks/useCollaborations";
import { useImageUpload } from "@/hooks/useFileUpload";
import type { CollaborationType } from "@/types/collaboration";

interface CollaborationsManagementTabProps {
  user: any;
}

const CollaborationsManagementTab = ({ user }: CollaborationsManagementTabProps) => {
  const { toast } = useToast();
  const { collaborations, loading, error, addCollaboration, updateCollaboration, deleteCollaboration } = useCollaborations();
  const { uploading: logoUploading, progress: logoProgress, uploadFile: uploadLogo, error: logoUploadError, resetState: resetLogoUpload } = useImageUpload('collaborations/logos');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "company" as CollaborationType,
    description: "",
    logo: "",
    website: "",
    order: 1,
    isActive: true
  });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || "",
        type: item.type || "company",
        description: item.description || "",
        logo: item.logo || "",
        website: item.website || "",
        order: item.order || 1,
        isActive: item.isActive !== false
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "company",
        description: "",
        logo: "",
        website: "",
        order: collaborations.length + 1,
        isActive: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      type: "company",
      description: "",
      logo: "",
      website: "",
      order: 1,
      isActive: true
    });
    resetLogoUpload();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadLogo(file);
    if (url) {
      setFormData(prev => ({ ...prev, logo: url }));
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } else if (logoUploadError) {
      toast({
        title: "Upload Failed",
        description: logoUploadError,
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.logo) {
      toast({
        title: "Error",
        description: "Name and logo are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateCollaboration(editingItem.id, formData);
        toast({
          title: "Success",
          description: "Collaboration updated successfully",
        });
      } else {
        await addCollaboration(formData);
        toast({
          title: "Success",
          description: "Collaboration added successfully",
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save collaboration",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collaboration?")) {
      try {
        await deleteCollaboration(id);
        toast({
          title: "Success",
          description: "Collaboration deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete collaboration",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateCollaboration(id, { isActive: !currentStatus });
      toast({
        title: "Success",
        description: `Collaboration ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
        <p className="ml-3 text-gray-600">Loading collaborations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error Loading Collaborations</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">{error}</p>
          <p className="text-xs text-gray-400 mt-2">Check browser console for more details</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload Page
        </Button>
      </div>
    );
  }

  const companyCollabs = collaborations.filter(c => c.type === 'company');
  const travelAgencyCollabs = collaborations.filter(c => c.type === 'travel_agency');

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collaborations Management</h2>
          <p className="text-gray-600 mt-1">Manage partner companies and travel agencies displayed on the About page</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-travel-blue-dark hover:bg-travel-blue-medium">
          <Plus className="mr-2 h-4 w-4" />
          Add Collaboration
        </Button>
      </div>

      {/* Companies Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Partners ({companyCollabs.length})
        </h3>
        {companyCollabs.length === 0 ? (
          <p className="text-gray-500 text-sm">No company partnerships added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyCollabs.map((item) => (
              <Card key={item.id} className={`p-4 ${!item.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.logo || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                    />
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex gap-2">
                    {item.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Travel Agencies Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Travel Agency Partners ({travelAgencyCollabs.length})
        </h3>
        {travelAgencyCollabs.length === 0 ? (
          <p className="text-gray-500 text-sm">No travel agency partnerships added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelAgencyCollabs.map((item) => (
              <Card key={item.id} className={`p-4 ${!item.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.logo || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                    />
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex gap-2">
                    {item.website && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Collaboration' : 'Add Collaboration'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Partner name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: CollaborationType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="travel_agency">Travel Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo *</Label>
              
              {/* File Upload Option */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="flex-1"
                >
                  {logoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload from Device
                    </>
                  )}
                </Button>
              </div>
              
              {/* Upload Progress */}
              {logoUploading && (
                <div className="space-y-1">
                  <Progress value={logoProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">{logoProgress}%</p>
                </div>
              )}
              
              {/* Manual URL Option */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Or enter URL:</span>
              </div>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              
              {/* Preview */}
              {formData.logo && (
                <div className="w-20 h-20 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img src={formData.logo} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the partnership"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active (visible on website)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" className="bg-travel-blue-dark hover:bg-travel-blue-medium">
                {editingItem ? 'Update' : 'Add'} Collaboration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborationsManagementTab;
