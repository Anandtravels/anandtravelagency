import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Package, 
  MessageSquare, 
  MessageCircle,
  UserCheck, 
  Ticket, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  FileCheck,
  CreditCard,
  Receipt,
  ClipboardList,
  Briefcase,
  Handshake,
  FolderOpen,
  Wallet,
  GripVertical,
  RotateCcw
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  children?: MenuItem[];
  isOpen?: boolean;
}

const MENU_ORDER_KEY = 'admin-sidebar-menu-order';

const SortableMenuItemWrapper = ({ id, children, isCollapsed }: { id: string; children: React.ReactNode; isCollapsed: boolean }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn('relative group/sortable', isDragging && 'opacity-50 bg-blue-50 rounded-lg shadow-lg')}>
      {!isCollapsed && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-0.5 top-3 z-10 opacity-0 group-hover/sortable:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-200"
          title="Drag to reorder"
          type="button"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
      {children}
    </div>
  );
};

const AdminSidebar = ({ isCollapsed, onToggleCollapse, onSignOut, userEmail }: AdminSidebarProps) => {
  const location = useLocation();
  const { counts, loading: countsLoading } = useAdminSidebarData();

  const [menuState, setMenuState] = useState<Record<string, boolean>>({});

  const toggleDropdown = (title: string) => {
    setMenuState(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

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
      title: 'Packages',
      href: '#',
      icon: Package,
      description: 'Package Management',
      isOpen: menuState['Packages'] || false,
      children: [
        {
          title: 'Package Bookings',
          href: '/admin#package-bookings',
          icon: Ticket,
          description: 'Package Bookings',
          badge: counts.packageBookings > 0 ? counts.packageBookings : undefined
        },
        {
          title: 'Package Management',
          href: '/admin#package-management',
          icon: Package,
          description: 'Manage Packages',
        }
      ]
    },
    {
      title: 'Hotels',
      href: '#',
      icon: Home,
      description: 'Hotel Management',
      isOpen: menuState['Hotels'] || false,
      children: [
        {
          title: 'Hotel Bookings',
          href: '/admin#hotel-bookings',
          icon: Calendar,
          description: 'Hotel Bookings',
          badge: counts.hotelBookings > 0 ? counts.hotelBookings : undefined
        },
        {
          title: 'Hotel Management',
          href: '/admin#hotel-management',
          icon: Home,
          description: 'Manage Hotels',
        },
        {
          title: 'Hotel Agents',
          href: '/admin#hotel-agents',
          icon: UserCheck,
          description: 'Hotel Agents',
        }
      ]
    },
    {
      title: 'Messages',
      href: '/admin#messages',
      icon: MessageSquare,
      description: 'Customer Messages',
      badge: counts.messages > 0 ? counts.messages : undefined
    },
    {
      title: 'WhatsApp',
      href: '/admin#whatsapp',
      icon: MessageCircle,
      description: 'WhatsApp Business',
      badge: counts.whatsappUnread > 0 ? counts.whatsappUnread : undefined
    },
    {
      title: 'E-Services',
      href: '/admin#eservices',
      icon: FileText,
      description: 'E-Service Requests',
      badge: counts.eservices > 0 ? counts.eservices : undefined
    },
    {
      title: 'Visa Applications',
      href: '/admin#visa-applications',
      icon: FileCheck,
      description: 'Visa Service Requests',
      badge: counts.visaApplications > 0 ? counts.visaApplications : undefined
    },
    {
      title: 'Agents',
      href: '/admin#agents',
      icon: UserCheck,
      description: 'Manage Agents',
      badge: counts.agents > 0 ? counts.agents : undefined
    },
    {
      title: 'Agent Tasks',
      href: '/admin#agent-tasks',
      icon: ClipboardList,
      description: 'Task & Rewards'
    },
    {
      title: 'Agent Wallets',
      href: '/admin#agent-wallets',
      icon: Wallet,
      description: 'Daily Payments'
    },
    {
      title: 'Team Management',
      href: '/admin#team-management',
      icon: Users,
      description: 'Manage Team Members'
    },
    {
      title: 'UPI Settings',
      href: '/admin#upi-settings',
      icon: CreditCard,
      description: 'Payment Configuration'
    },
    {
      title: 'Bills',
      href: '/admin#bills',
      icon: Receipt,
      description: 'Invoice Management'
    },
    {
      title: 'Careers',
      href: '/admin#careers',
      icon: Briefcase,
      description: 'Jobs & Applications'
    },
    {
      title: 'Collaborations',
      href: '/admin#collaborations',
      icon: Handshake,
      description: 'Partner Companies'
    },
    {
      title: 'Documents',
      href: '/admin#company-documents',
      icon: FolderOpen,
      description: 'Company Documents'
    },
    {
      title: 'Coupons',
      href: '/admin/coupons',
      icon: Ticket,
      description: 'Discount Codes'
    }
  ];

  // --- Drag-and-drop menu reordering ---
  const [menuOrder, setMenuOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_ORDER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getOrderedMenuItems = () => {
    if (menuOrder.length === 0) return menuItems;
    const ordered: MenuItem[] = [];
    const remaining = [...menuItems];
    for (const title of menuOrder) {
      const idx = remaining.findIndex(item => item.title === title);
      if (idx !== -1) {
        ordered.push(remaining[idx]);
        remaining.splice(idx, 1);
      }
    }
    return [...ordered, ...remaining];
  };

  const orderedMenuItems = getOrderedMenuItems();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedMenuItems.findIndex(item => item.title === active.id);
    const newIndex = orderedMenuItems.findIndex(item => item.title === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(
      orderedMenuItems.map(item => item.title),
      oldIndex,
      newIndex
    );
    setMenuOrder(newOrder);
    localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(newOrder));
  };

  const resetMenuOrder = () => {
    setMenuOrder([]);
    localStorage.removeItem(MENU_ORDER_KEY);
  };

  const isCustomOrder = menuOrder.length > 0;

  const isActive = (href: string) => {
    if (href === '#') return false; // Parent dropdown items are never "active"
    if (href === '/admin') {
      return location.pathname === '/admin' && (!location.hash || location.hash === '');
    }
    if (href.includes('#')) {
      return location.hash === `#${href.split('#')[1]}` && location.pathname === '/admin';
    }
    return location.pathname === href;
  };

  const hasActiveChild = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.href));
  };

  const getCurrentSectionTitle = () => {
    const hash = location.hash.replace('#', '');
    
    // First check top-level items
    const currentItem = menuItems.find(item => {
      if (item.href === '/admin' && !hash) return true;
      if (item.href.includes('#') && item.href.split('#')[1] === hash) return true;
      if (item.href === location.pathname) return true;
      return false;
    });
    
    if (currentItem) return currentItem.title;
    
    // Then check children items
    for (const item of menuItems) {
      if (item.children) {
        const activeChild = item.children.find(child => {
          if (child.href.includes('#') && child.href.split('#')[1] === hash) return true;
          if (child.href === location.pathname) return true;
          return false;
        });
        
        if (activeChild) return activeChild.title;
      }
    }
    
    return 'Dashboard';
  };

  // Auto-open dropdown when a child is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => isActive(child.href))) {
        setMenuState(prev => ({
          ...prev,
          [item.title]: true
        }));
      }
    });
  }, [location.hash, location.pathname]);

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
        {!isCollapsed && isCustomOrder && (
          <div className="px-3 mb-2 flex justify-end">
            <button
              onClick={resetMenuOrder}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              title="Reset menu order to default"
            >
              <RotateCcw className="w-3 h-3" />
              Reset order
            </button>
          </div>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedMenuItems.map(item => item.title)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1 px-2">
          {orderedMenuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = item.isOpen;
            
            return (
              <SortableMenuItemWrapper key={item.title} id={item.title} isCollapsed={isCollapsed}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {hasChildren ? (
                    <button
                      onClick={() => toggleDropdown(item.title)}
                      className={cn(
                        'group w-full relative flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        'hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        isOpen || hasActiveChild(item)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                          : 'text-gray-600'
                      )}
                      title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-colors duration-200',
                          isOpen || hasActiveChild(item) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                        )}
                      />
                      
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
                          
                          <ChevronRight className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isOpen ? 'transform rotate-90' : ''
                          )} />
                        </motion.div>
                      )}
                    </button>
                  ) : (
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
                  )}
                </motion.div>

                {/* Dropdown children */}
                {hasChildren && isOpen && !isCollapsed && (
                  <div className="ml-7 pl-2 border-l border-gray-200 mt-1 space-y-1">
                    {item.children?.map((child, childIndex) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      
                      return (
                        <motion.div
                          key={child.title}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: childIndex * 0.05 }}
                        >
                          <Link
                            to={child.href}
                            onClick={() => handleMenuClick(child.href)}
                            className={cn(
                              'group relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                              'hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                              childActive
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                                : 'text-gray-600'
                            )}
                          >
                            <ChildIcon className={cn(
                              'w-4 h-4 transition-colors duration-200',
                              childActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                            )} />
                            
                            <div className="ml-3 flex-1 flex items-center justify-between">
                              <div>
                                <span className="block text-sm">{child.title}</span>
                              </div>
                              
                              {child.badge && (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    'text-xs px-2 py-0.5 font-medium',
                                    childActive 
                                      ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                                  )}
                                >
                                  {typeof child.badge === 'number' && child.badge > 999 
                                    ? `${Math.floor(child.badge / 1000)}k` 
                                    : child.badge}
                                </Badge>
                              )}
                            </div>

                            {/* Active indicator */}
                            {childActive && (
                              <motion.div
                                layoutId="activeChildTab"
                                className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </SortableMenuItemWrapper>
            );
          })}
        </div>
        </SortableContext>
        </DndContext>
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
