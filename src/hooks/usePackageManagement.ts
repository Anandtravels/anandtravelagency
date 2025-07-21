import { useState, useEffect } from 'react';
import { Package, PackageFormData } from '@/types/package';
import { PackageService } from '@/services/packageService';
import { useToast } from '@/hooks/use-toast';

export const usePackageManagement = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = PackageService.subscribeToPackages((packages) => {
      setPackages(packages);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createPackage = async (data: PackageFormData, userEmail: string): Promise<boolean> => {
    setCreating(true);
    try {
      await PackageService.createPackage(data, userEmail);
      toast({
        title: "Package Created",
        description: "Package has been created successfully",
      });
      return true;
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create package. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setCreating(false);
    }
  };

  const updatePackage = async (id: string, data: Partial<PackageFormData>, userEmail: string): Promise<boolean> => {
    setUpdating(true);
    try {
      await PackageService.updatePackage(id, data, userEmail);
      toast({
        title: "Package Updated",
        description: "Package has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update package. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deletePackage = async (id: string): Promise<boolean> => {
    if (!window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return false;
    }

    setDeleting(true);
    try {
      await PackageService.deletePackage(id);
      toast({
        title: "Package Deleted",
        description: "Package has been deleted successfully",
      });
      return true;
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete package. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const getActivePackages = (): Package[] => {
    return packages.filter(pkg => pkg.status === 'active');
  };

  const getPackagesByCategory = (category: 'domestic' | 'international'): Package[] => {
    return packages.filter(pkg => pkg.category === category && pkg.status === 'active');
  };

  const getFeaturedPackages = (): Package[] => {
    return packages.filter(pkg => pkg.featured && pkg.status === 'active');
  };

  return {
    packages,
    loading,
    creating,
    updating,
    deleting,
    createPackage,
    updatePackage,
    deletePackage,
    getActivePackages,
    getPackagesByCategory,
    getFeaturedPackages
  };
};
