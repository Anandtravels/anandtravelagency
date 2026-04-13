import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  userEmail: string | null | undefined;
  userRole: 'admin' | 'agent';
}

const NotificationBell = ({ userEmail, userRole }: NotificationBellProps) => {
  const { isEnabled, isDenied, isEnabling, isSupported, enableNotifications } = useNotifications({
    userEmail,
    userRole,
  });

  if (!isSupported) return null;

  if (isEnabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
              <BellRing className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium hidden sm:inline">Notifications On</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Push notifications are enabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isDenied) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
              <BellOff className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600 font-medium hidden sm:inline">Blocked</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications blocked. Enable in browser settings.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={enableNotifications}
      disabled={isEnabling}
      className="gap-1.5 text-xs h-8 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
    >
      <Bell className={`h-4 w-4 ${isEnabling ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">{isEnabling ? 'Enabling...' : 'Enable Notifications'}</span>
    </Button>
  );
};

export default NotificationBell;
