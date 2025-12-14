import { motion } from 'framer-motion';
import { Users, Eye, Calendar, TrendingUp, Clock, Globe, Package, MessageSquare, UserCheck, AlertCircle, CalendarClock, MousePointerClick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClickAnalytics } from '@/hooks/useClickTracker';
import { useAdminSidebarData } from '@/hooks/useAdminSidebarData';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon: Icon, description, color, isLoading }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          ) : (
            value.toLocaleString()
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const VisitorAnalytics = () => {
  const { stats, loading, error } = useClickAnalytics();
  const { counts, loading: countsLoading } = useAdminSidebarData();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <Globe className="h-5 w-5" />
            <span className="text-sm">Failed to load visitor analytics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Visitors',
      value: stats.totalClicks,
      icon: Eye,
      description: 'All time unique visitors',
      color: 'bg-blue-500'
    },
    {
      title: 'Today Visitors',
      value: stats.todayClicks,
      icon: Calendar,
      description: 'Unique visitors today',
      color: 'bg-purple-500'
    },
    {
      title: 'Week Visitors',
      value: stats.weekClicks,
      icon: TrendingUp,
      description: 'Last 7 days',
      color: 'bg-orange-500'
    },
    {
      title: 'Month Visitors',
      value: stats.monthClicks,
      icon: Clock,
      description: 'Last 30 days',
      color: 'bg-indigo-500'
    }
  ];

  const businessCards = [
    {
      title: 'Pending Bookings',
      value: counts.pendingBookings,
      icon: AlertCircle,
      description: 'Need attention',
      color: 'bg-red-500',
      isLoading: countsLoading
    },
    {
      title: "Today's Bookings",
      value: counts.todayBookings,
      icon: Calendar,
      description: 'Booked today',
      color: 'bg-emerald-500',
      isLoading: countsLoading
    },
    {
      title: 'Advance Reservations',
      value: counts.advanceBookings,
      icon: CalendarClock,
      description: 'Future bookings',
      color: 'bg-purple-600',
      isLoading: countsLoading
    },
    {
      title: 'Total Bookings',
      value: counts.bookings,
      icon: Package,
      description: 'All bookings',
      color: 'bg-blue-600',
      isLoading: countsLoading
    },
    {
      title: 'Messages',
      value: counts.messages,
      icon: MessageSquare,
      description: 'Customer inquiries',
      color: 'bg-yellow-500',
      isLoading: countsLoading
    },
    {
      title: 'Active Agents',
      value: counts.agents,
      icon: UserCheck,
      description: 'Team members',
      color: 'bg-teal-500',
      isLoading: countsLoading
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Visitor statistics based on button clicks and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <MousePointerClick className="w-4 h-4 text-blue-500" />
          <span>Click-based tracking</span>
        </div>
      </div>

      {/* Website Analytics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Website Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              color={stat.color}
              isLoading={loading}
            />
          ))}
        </div>
      </div>

      {/* Business Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {businessCards.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              color={stat.color}
              isLoading={stat.isLoading}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-blue-600">{stats.todayClicks}</span>{' '}
                    unique {stats.todayClicks === 1 ? 'visitor' : 'visitors'} today
                  </p>
                  <p>
                    <span className="font-medium text-purple-600">{stats.weekClicks}</span>{' '}
                    {stats.weekClicks === 1 ? 'visitor' : 'visitors'} this week
                  </p>
                  <p>
                    Monthly activity:{' '}
                    <span className="font-medium text-orange-600">
                      {stats.monthClicks} visitors
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-red-600">{counts.pendingBookings}</span>{' '}
                    {counts.pendingBookings === 1 ? 'booking needs' : 'bookings need'} attention
                  </p>
                  <p>
                    <span className="font-medium text-emerald-600">{counts.todayBookings}</span>{' '}
                    {counts.todayBookings === 1 ? 'booking' : 'bookings'} made today
                  </p>
                  <p>
                    Active team:{' '}
                    <span className="font-medium text-teal-600">
                      {counts.agents} {counts.agents === 1 ? 'agent' : 'agents'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorAnalytics;
