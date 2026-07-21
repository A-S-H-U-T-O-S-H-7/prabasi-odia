"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Users, TrendingUp, Calendar, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { 
  adminDashboardService,
  DashboardStats,
  AgeGroupData,
  StateData,
  GrowthData,
  RecentUser,
} from "@/lib/services/adminDashboardService";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import AgeDistributionChart from "@/components/admin/dashboard/AgeDistributionChart";
import StateDistributionChart from "@/components/admin/dashboard/StateDistributionChart";
import GrowthChart from "@/components/admin/dashboard/GrowthChart";
import RecentUsers from "@/components/admin/dashboard/RecentUsers";
import TopCommunities from "@/components/admin/dashboard/TopCommunities";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingUsers: 0,
    totalCommunities: 0,
    totalEvents: 0,
    totalNotices: 0,
  });
  const [ageData, setAgeData] = useState<AgeGroupData[]>([]);
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topCommunities, setTopCommunities] = useState<{ id: string; name: string; memberCount: number }[]>([]);

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('view_dashboard');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    
    if (!hasPermission) {
      toast.error("You don't have permission to access this page");
      router.push('/admin/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, hasPermission]);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const [
        statsResult,
        ageResult,
        stateResult,
        growthResult,
        recentResult,
        topCommunitiesResult,
      ] = await Promise.all([
        adminDashboardService.getDashboardStats(),
        adminDashboardService.getAgeGroupData(),
        adminDashboardService.getStateData(),
        adminDashboardService.getGrowthData(30),
        adminDashboardService.getRecentUsers(5),
        adminDashboardService.getTopCommunities(5),
      ]);
      
      setStats(statsResult);
      setAgeData(ageResult);
      setStateData(stateResult);
      setGrowthData(growthResult);
      setRecentUsers(recentResult);
      setTopCommunities(topCommunitiesResult);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">Access Denied</h2>
          <p className="text-[#6B5E5A] mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2A1636]">📊 Dashboard</h1>
          <p className="text-sm text-[#6B5E5A] mt-1">
            Welcome back, {admin?.name || 'Admin'}! Here's what's happening.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-[#2A1636] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2A1636]">👤 Age Distribution</h3>
            <span className="text-xs text-[#6B5E5A]">{stats.totalUsers} users</span>
          </div>
          <AgeDistributionChart data={ageData} />
        </div>

        {/* State Distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2A1636]">📍 State-wise Distribution</h3>
            <span className="text-xs text-[#6B5E5A]">Top 10 states</span>
          </div>
          <StateDistributionChart data={stateData} />
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#2A1636]">📈 User Growth (Last 30 Days)</h3>
          <span className="text-xs text-[#6B5E5A]">Cumulative</span>
        </div>
        <GrowthChart data={growthData} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2A1636]">👥 Recent Users</h3>
            <span className="text-xs text-[#6B5E5A]">Latest 5</span>
          </div>
          <RecentUsers users={recentUsers} />
        </div>

        {/* Top Communities */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2A1636]">🏘️ Top Communities</h3>
            <span className="text-xs text-[#6B5E5A]">By member count</span>
          </div>
          <TopCommunities communities={topCommunities} />
        </div>
      </div>
    </div>
  );
}