import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { adminDataService } from '@/services/adminDataService';

interface SidebarCounts {
  bookings: number;
  packageBookings: number;
  hotelBookings: number;
  messages: number;
  agents: number;
  eservices: number;
  visaApplications: number;
  pendingBookings: number;
  todayBookings: number;
  advanceBookings: number;
  whatsappUnread: number;
}

export const useAdminSidebarData = () => {
  const { user, isAdmin } = useAuth();
  const [counts, setCounts] = useState<SidebarCounts>({
    bookings: 0,
    packageBookings: 0,
    hotelBookings: 0,
    messages: 0,
    agents: 0,
    eservices: 0,
    visaApplications: 0,
    pendingBookings: 0,
    todayBookings: 0,
    advanceBookings: 0,
    whatsappUnread: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    // Initialize the admin data service
    adminDataService.initialize(user);

    // Subscribe to data updates
    const unsubscribe = adminDataService.subscribe((newCounts) => {
      setCounts(newCounts);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user, isAdmin]);

  return { counts, loading };
};
