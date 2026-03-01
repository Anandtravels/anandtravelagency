import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CompanyDocument } from '@/types/collaboration';

export const useCompanyDocuments = () => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupListener = async () => {
      try {
        // First try with orderBy - this might fail if index doesn't exist
        const q = query(collection(db, 'company_documents'), orderBy('order', 'asc'));
        
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as CompanyDocument[];
            
            setDocuments(items);
            setError(null);
            setLoading(false);
          },
          async (err) => {
            console.error('Error fetching company documents with orderBy:', err);
            
            // If orderBy fails (index issue), try without ordering
            if (err.code === 'failed-precondition' || err.message.includes('index')) {
              console.log('Falling back to unordered query...');
              try {
                const fallbackQuery = query(collection(db, 'company_documents'));
                unsubscribe = onSnapshot(
                  fallbackQuery,
                  (snapshot) => {
                    const items = snapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data()
                    })) as CompanyDocument[];
                    
                    // Sort client-side
                    items.sort((a, b) => (a.order || 0) - (b.order || 0));
                    
                    setDocuments(items);
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
        console.error('Error setting up company documents listener:', err);
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

  const addDocument = async (data: Omit<CompanyDocument, 'id'>) => {
    try {
      await addDoc(collection(db, 'company_documents'), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const updateDocument = async (id: string, data: Partial<CompanyDocument>) => {
    try {
      const docRef = doc(db, 'company_documents', id);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const docRef = doc(db, 'company_documents', id);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument
  };
};
