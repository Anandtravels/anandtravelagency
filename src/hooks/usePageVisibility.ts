import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface PageVisibilitySettings {
  eservices: boolean;
  hotels: boolean;
  visaServices: boolean;
  packages: boolean;
  careers: boolean;
  lastUpdated?: any;
  updatedBy?: string;
}

const DEFAULT_VISIBILITY: PageVisibilitySettings = {
  eservices: false,
  hotels: true,
  visaServices: true,
  packages: true,
  careers: false
};

export const usePageVisibility = () => {
  const { toast } = useToast();
  const [visibility, setVisibility] = useState<PageVisibilitySettings>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  // Load page visibility settings from Firebase
  useEffect(() => {
    const docRef = doc(db, 'settings', 'page_visibility');
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as PageVisibilitySettings;
          setVisibility({
            eservices: data.eservices ?? false,
            hotels: data.hotels ?? true,
            visaServices: data.visaServices ?? true,
            packages: data.packages ?? true,
            careers: data.careers ?? false,
            lastUpdated: data.lastUpdated,
            updatedBy: data.updatedBy
          });
        } else {
          // Create default settings if not exist
          setDoc(docRef, {
            ...DEFAULT_VISIBILITY,
            lastUpdated: serverTimestamp(),
            updatedBy: 'system'
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to page visibility settings:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update page visibility
  const updatePageVisibility = async (
    page: keyof PageVisibilitySettings, 
    isVisible: boolean, 
    updatedBy: string
  ) => {
    try {
      const docRef = doc(db, 'settings', 'page_visibility');
      await setDoc(docRef, {
        ...visibility,
        [page]: isVisible,
        lastUpdated: serverTimestamp(),
        updatedBy
      }, { merge: true });

      toast({
        title: 'Settings Updated',
        description: `${page.charAt(0).toUpperCase() + page.slice(1)} page visibility has been ${isVisible ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error("Error updating page visibility:", error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update page visibility. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Check if a specific page is visible
  const isPageVisible = (page: keyof PageVisibilitySettings): boolean => {
    if (loading) return false; // Don't show pages until settings are loaded
    return visibility[page] ?? false;
  };

  return {
    visibility,
    loading,
    updatePageVisibility,
    isPageVisible
  };
};
