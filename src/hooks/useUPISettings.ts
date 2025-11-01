import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UPISettings } from '@/types/upi';
import { useToast } from '@/hooks/use-toast';

export const useUPISettings = () => {
  const [settings, setSettings] = useState<UPISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'admin_settings', 'upi_settings');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings({ id: docSnap.id, ...docSnap.data() } as UPISettings);
      } else {
        // Set default values
        setSettings({
          id: 'upi_settings',
          upiId: '8985816481@paytm',
          accountHolderName: 'Pinisetty Naga Satya Surya Shiva Anand',
          paymentPhone: '8985816481',
          updatedAt: null,
          updatedBy: ''
        });
      }
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load UPI settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (upiId: string, accountHolderName: string, paymentPhone: string, userEmail: string, qrCodeDataUrl?: string) => {
    try {
      const docRef = doc(db, 'admin_settings', 'upi_settings');
      const settingsData: any = {
        upiId,
        accountHolderName,
        paymentPhone,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail
      };

      // Add QR code if provided
      if (qrCodeDataUrl) {
        settingsData.qrCodeDataUrl = qrCodeDataUrl;
      }

      await setDoc(docRef, settingsData);
      
      setSettings({
        id: 'upi_settings',
        ...settingsData,
        updatedAt: new Date()
      });

      toast({
        title: 'Success',
        description: 'UPI settings saved successfully'
      });

      return true;
    } catch (error) {
      console.error('Error saving UPI settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save UPI settings',
        variant: 'destructive'
      });
      return false;
    }
  };

  return { settings, loading, saveSettings, refreshSettings: fetchSettings };
};
