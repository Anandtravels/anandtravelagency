import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  onForegroundMessage,
  isNotificationPermissionGranted,
  isNotificationPermissionDenied,
} from '@/lib/fcm';
import { useToast } from '@/hooks/use-toast';

interface UseNotificationsOptions {
  userEmail: string | null | undefined;
  userRole: 'admin' | 'agent';
}

export const useNotifications = ({ userEmail, userRole }: UseNotificationsOptions) => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isEnabling, setIsEnabling] = useState(false);

  // Check initial permission status
  useEffect(() => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }
    setPermissionStatus(Notification.permission);
  }, []);

  // Set up foreground message listener
  useEffect(() => {
    if (!userEmail || permissionStatus !== 'granted') return;

    onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'New Notification';
      const body = payload.notification?.body || '';

      // Show in-app toast
      toast({
        title: `🔔 ${title}`,
        description: body,
        duration: 8000,
      });

      // Also show a browser notification for foreground
      if (document.hidden) {
        new Notification(title, {
          body,
          icon: '/logo.png',
          tag: payload.data?.type || 'general',
        });
      }
    });
  }, [userEmail, permissionStatus, toast]);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    if (!userEmail) return;

    setIsEnabling(true);
    try {
      const token = await requestNotificationPermission(userEmail, userRole);
      if (token) {
        setPermissionStatus('granted');
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications for new bookings.',
        });
      } else {
        setPermissionStatus(Notification.permission);
        if (Notification.permission === 'denied') {
          toast({
            title: 'Notifications Blocked',
            description: 'Please enable notifications in your browser settings.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnabling(false);
    }
  }, [userEmail, userRole, toast]);

  return {
    permissionStatus,
    isEnabling,
    enableNotifications,
    isSupported: permissionStatus !== 'unsupported',
    isEnabled: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied',
  };
};
