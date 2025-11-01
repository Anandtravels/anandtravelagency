import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Bill } from '@/types/upi';
import { useToast } from '@/hooks/use-toast';

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const billsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bill[];
        
        setBills(billsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching bills:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bills',
          variant: 'destructive'
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const deleteBill = async (billId: string) => {
    setDeleting(true);
    try {
      const billRef = doc(db, 'bills', billId);
      await deleteDoc(billRef);
      
      toast({
        title: 'Success',
        description: 'Bill deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bill',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  const deleteBulkBills = async (billIds: string[]) => {
    setDeleting(true);
    try {
      // Delete all bills in parallel
      await Promise.all(
        billIds.map(billId => {
          const billRef = doc(db, 'bills', billId);
          return deleteDoc(billRef);
        })
      );
      
      toast({
        title: 'Success',
        description: `${billIds.length} bill${billIds.length > 1 ? 's' : ''} deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bills',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { bills, loading, deleting, deleteBill, deleteBulkBills };
};
