import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { trackButtonClick } from '@/services/clickTracker';

interface TrackedButtonProps extends ButtonProps {
  trackingName: string;
  children: React.ReactNode;
}

/**
 * A button component that tracks clicks for analytics.
 * Use this for any button you want to track in the visitor analytics dashboard.
 * 
 * @param trackingName - A descriptive name for the button action (e.g., "Book Now - Hero", "Explore Packages")
 */
export const TrackedButton = React.forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ trackingName, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Track the click
      trackButtonClick(trackingName);
      
      // Call the original onClick handler if provided
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    );
  }
);

TrackedButton.displayName = 'TrackedButton';

/**
 * Higher-order function to wrap any onClick handler with click tracking.
 * Use this for non-Button elements like links, divs, etc.
 * 
 * @param trackingName - A descriptive name for the button action
 * @param originalOnClick - The original onClick handler
 */
export const withClickTracking = <T extends React.MouseEvent>(
  trackingName: string,
  originalOnClick?: (e: T) => void
) => {
  return (e: T) => {
    trackButtonClick(trackingName);
    if (originalOnClick) {
      originalOnClick(e);
    }
  };
};

export default TrackedButton;
