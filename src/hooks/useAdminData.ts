import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Agent, Booking } from '@/types/admin';

export const useAdminData = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('created_at', 'desc'));
    const bookingsUnsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const bookingsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          setAdminNotes((prev) => ({ ...prev, [doc.id]: data.admin_notes || '' }));
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate() || new Date(),
          } as Booking;
        });
        setBookings(bookingsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    const agentsQuery = query(collection(db, 'agents'), orderBy('created_at', 'desc'));
    const agentsUnsubscribe = onSnapshot(
      agentsQuery,
      (snapshot) => {
        const agentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Agent));
        setAgents(agentsData);
      },
      (error) => {
        console.error("Error listening to agents:", error);
        toast({
          title: "Error",
          description: "Failed to load agents data",
          variant: "destructive",
        });
      }
    );

    return () => {
      bookingsUnsubscribe();
      agentsUnsubscribe();
    };
  }, [toast]);

  return { bookings, agents, loading, adminNotes, setAdminNotes };
};
