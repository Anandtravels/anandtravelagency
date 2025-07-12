import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SidebarCounts {
  bookings: number;
  packageBookings: number;
  messages: number;
  agents: number;
  pendingBookings: number;
  todayBookings: number;
}

export const useAdminSidebarData = () => {
  const [counts, setCounts] = useState<SidebarCounts>({
    bookings: 0,
    packageBookings: 0,
    messages: 0,
    agents: 0,
    pendingBookings: 0,
    todayBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    setLoading(true);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    try {
      // Bookings count
      const bookingsQuery = query(collection(db, 'bookings'));
      const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
        const bookingDocs = snapshot.docs;
        const totalBookings = bookingDocs.length;
        
        // Count pending bookings
        const pendingBookings = bookingDocs.filter(doc => {
          const data = doc.data();
          return !data.status || data.status === 'pending';
        }).length;

        // Count today's bookings
        const todayBookings = bookingDocs.filter(doc => {
          const data = doc.data();
          const createdAt = data.created_at?.toDate();
          if (!createdAt) return false;
          const bookingDate = createdAt.toISOString().split('T')[0];
          return bookingDate === today;
        }).length;

        setCounts(prev => ({ 
          ...prev, 
          bookings: totalBookings,
          pendingBookings,
          todayBookings
        }));
      }, (error) => {
        console.error('Error fetching bookings:', error);
      });
      unsubscribes.push(unsubBookings);

      // Package bookings count
      const packageBookingsQuery = query(collection(db, 'package_bookings'));
      const unsubPackageBookings = onSnapshot(packageBookingsQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, packageBookings: snapshot.docs.length }));
      }, (error) => {
        console.error('Error fetching package bookings:', error);
      });
      unsubscribes.push(unsubPackageBookings);

      // Messages count
      const messagesQuery = query(collection(db, 'contact_messages'));
      const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, messages: snapshot.docs.length }));
      }, (error) => {
        console.error('Error fetching messages:', error);
      });
      unsubscribes.push(unsubMessages);

      // Agents count
      const agentsQuery = query(collection(db, 'agents'));
      const unsubAgents = onSnapshot(agentsQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, agents: snapshot.docs.length }));
        setLoading(false);
      }, (error) => {
        console.error('Error fetching agents:', error);
        setLoading(false);
      });
      unsubscribes.push(unsubAgents);

    } catch (error) {
      console.error('Error setting up sidebar data listeners:', error);
      setLoading(false);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  return { counts, loading };
};
