"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminNoticeService, 
  Notice 
} from "@/lib/services/adminNoticeService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import NoticeStats from "./NoticeStats";
import NoticeFilters from "./NoticeFilters";
import NoticeTable from "./NoticeTable";
import CreateNoticeModal from "./CreateNoticeModal";
import { adminCommunityService } from "@/lib/services/adminCommunityService";

export default function AdminNoticesPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, unpublished: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 });
  const [searchResults, setSearchResults] = useState<Notice[] | null>(null);

  const hasPermission = admin?.permissions?.includes('notices') || admin?.role === 'super_admin';

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
    fetchNotices();
    fetchStats();
  }, [statusFilter, priorityFilter]);

  const fetchCommunities = async () => {
    try {
      const result = await adminCommunityService.getAllCommunities();
      if (result.success) {
        setCommunities(result.communities.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    }
  };

  const fetchNotices = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminNoticeService.getAllNotices();
      if (result.success) {
        let filtered = result.notices;
        if (statusFilter !== 'all') {
          filtered = filtered.filter(n => n.isPublished === (statusFilter === 'published'));
        }
        if (priorityFilter !== 'all') {
          filtered = filtered.filter(n => n.priority === priorityFilter);
        }
        setNotices(filtered);
      } else {
        toast.error(result.error || "Failed to load notices");
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminNoticeService.getNoticeStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      fetchNotices();
      return;
    }
    setLoading(true);
    try {
      const result = await adminNoticeService.searchNotices(searchTerm);
      if (result.success) {
        setSearchResults(result.notices);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingNotice) {
        result = await adminNoticeService.updateNotice(editingNotice.id, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.NOTICE,
            entityId: editingNotice.id,
            entityTitle: formData.title,
            details: `Updated notice: ${formData.title}`,
          });
        }
      } else {
        const createData = {
          ...formData,
          createdBy: admin?.uid || '',
          createdByAdminName: admin?.name || '',
        };
        result = await adminNoticeService.createNotice(createData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.NOTICE,
            entityId: result.id,
            entityTitle: formData.title,
            details: `Created notice: ${formData.title}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingNotice ? "Notice updated successfully" : "Notice created successfully");
        setIsModalOpen(false);
        fetchNotices(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving notice:", error);
      toast.error(error.message || "Failed to save notice");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (notice: Notice) => {
    if (!confirm(`Delete notice "${notice.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminNoticeService.deleteNotice(notice.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.NOTICE,
          entityId: notice.id,
          entityTitle: notice.title,
          details: `Deleted notice: ${notice.title}`,
        });
        toast.success("Notice deleted successfully");
        fetchNotices(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete notice");
      }
    } catch (error: any) {
      console.error("Error deleting notice:", error);
      toast.error(error.message || "Failed to delete notice");
    }
  };

  const handleTogglePublish = async (notice: Notice) => {
    try {
      const result = await adminNoticeService.togglePublish(notice.id, !notice.isPublished);
      if (result.success) {
        await log({
          action: notice.isPublished ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.NOTICE,
          entityId: notice.id,
          entityTitle: notice.title,
          details: `${notice.isPublished ? 'Unpublished' : 'Published'} notice: ${notice.title}`,
        });
        toast.success(notice.isPublished ? "Notice unpublished" : "Notice published");
        fetchNotices(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to toggle publish status");
      }
    } catch (error: any) {
      console.error("Error toggling publish:", error);
      toast.error(error.message || "Failed to toggle publish status");
    }
  };

  const handleRefresh = () => {
    fetchNotices(true);
    fetchStats();
  };

  const displayNotices = searchResults || notices;

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
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="mt-0.5 p-2 rounded-xl border-2 border-[#6B1E5B]/20 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">📢 Notices</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage all community notices</p>
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
            Add Notice
          </button>
        </div>
      </div>

      {/* Stats */}
      <NoticeStats stats={stats} />

      {/* Filters */}
      <NoticeFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
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
      <NoticeTable
        notices={displayNotices}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />

      {/* Create/Edit Modal */}
      <CreateNoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        onSave={handleSave}
        editingNotice={editingNotice}
        isSaving={isSaving}
        communities={communities}
      />
    </div>
  );
}