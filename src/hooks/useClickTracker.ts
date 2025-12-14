import { useState, useEffect, useCallback } from 'react';
import { trackButtonClick, getLiveClickStats, ClickStats } from '@/services/clickTracker';

// Hook to track button clicks
export const useClickTracker = () => {
  const trackClick = useCallback((buttonName: string) => {
    trackButtonClick(buttonName);
  }, []);

  return { trackClick };
};

// Hook to get click analytics for admin dashboard
export const useClickAnalytics = () => {
  const [stats, setStats] = useState<ClickStats>({
    todayClicks: 0,
    weekClicks: 0,
    monthClicks: 0,
    totalClicks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = getLiveClickStats((newStats) => {
        setStats(newStats);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error('Error setting up click analytics:', err);
      setError('Failed to load click analytics');
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
