import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  idCard?: string;
  order: number;
  created_at?: any;
  updated_at?: any;
}

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'team_members'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        
        setTeamMembers(members);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching team members:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'team_members'), {
        ...memberData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error adding team member:', err);
      throw err;
    }
  };

  const updateTeamMember = async (id: string, memberData: Partial<TeamMember>) => {
    try {
      const memberRef = doc(db, 'team_members', id);
      await updateDoc(memberRef, {
        ...memberData,
        updated_at: serverTimestamp()
      });
    } catch (err: any) {
      console.error('Error updating team member:', err);
      throw err;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const memberRef = doc(db, 'team_members', id);
      await deleteDoc(memberRef);
    } catch (err: any) {
      console.error('Error deleting team member:', err);
      throw err;
    }
  };

  return {
    teamMembers,
    loading,
    error,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
  };
};
