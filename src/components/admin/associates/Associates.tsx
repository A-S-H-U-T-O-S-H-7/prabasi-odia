// src/app/admin/associates/page.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminAssociateService, 
  Associate 
} from "@/lib/services/adminAssociateService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import AssociateStats from "@/components/admin/associates/AssociateStats";
import AssociateTable from "@/components/admin/associates/AssociateTable";
import CreateAssociateModal from "@/components/admin/associates/CreateAssociateModal";

export default function AdminAssociatesPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssociate, setEditingAssociate] = useState<Associate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('associates');

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
    
    fetchAssociates();
    fetchStats();
  }, []);

  const fetchAssociates = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminAssociateService.getAllAssociates();
      if (result.success) {
        setAssociates(result.associates);
      } else {
        toast.error(result.error || "Failed to load associates");
      }
    } catch (error) {
      console.error("Error fetching associates:", error);
      toast.error("Failed to load associates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminAssociateService.getAssociateStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreate = () => {
    setEditingAssociate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (associate: Associate) => {
    setEditingAssociate(associate);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingAssociate) {
        result = await adminAssociateService.updateAssociate(editingAssociate.id, formData);
        if (result.success) {
          toast.success("Associate updated successfully ✅");
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.ASSOCIATE,
            entityId: editingAssociate.id,
            entityTitle: formData.name,
            details: `Updated associate: ${formData.name}`,
          });
        }
      } else {
        result = await adminAssociateService.createAssociate(formData);
        if (result.success) {
          toast.success("Associate created successfully 🤝");
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.ASSOCIATE,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created associate: ${formData.name}`,
          });
        }
      }
      
      if (result.success) {
        setIsModalOpen(false);
        fetchAssociates(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving associate:", error);
      toast.error(error.message || "Failed to save associate");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (associate: Associate) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete associate "${associate.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6B1E5B",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#FFF9F2",
      color: "#2A1636",
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await adminAssociateService.deleteAssociate(associate.id);
        if (deleteResult.success) {
          toast.success("Associate deleted successfully 🗑️");
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.ASSOCIATE,
            entityId: associate.id,
            entityTitle: associate.name,
            details: `Deleted associate: ${associate.name}`,
          });
          fetchAssociates(true);
          fetchStats();
        } else {
          toast.error(deleteResult.error || "Failed to delete associate");
        }
      } catch (error: any) {
        console.error("Error deleting associate:", error);
        toast.error(error.message || "Failed to delete associate");
      }
    }
  };

  const handleToggleActive = async (associate: Associate) => {
    try {
      const result = await adminAssociateService.toggleActive(associate.id, !associate.isActive);
      if (result.success) {
        toast.success(associate.isActive ? "Associate deactivated" : "Associate activated");
        await log({
          action: associate.isActive ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.ASSOCIATE,
          entityId: associate.id,
          entityTitle: associate.name,
          details: `${associate.isActive ? 'Deactivated' : 'Activated'} associate: ${associate.name}`,
        });
        fetchAssociates(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error(error.message || "Failed to toggle status");
    }
  };

  const handleRefresh = () => {
    fetchAssociates(true);
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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">🤝 Community Associates</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage community associates and partners</p>
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
            Add Associate
          </button>
        </div>
      </div>

      {/* Stats */}
      <AssociateStats stats={stats} />

      {/* Table */}
      <AssociateTable
        associates={associates}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Create/Edit Modal */}
      <CreateAssociateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssociate(null);
        }}
        onSave={handleSave}
        editingAssociate={editingAssociate}
        isSaving={isSaving}
      />
    </div>
  );
}