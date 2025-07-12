import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useAdminNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    // Get tab from URL hash
    const hash = location.hash.replace('#', '');
    if (hash && ['bookings', 'packages', 'messages', 'agents'].includes(hash)) {
      setActiveTab(hash);
    } else {
      // When on /admin without hash, show dashboard instead of redirecting
      setActiveTab('');
    }
  }, [location.hash, location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    if (location.pathname === '/admin') {
      navigate(`/admin#${tab}`, { replace: true });
    }
  };

  return { activeTab, handleTabChange };
};
