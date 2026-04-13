import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Clock } from "lucide-react";
import { useVisitorAnalytics } from "@/hooks/useVisitorAnalytics";
import { useState, useEffect } from "react";

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

interface AdminHeaderProps {
  userEmail: string | null | undefined;
  onSignOut: () => void;
}

const AdminHeader = ({ userEmail, onSignOut }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { stats, loading } = useVisitorAnalytics();
  const istTime = useISTClock();

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
            {/* Live IST Clock */}
            <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-travel-blue-dark" />
              <span className="text-xs font-mono text-travel-blue-dark font-medium">{istTime}</span>
            </div>
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
