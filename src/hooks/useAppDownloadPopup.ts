import { useState, useEffect } from 'react';

interface UseAppDownloadPopupProps {
  delay?: number; // Delay in milliseconds before showing popup
  storageKey?: string; // Key to store popup state in localStorage
}

export const useAppDownloadPopup = ({
  delay = 5000, // Default 5 seconds
  storageKey = 'app-download-popup-dismissed'
}: UseAppDownloadPopupProps = {}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupPermanentlyDismissed, setIsPopupPermanentlyDismissed] = useState(false);

  useEffect(() => {
    // Check if user has permanently dismissed the popup
    const hasBeenPermanentlyDismissed = localStorage.getItem(storageKey);
    
    if (hasBeenPermanentlyDismissed) {
      setIsPopupPermanentlyDismissed(true);
      return; // Don't show popup if user has permanently dismissed it
    }

    // Set a timer to show the popup after the specified delay
    const timer = setTimeout(() => {
      setIsPopupOpen(true);
    }, delay);

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, [delay, storageKey]);

  const closePopup = () => {
    setIsPopupOpen(false);
    // Don't mark as dismissed - popup will show again on next visit
  };

  const dismissPopupPermanently = () => {
    setIsPopupOpen(false);
    setIsPopupPermanentlyDismissed(true);
    // Mark popup as permanently dismissed
    localStorage.setItem(storageKey, 'true');
  };

  const resetPopupState = () => {
    localStorage.removeItem(storageKey);
    setIsPopupOpen(false);
    setIsPopupPermanentlyDismissed(false);
  };

  return {
    isPopupOpen,
    closePopup,
    dismissPopupPermanently,
    resetPopupState // Useful for testing or admin purposes
  };
};
