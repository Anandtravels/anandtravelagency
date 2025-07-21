import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface EServiceFeeSettings {
  id: string;
  serviceType: string;
  fee: string;
  isActive: boolean;
  lastUpdated: any;
  updatedBy: string;
}

export const useEServiceFeeManagement = () => {
  const { toast } = useToast();
  const [feeSettings, setFeeSettings] = useState<Record<string, EServiceFeeSettings>>({});
  const [loading, setLoading] = useState(true);

  // Initialize default fee settings
  const defaultFees = {
    pan_card: {
      id: 'pan_card',
      serviceType: 'pan_card',
      fee: '₹107 (New) / ₹107 (Reissue)',
      isActive: true,
      lastUpdated: null,
      updatedBy: 'system'
    },
    passport: {
      id: 'passport',
      serviceType: 'passport',
      fee: '₹1,500 (36 pages) / ₹2,000 (60 pages)',
      isActive: true,
      lastUpdated: null,
      updatedBy: 'system'
    },
    aadhaar_pvc: {
      id: 'aadhaar_pvc',
      serviceType: 'aadhaar_pvc',
      fee: '₹50',
      isActive: true,
      lastUpdated: null,
      updatedBy: 'system'
    },
    fd_credit_card: {
      id: 'fd_credit_card',
      serviceType: 'fd_credit_card',
      fee: 'As per bank charges',
      isActive: true,
      lastUpdated: null,
      updatedBy: 'system'
    },
    bank_account: {
      id: 'bank_account',
      serviceType: 'bank_account',
      fee: 'As per bank charges',
      isActive: true,
      lastUpdated: null,
      updatedBy: 'system'
    }
  };

  // Initialize default fee settings if they don't exist
  const initializeDefaultFeeSettings = async () => {
    try {
      console.log('Initializing default fee settings...');
      const feeSettingsRef = collection(db, 'eservice_fee_settings');
      
      // Check for each service type and create if it doesn't exist
      for (const [serviceType, defaultSetting] of Object.entries(defaultFees)) {
        const docRef = doc(db, 'eservice_fee_settings', serviceType);
        
        // Use getDoc to check if the document exists
        const docSnapshot = await getDoc(docRef);
        
        if (!docSnapshot.exists()) {
          console.log(`Creating default fee setting for ${serviceType}`);
          await setDoc(docRef, {
            serviceType,
            fee: defaultSetting.fee,
            isActive: true,
            lastUpdated: serverTimestamp(),
            updatedBy: 'system'
          });
        }
      }
    } catch (error) {
      console.error('Error initializing default fee settings:', error);
    }
  };

  // Load fee settings from Firebase
  useEffect(() => {
    console.log('Setting up fee settings listener...');
    
    // First, ensure default settings exist
    initializeDefaultFeeSettings().then(() => {
      const feeSettingsRef = collection(db, 'eservice_fee_settings');
      
      const unsubscribe = onSnapshot(
        feeSettingsRef,
        (snapshot) => {
          console.log('Fee settings snapshot received:', snapshot.docs.length, 'documents');
          const settings: Record<string, EServiceFeeSettings> = {};
          
          snapshot.docs.forEach((doc) => {
            settings[doc.id] = {
              id: doc.id,
              ...doc.data()
            } as EServiceFeeSettings;
          });

          // Merge with defaults for any missing services
          const mergedSettings = { ...defaultFees };
          Object.keys(settings).forEach(key => {
            if (settings[key]) {
              mergedSettings[key] = settings[key];
            }
          });

          setFeeSettings(mergedSettings);
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to fee settings:", error);
          toast({
            title: "Error",
            description: "Failed to load fee settings",
            variant: "destructive",
          });
          // Use defaults on error
          setFeeSettings(defaultFees);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }).catch(error => {
      console.error("Error in fee settings initialization:", error);
      setFeeSettings(defaultFees);
      setLoading(false);
    });
  }, [toast]);

  // Update fee for a specific service
  const updateServiceFee = async (serviceType: string, fee: string, updatedBy: string) => {
    try {
      const docRef = doc(db, 'eservice_fee_settings', serviceType);
      
      await setDoc(docRef, {
        serviceType,
        fee,
        isActive: true,
        lastUpdated: serverTimestamp(),
        updatedBy
      }, { merge: true });

      toast({
        title: "Fee Updated",
        description: `${serviceType.replace('_', ' ').toUpperCase()} fee has been updated successfully`,
      });
    } catch (error) {
      console.error("Error updating fee:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update service fee. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Bulk update all fees
  const updateAllFees = async (fees: Record<string, string>, updatedBy: string) => {
    try {
      const updatePromises = Object.entries(fees).map(([serviceType, fee]) => {
        const docRef = doc(db, 'eservice_fee_settings', serviceType);
        return setDoc(docRef, {
          serviceType,
          fee,
          isActive: true,
          lastUpdated: serverTimestamp(),
          updatedBy
        }, { merge: true });
      });

      await Promise.all(updatePromises);

      toast({
        title: "Fees Updated",
        description: "All service fees have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating fees:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update service fees. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Toggle service active status
  const toggleServiceStatus = async (serviceType: string, isActive: boolean, updatedBy: string) => {
    try {
      const docRef = doc(db, 'eservice_fee_settings', serviceType);
      
      await updateDoc(docRef, {
        isActive,
        lastUpdated: serverTimestamp(),
        updatedBy
      });

      toast({
        title: isActive ? "Service Activated" : "Service Deactivated",
        description: `${serviceType.replace('_', ' ').toUpperCase()} has been ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update service status. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get fee for a specific service
  const getServiceFee = (serviceType: string): string => {
    return feeSettings[serviceType]?.fee || defaultFees[serviceType as keyof typeof defaultFees]?.fee || 'Not set';
  };

  // Check if service is active
  const isServiceActive = (serviceType: string): boolean => {
    return feeSettings[serviceType]?.isActive ?? true;
  };

  return {
    feeSettings,
    loading,
    updateServiceFee,
    updateAllFees,
    toggleServiceStatus,
    getServiceFee,
    isServiceActive
  };
};
