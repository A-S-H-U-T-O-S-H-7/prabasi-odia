"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { adminUserService, UserData } from "@/lib/services/adminUserService";
import UserStats from "@/components/admin/users/UserStats";
import UserFilters from "@/components/admin/users/UserFilters";
import UserTable from "@/components/admin/users/UserTable";
import UserVerificationModal from "@/components/admin/users/UserVerificationModal";

export default function AdminUsersPage() {
  const router = useRouter();
  const { admin } = useAdminAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });
  const [searchResults, setSearchResults] = useState<UserData[] | null>(null);

  // Check if admin has permission
  const hasPermission = admin?.permissions?.includes('users') || admin?.role === 'super_admin';

  useEffect(() => {
    if (!hasPermission) {
      toast.error("You don't have permission to access this page");
      return;
    }
    fetchUsers();
    fetchStats();
  }, [statusFilter]);

  const fetchUsers = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await adminUserService.getUsers(20, undefined, { status: statusFilter });
      if (result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminUserService.getUserStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      fetchUsers();
      return;
    }
    setLoading(true);
    try {
      const result = await adminUserService.searchUsers(searchTerm);
      if (result.success && result.users) {
        setSearchResults(result.users);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleVerify = async (uid: string, memberId: string) => {
    setIsVerifying(true);
    try {
      const result = await adminUserService.verifyUser(uid, memberId);
      if (result.success) {
        toast.success("User verified successfully!");
        setIsModalOpen(false);
        fetchUsers(true);
        fetchStats();
      } else {
        toast.error(result.error || "Verification failed");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (uid: string, reason: string) => {
    setIsVerifying(true);
    try {
      const result = await adminUserService.rejectUser(uid, reason);
      if (result.success) {
        toast.success("User rejected");
        setIsModalOpen(false);
        fetchUsers(true);
        fetchStats();
      } else {
        toast.error(result.error || "Rejection failed");
      }
    } catch (error) {
      toast.error("Rejection failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
    fetchStats();
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

  const displayUsers = searchResults || users;

  return (
    <div className="space-y-6">
      {/* Header with Back and Refresh Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="mt-0.5 p-2 rounded-xl border-2 border-[#6B1E5B]/20 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">👥 User Management</h1>
            <p className="text-sm text-[#6B5E5A]">Manage and verify community members</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-sm border border-[#E7D7E8] text-[#2A1636] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <UserStats stats={stats} />

      {/* Filters */}
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Search Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-xl bg-[#6B1E5B] text-white font-medium hover:bg-[#531547] transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <UserTable
        users={displayUsers}
        onViewUser={handleViewUser}
        loading={loading}
      />

      {/* Verification Modal */}
      <UserVerificationModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVerify={handleVerify}
        onReject={handleReject}
        isVerifying={isVerifying}
      />
    </div>
  );
}