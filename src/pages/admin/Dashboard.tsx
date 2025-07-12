import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import VisitorAnalytics from '@/components/admin/VisitorAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/admin-login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Check authentication
  React.useEffect(() => {
    if (!loading && (!user || user.email !== 'admin@anandtravels.com')) {
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.email !== 'admin@anandtravels.com') {
    return null;
  }

  return (
    <AdminLayout userEmail={user?.email} onSignOut={handleSignOut}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Overview and analytics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <VisitorAnalytics />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
