import { useState, useEffect } from 'react';
import { Package } from '@/types/package';
import { PackageService } from '@/services/packageService';

interface UseDynamicPackagesReturn {
  packages: Package[];
  loading: boolean;
  error: string | null;
  getDomesticPackages: () => Package[];
  getInternationalPackages: () => Package[];
  getFeaturedPackages: () => Package[];
  getPackageById: (id: string) => Package | undefined;
  refreshPackages: () => Promise<void>;
}

export function useDynamicPackages(): UseDynamicPackagesReturn {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const activePackages = await PackageService.getActivePackages();
      setPackages(activePackages);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      // Set up real-time listener for packages
      unsubscribe = PackageService.subscribeToPackages((allPackages) => {
        // Filter only active packages for the website
        const activePackages = allPackages.filter(pkg => pkg.status === 'active');
        setPackages(activePackages);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error('Error setting up package subscription:', err);
      setError('Failed to connect to real-time updates');
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const getDomesticPackages = (): Package[] => {
    return packages.filter(pkg => pkg.category === 'domestic');
  };

  const getInternationalPackages = (): Package[] => {
    return packages.filter(pkg => pkg.category === 'international');
  };

  const getFeaturedPackages = (): Package[] => {
    return packages.filter(pkg => pkg.featured === true);
  };

  const getPackageById = (id: string): Package | undefined => {
    return packages.find(pkg => pkg.id === id);
  };

  const refreshPackages = async (): Promise<void> => {
    // With real-time listeners, manual refresh is not needed
    // but we can force a reload if needed
    try {
      setLoading(true);
      setError(null);
      const activePackages = await PackageService.getActivePackages();
      setPackages(activePackages);
    } catch (err) {
      console.error('Error refreshing packages:', err);
      setError('Failed to refresh packages');
    } finally {
      setLoading(false);
    }
  };

  return {
    packages,
    loading,
    error,
    getDomesticPackages,
    getInternationalPackages,
    getFeaturedPackages,
    getPackageById,
    refreshPackages
  };
}
