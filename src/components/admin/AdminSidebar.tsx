import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Package, 
  MessageSquare, 
  UserCheck, 
  Ticket, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAdminSidebarData } from '@/hooks/useAdminSidebarData';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
  userEmail: string | null | undefined;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string | number;
  isExternal?: boolean;
}

const AdminSidebar = ({ isCollapsed, onToggleCollapse, onSignOut, userEmail }: AdminSidebarProps) => {
  const location = useLocation();
  const { counts, loading: countsLoading } = useAdminSidebarData();

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      title: 'Bookings',
      href: '/admin#bookings',
      icon: Calendar,
      description: 'Manage Bookings',
      badge: counts.bookings > 0 ? counts.bookings : undefined
    },
    {
      title: 'Package Bookings',
      href: '/admin#packages',
      icon: Package,
      description: 'Tour Packages',
      badge: counts.packageBookings > 0 ? counts.packageBookings : undefined
    },
    {
      title: 'Messages',
      href: '/admin#messages',
      icon: MessageSquare,
      description: 'Customer Messages',
      badge: counts.messages > 0 ? counts.messages : undefined
    },
    {
      title: 'Agents',
      href: '/admin#agents',
      icon: UserCheck,
      description: 'Manage Agents',
      badge: counts.agents > 0 ? counts.agents : undefined
    },
    {
      title: 'Coupons',
      href: '/admin/coupons',
      icon: Ticket,
      description: 'Discount Codes'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' && (!location.hash || location.hash === '');
    }
    if (href.includes('#')) {
      return location.hash === `#${href.split('#')[1]}` && location.pathname === '/admin';
    }
    return location.pathname === href;
  };

  const getCurrentSectionTitle = () => {
    const hash = location.hash.replace('#', '');
    const currentItem = menuItems.find(item => {
      if (item.href === '/admin' && !hash) return true;
      if (item.href.includes('#') && item.href.split('#')[1] === hash) return true;
      if (item.href === location.pathname) return true;
      return false;
    });
    return currentItem?.title || 'Dashboard';
  };

  const handleMenuClick = (href: string) => {
    if (href.includes('#')) {
      const [path, hash] = href.split('#');
      if (path === '/admin' && location.pathname === '/admin') {
        // Already on admin page, just scroll to section
        window.location.hash = hash;
      }
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg flex flex-col h-full relative"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500 truncate max-w-32">{userEmail}</p>
              </div>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Current Section Indicator */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 px-2 py-1 bg-blue-50 rounded-md border border-blue-200"
          >
            <p className="text-xs font-medium text-blue-700">
              Current: {getCurrentSectionTitle()}
            </p>
          </motion.div>
        )}
      </div>



      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => handleMenuClick(item.href)}
                  className={cn(
                    'group relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600'
                  )}
                  title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  
                  {/* Badge for collapsed state */}
                  {isCollapsed && item.badge && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                  
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3 flex-1 flex items-center justify-between"
                    >
                      <div>
                        <span className="block">{item.title}</span>
                        {item.description && (
                          <span className="text-xs text-gray-500 block">
                            {item.description}
                          </span>
                        )}
                      </div>
                      
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs px-2 py-0.5 font-medium',
                            active 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                          )}
                        >
                          {typeof item.badge === 'number' && item.badge > 999 
                            ? `${Math.floor(item.badge / 1000)}k` 
                            : item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={onSignOut}
          className={cn(
            'w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50',
            isCollapsed ? 'px-0' : 'px-3'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;
