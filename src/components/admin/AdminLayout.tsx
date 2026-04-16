import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminSidebar from './AdminSidebar';

const useISTClock = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
      });
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setTime(`${ist}.${ms} IST`);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);
  return time;
};

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail: string | null | undefined;
  onSignOut: () => void;
}

const AdminLayout = ({ children, userEmail, onSignOut }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const istTime = useISTClock();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          onSignOut={onSignOut}
          userEmail={userEmail}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <AdminSidebar
                isCollapsed={false}
                onToggleCollapse={toggleMobileMenu}
                onSignOut={onSignOut}
                userEmail={userEmail}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 truncate max-w-32">{userEmail}</p>
              </div>
            </div>

            <a
              href="/booking"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Go to booking page"
            >
              ATA
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-1.5 mt-2 px-1">
            <Clock className="w-3.5 h-3.5 text-travel-blue-dark flex-shrink-0" />
            <span className="text-xs font-mono text-travel-blue-dark font-medium">{istTime}</span>
          </div>
        </div>

        {/* Desktop Top Bar with IST Clock */}
        <div className="hidden lg:flex items-center justify-end bg-white border-b border-gray-200 px-6 py-2 flex-shrink-0 gap-3">
          <a
            href="/booking"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Go to booking page"
          >
            ATA
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-travel-blue-dark" />
            <span className="text-xs font-mono text-travel-blue-dark font-medium">{istTime}</span>
          </div>
        </div>

        {/* Content Area */}
        <main 
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            'lg:p-6 p-4'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
