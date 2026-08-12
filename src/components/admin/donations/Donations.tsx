"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { donationService, DonationData } from "@/lib/services/donationService";
import DonationStats from "@/components/admin/donations/DonationStats";
import DonationTable from "@/components/admin/donations/DonationTable";
import DonationDetailModal from "@/components/admin/donations/DonationDetailModal";

type StatusFilter = "all" | DonationData["status"];

export default function AdminDonationsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();

  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDonation, setSelectedDonation] = useState<DonationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPermission =
    admin?.role === "super_admin" || admin?.permissions?.includes("donations");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (!hasPermission) {
      toast.error("You don't have permission to access this page");
      router.push("/admin/dashboard");
      return;
    }

    fetchDonations();
  }, []);

  const fetchDonations = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await donationService.getAllDonations(500);
      if (result.success) {
        setDonations(result.donations || []);
      } else {
        toast.error(result.error || "Failed to load donations");
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const completed = donations.filter((d) => d.status === "completed");
    const pending = donations.filter((d) => d.status === "pending_payment");
    const totalAmount = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    return {
      total: donations.length,
      completed: completed.length,
      pending: pending.length,
      totalAmount,
    };
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donations.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!term) return true;
      return (
        d.donorDetails?.name?.toLowerCase().includes(term) ||
        d.donorDetails?.email?.toLowerCase().includes(term) ||
        d.donorDetails?.mobile?.toLowerCase().includes(term) ||
        d.donationId?.toLowerCase().includes(term) ||
        d.transactionId?.toLowerCase().includes(term) ||
        d.purpose?.toLowerCase().includes(term)
      );
    });
  }, [donations, search, statusFilter]);

  const handleView = (donation: DonationData) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchDonations(true);
  };

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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">Donations</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">
              View and manage donations from the community
            </p>
          </div>
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

      <DonationStats stats={stats} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, mobile, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-sm text-[#2A1636] placeholder:text-[#6B5E5A]/60 focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-sm text-[#2A1636] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending_payment">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DonationTable
        donations={filteredDonations}
        loading={loading}
        onView={handleView}
      />

      <DonationDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonation(null);
        }}
        donation={selectedDonation}
      />
    </div>
  );
}
