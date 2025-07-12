import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, Eye } from "lucide-react";
import { useVisitorAnalytics } from "@/hooks/useVisitorAnalytics";

interface AdminHeaderProps {
  userEmail: string | null | undefined;
  onSignOut: () => void;
}

const AdminHeader = ({ userEmail, onSignOut }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { stats, loading } = useVisitorAnalytics();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-travel-blue-dark">Admin Dashboard</h1>
            <span className="hidden sm:inline text-sm text-gray-600">
              {userEmail}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live visitor count */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                <Users className="w-3 h-3 mr-1" />
                {loading ? '...' : stats.liveUsers} Live
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                <Eye className="w-3 h-3 mr-1" />
                {loading ? '...' : stats.totalVisitors.toLocaleString()} Total
              </Badge>
            </div>
            <Button
              onClick={() => navigate('/admin/coupons')}
              className="bg-travel-orange hover:bg-travel-orange/90"
            >
              Coupons
            </Button>
            <Button
              variant="outline"
              onClick={onSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
