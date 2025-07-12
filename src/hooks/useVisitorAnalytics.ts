import { useState, useEffect } from 'react';
import VisitorTracker, { VisitorStats } from '@/services/visitorTracker';

export const useVisitorAnalytics = () => {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    liveUsers: 0,
    sessionsToday: 0,
    sessionsThisWeek: 0,
    sessionsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = VisitorTracker.getLiveVisitorStats((newStats) => {
        setStats(newStats);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error('Error setting up visitor analytics:', err);
      setError('Failed to load visitor analytics');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { stats, loading, error };
};
