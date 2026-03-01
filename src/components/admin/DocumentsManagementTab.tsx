import { useState, useRef } from "react";
import { Plus, Edit, Trash2, FileText, ExternalLink, Eye, AlertCircle, RefreshCw, Upload, Loader2, Image } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useCompanyDocuments } from "@/hooks/useCompanyDocuments";
import { useDocumentUpload, useImageUpload } from "@/hooks/useFileUpload";

interface DocumentsManagementTabProps {
  user: any;
}

const DocumentsManagementTab = ({ user }: DocumentsManagementTabProps) => {
  const { toast } = useToast();
  const { documents, loading, error, addDocument, updateDocument, deleteDocument } = useCompanyDocuments();
  
  // File upload hooks
  const { 
    uploading: docUploading, 
    progress: docProgress, 
    uploadFile: uploadDoc, 
    error: docUploadError, 
    resetState: resetDocUpload 
  } = useDocumentUpload('company-documents/files');
  
  const { 
    uploading: thumbUploading, 
    progress: thumbProgress, 
    uploadFile: uploadThumb, 
    error: thumbUploadError, 
    resetState: resetThumbUpload 
  } = useImageUpload('company-documents/thumbnails');
  
  const docInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    documentUrl: "",
    thumbnailUrl: "",
    order: 1,
    isActive: true
  });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || "",
        description: item.description || "",
        documentUrl: item.documentUrl || "",
        thumbnailUrl: item.thumbnailUrl || "",
        order: item.order || 1,
        isActive: item.isActive !== false
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        documentUrl: "",
        thumbnailUrl: "",
        order: documents.length + 1,
        isActive: true
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      documentUrl: "",
      thumbnailUrl: "",
      order: 1,
      isActive: true
    });
    resetDocUpload();
    resetThumbUpload();
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadDoc(file);
    if (url) {
      setFormData(prev => ({ ...prev, documentUrl: url }));
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } else if (docUploadError) {
      toast({
        title: "Upload Failed",
        description: docUploadError,
        variant: "destructive",
      });
    }
    
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadThumb(file);
    if (url) {
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully",
      });
    } else if (thumbUploadError) {
      toast({
        title: "Upload Failed",
        description: thumbUploadError,
        variant: "destructive",
      });
    }
    
    if (thumbInputRef.current) {
      thumbInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.documentUrl) {
      toast({
        title: "Error",
        description: "Title and document URL are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateDocument(editingItem.id, formData);
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
      } else {
        await addDocument(formData);
        toast({
          title: "Success",
          description: "Document added successfully",
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDocument(id, { isActive: !currentStatus });
      toast({
        title: "Success",
        description: `Document ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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
        <p className="ml-3 text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error Loading Documents</h3>
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

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Documents</h2>
          <p className="text-gray-600 mt-1">Manage company certificates and documents displayed on the About page</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-travel-blue-dark hover:bg-travel-blue-medium">
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No documents yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add company certificates and documents to display on the About page.</p>
          <Button onClick={() => handleOpenModal()} className="mt-4 bg-travel-blue-dark hover:bg-travel-blue-medium">
            <Plus className="mr-2 h-4 w-4" />
            Add First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.isActive ? 'opacity-60' : ''}`}>
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                <Badge 
                  variant={item.isActive ? "default" : "secondary"} 
                  className="absolute top-2 right-2"
                >
                  {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                    />
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={item.documentUrl} target="_blank" rel="noopener noreferrer" title="View Document">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Document' : 'Add Document'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Business Registration Certificate"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the document"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documentUrl">Document File *</Label>
              
              {/* File Upload Option */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={docInputRef}
                  accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleDocUpload}
                  className="hidden"
                  id="doc-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => docInputRef.current?.click()}
                  disabled={docUploading}
                  className="flex-1"
                >
                  {docUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document (PDF/Image)
                    </>
                  )}
                </Button>
              </div>
              
              {/* Upload Progress */}
              {docUploading && (
                <div className="space-y-1">
                  <Progress value={docProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">{docProgress}%</p>
                </div>
              )}
              
              {/* Manual URL Option */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Or enter URL manually:</span>
              </div>
              <Input
                id="documentUrl"
                value={formData.documentUrl}
                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                placeholder="https://example.com/document.pdf"
              />
              <p className="text-xs text-gray-500">Supported: PDF, JPG, PNG, GIF, WebP</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail Image</Label>
              
              {/* Thumbnail Upload Option */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={thumbInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleThumbUpload}
                  className="hidden"
                  id="thumb-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={thumbUploading}
                  className="flex-1"
                >
                  {thumbUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Upload Thumbnail
                    </>
                  )}
                </Button>
              </div>
              
              {/* Thumbnail Upload Progress */}
              {thumbUploading && (
                <div className="space-y-1">
                  <Progress value={thumbProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">{thumbProgress}%</p>
                </div>
              )}
              
              {/* Manual URL Option */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Or enter URL manually:</span>
              </div>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
              {formData.thumbnailUrl && (
                <div className="w-32 h-24 rounded border bg-gray-50 overflow-hidden">
                  <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-gray-500">Optional preview image for the document</p>
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
                {editingItem ? 'Update' : 'Add'} Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsManagementTab;
