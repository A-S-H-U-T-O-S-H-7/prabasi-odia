"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminCommunityService, 
  Community 
} from "@/lib/services/adminCommunityService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import CommunityStats from "./CommunityStats";
import CommunityFilters from "./CommunityFilters";
import CommunityTable from "./CommunityTable";
import CreateCommunityModal from "./CreateCommunityModal";
import CommunityMembersModal from "./CommunityMembersModal";

export default function AdminCommunitiesPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0, totalMembers: 0 });
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Community[] | null>(null);

  const hasPermission = admin?.permissions?.includes('communities') || admin?.role === 'super_admin';

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
    
    fetchCommunities();
    fetchStats();
  }, [statusFilter]);

  const fetchCommunities = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminCommunityService.getAllCommunities();
      if (result.success) {
        // Apply status filter
        let filtered = result.communities;
        if (statusFilter !== 'all') {
          filtered = filtered.filter(c => c.status === statusFilter);
        }
        setCommunities(filtered);
      } else {
        toast.error(result.error || "Failed to load communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminCommunityService.getCommunityStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      fetchCommunities();
      return;
    }
    setLoading(true);
    try {
      const result = await adminCommunityService.searchCommunities(searchTerm);
      if (result.success) {
        setSearchResults(result.communities);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCommunity(null);
    setIsModalOpen(true);
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingCommunity) {
        // Update existing community
        result = await adminCommunityService.updateCommunity(editingCommunity.id, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.COMMUNITY,
            entityId: editingCommunity.id,
            entityTitle: formData.name,
            details: `Updated community: ${formData.name}`,
          });
        }
      } else {
        // Create new community
        const createData = {
          ...formData,
          createdBy: admin?.uid || '',
        };
        result = await adminCommunityService.createCommunity(createData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.COMMUNITY,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created community: ${formData.name}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingCommunity ? "Community updated successfully" : "Community created successfully");
        setIsModalOpen(false);
        fetchCommunities(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving community:", error);
      toast.error(error.message || "Failed to save community");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (community: Community) => {
    if (!confirm(`Delete community "${community.name}"? This will remove all data associated with it.`)) {
      return;
    }

    try {
      const result = await adminCommunityService.deleteCommunity(community.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.COMMUNITY,
          entityId: community.id,
          entityTitle: community.name,
          details: `Deleted community: ${community.name}`,
        });
        toast.success("Community deleted successfully");
        fetchCommunities(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete community");
      }
    } catch (error: any) {
      console.error("Error deleting community:", error);
      toast.error(error.message || "Failed to delete community");
    }
  };

  const handleViewMembers = (community: Community) => {
    setSelectedCommunity(community);
    setIsMembersModalOpen(true);
  };

  const handleRefresh = () => {
    fetchCommunities(true);
    fetchStats();
  };

  const displayCommunities = searchResults || communities;

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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">🏘️ Communities</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage all communities</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-[#2A1636] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Community
          </button>
        </div>
      </div>

      {/* Stats */}
      <CommunityStats stats={stats} />

      {/* Filters */}
      <CommunityFilters
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
      <CommunityTable
        communities={displayCommunities}
        loading={loading}
        onViewMembers={handleViewMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCommunity(null);
        }}
        onSave={handleSave}
        editingCommunity={editingCommunity}
        isSaving={isSaving}
      />

      {/* Members Modal */}
      <CommunityMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setSelectedCommunity(null);
        }}
        community={selectedCommunity}
      />
    </div>
  );
}