"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { adminUserService, UserData } from "@/lib/services/adminUserService";
import RegisteredUserStats from "@/components/admin/registered-users/RegisteredUserStats";
import RegisteredUserFilters from "@/components/admin/registered-users/RegisteredUserFilters";
import RegisteredUserTable from "@/components/admin/registered-users/RegisteredUserTable";

export default function AdminRegisteredUsersPage() {
  const pageSize = 10;
  const router = useRouter();
  const { admin } = useAdminAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "joined" | "signup_only">("all");
  const [stats, setStats] = useState({ total: 0, joined: 0, signupOnly: 0 });
  const [searchResults, setSearchResults] = useState<UserData[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const hasPermission =
    admin?.permissions?.includes("users") || admin?.role === "super_admin";

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
      const result = await adminUserService.getRegisteredUsers(10000, undefined, {
        status: statusFilter,
      });
      if (result.users) {
        setUsers(result.users);
        setCurrentPage(1);
      }
      setSearchResults(null);
    } catch (error) {
      toast.error("Failed to load registered users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminUserService.getRegisteredUserStats();
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
      const result = await adminUserService.searchRegisteredUsers(searchTerm);
      if (result.success && result.users) {
        let filtered = result.users;
        if (statusFilter === "joined") {
          filtered = filtered.filter((u) => u.hasJoinedCommunity);
        } else if (statusFilter === "signup_only") {
          filtered = filtered.filter((u) => !u.hasJoinedCommunity);
        }
        setSearchResults(filtered);
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setSearchResults(null);
    fetchUsers(true);
    fetchStats();
  };

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">Access Denied</h2>
          <p className="text-[#6B5E5A] mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const displayUsers = searchResults || users;
  const totalPages = Math.max(1, Math.ceil(displayUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const paginatedUsers = displayUsers.slice(pageStart, pageStart + pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="mt-0.5 p-2 rounded-xl border-2 border-[#6B1E5B]/20 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">
              Registered Users
            </h1>
            <p className="text-sm text-[#6B5E5A]">
              All users who have signed up on the platform
            </p>
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

      <RegisteredUserStats stats={stats} />

      <RegisteredUserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="px-4 py-2 rounded-xl bg-[#6B1E5B] text-white font-medium hover:bg-[#531547] transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>

      <RegisteredUserTable users={paginatedUsers} loading={loading} startIndex={pageStart} />

      {!loading && displayUsers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 sm:flex-row">
          <p className="text-sm text-[#6B5E5A]">
            Showing {pageStart + 1}–{Math.min(pageStart + pageSize, displayUsers.length)} of {displayUsers.length} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-lg border border-[#D4C8C0] p-2 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-sm font-medium text-[#2A1636]">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-lg border border-[#D4C8C0] p-2 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
