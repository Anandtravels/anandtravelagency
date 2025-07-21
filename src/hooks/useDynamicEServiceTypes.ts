import { useState, useEffect } from 'react';
import { useEServiceFeeManagement } from '@/hooks/useEServiceFeeManagement';
import { E_SERVICE_TYPES } from '@/types/eservices';

// Static service data that doesn't change - this references the complete types
// from E_SERVICE_TYPES but for backward compatibility
const BASE_SERVICE_TYPES = E_SERVICE_TYPES;

export interface DynamicEServiceType {
  label: string;
  description: string;
  icon: string;
  estimatedTime: string;
  documents: readonly string[];
  fee: string; // This is dynamic from Firebase
  isActive?: boolean; // Service availability status
}

export const useDynamicEServiceTypes = () => {
  const [serviceTypes, setServiceTypes] = useState<Record<string, DynamicEServiceType>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the new fee management hook
  const { 
    feeSettings, 
    loading: feeLoading, 
    getServiceFee, 
    isServiceActive 
  } = useEServiceFeeManagement();

  useEffect(() => {
    if (!feeLoading) {
      try {
        console.log('Building dynamic service types with fees:', Object.keys(feeSettings));
        const dynamicTypes: Record<string, DynamicEServiceType> = {};
        
        Object.entries(E_SERVICE_TYPES).forEach(([key, service]) => {
          const isActive = isServiceActive(key);
          console.log(`Service ${key}: active=${isActive}, fee=${getServiceFee(key)}`);
          
          // Only include active services or show all for admin purposes
          dynamicTypes[key] = {
            ...service,
            fee: getServiceFee(key),
            isActive
          };
        });
        
        setServiceTypes(dynamicTypes);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error loading dynamic service types:', err);
        setError('Failed to load service types. Please refresh the page.');
        setLoading(false);
      }
    }
  }, [feeSettings, feeLoading, getServiceFee, isServiceActive]);

  return {
    serviceTypes,
    loading: loading || feeLoading,
    error,
    // Helper function to get a specific service type
    getServiceType: (key: string) => serviceTypes[key] || null,
    // Helper function to check if fees are loaded
    isLoaded: !loading && !feeLoading && Object.keys(serviceTypes).length > 0,
    // Helper function to get only active services
    getActiveServiceTypes: () => {
      const activeTypes: Record<string, DynamicEServiceType> = {};
      Object.entries(serviceTypes).forEach(([key, service]) => {
        if (service.isActive !== false) { // Include services that are explicitly active or undefined
          activeTypes[key] = service;
        }
      });
      return activeTypes;
    }
  };
};

// For backward compatibility, export the base types without fees
export const getBaseServiceType = (key: string) => {
  return BASE_SERVICE_TYPES[key as keyof typeof BASE_SERVICE_TYPES] || null;
};

export { BASE_SERVICE_TYPES };
