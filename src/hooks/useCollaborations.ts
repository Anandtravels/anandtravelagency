import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Collaboration } from '@/types/collaboration';

export const useCollaborations = () => {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupListener = async () => {
      try {
        // First try with orderBy - this might fail if index doesn't exist
        const q = query(collection(db, 'collaborations'), orderBy('order', 'asc'));
        
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Collaboration[];
            
            setCollaborations(items);
            setError(null);
            setLoading(false);
          },
          async (err) => {
            console.error('Error fetching collaborations with orderBy:', err);
            
            // If orderBy fails (index issue), try without ordering
            if (err.code === 'failed-precondition' || err.message.includes('index')) {
              console.log('Falling back to unordered query...');
              try {
                const fallbackQuery = query(collection(db, 'collaborations'));
                unsubscribe = onSnapshot(
                  fallbackQuery,
                  (snapshot) => {
                    const items = snapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data()
                    })) as Collaboration[];
                    
                    // Sort client-side
                    items.sort((a, b) => (a.order || 0) - (b.order || 0));
                    
                    setCollaborations(items);
                    setError(null);
                    setLoading(false);
                  },
                  (fallbackErr) => {
                    console.error('Fallback query also failed:', fallbackErr);
                    setError(fallbackErr.message);
                    setLoading(false);
                  }
                );
              } catch (fallbackErr: any) {
                setError(fallbackErr.message);
                setLoading(false);
              }
            } else {
              setError(err.message);
              setLoading(false);
            }
          }
        );
      } catch (err: any) {
        console.error('Error setting up collaborations listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const addCollaboration = async (data: Omit<Collaboration, 'id'>) => {
    try {
      await addDoc(collection(db, 'collaborations'), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error adding collaboration:', err);
      throw err;
    }
  };

  const updateCollaboration = async (id: string, data: Partial<Collaboration>) => {
    try {
      const docRef = doc(db, 'collaborations', id);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error updating collaboration:', err);
      throw err;
    }
  };

  const deleteCollaboration = async (id: string) => {
    try {
      const docRef = doc(db, 'collaborations', id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Error deleting collaboration:', err);
      throw err;
    }
  };

  return {
    collaborations,
    loading,
    error,
    addCollaboration,
    updateCollaboration,
    deleteCollaboration
  };
};
