import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Bill } from '@/types/upi';
import { useToast } from '@/hooks/use-toast';

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
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

  return { bills, loading };
};
