"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminPartnerService, 
  Partner 
} from "@/lib/services/adminPartnerService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import PartnerStats from "@/components/admin/partners/PartnerStats";
import PartnerTable from "@/components/admin/partners/PartnerTable";
import CreatePartnerModal from "@/components/admin/partners/CreatePartnerModal";

export default function AdminPartnersPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('partners');

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
    
    fetchPartners();
    fetchStats();
  }, []);

  const fetchPartners = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminPartnerService.getAllPartners();
      if (result.success) {
        setPartners(result.partners);
      } else {
        toast.error(result.error || "Failed to load partners");
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminPartnerService.getPartnerStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreate = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingPartner) {
        result = await adminPartnerService.updatePartner(editingPartner.id, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.PARTNER,
            entityId: editingPartner.id,
            entityTitle: formData.name,
            details: `Updated partner: ${formData.name}`,
          });
        }
      } else {
        result = await adminPartnerService.createPartner(formData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.PARTNER,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created partner: ${formData.name}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingPartner ? "Partner updated successfully" : "Partner created successfully");
        setIsModalOpen(false);
        fetchPartners(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving partner:", error);
      toast.error(error.message || "Failed to save partner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Delete partner "${partner.name}"?`)) {
      return;
    }

    try {
      const result = await adminPartnerService.deletePartner(partner.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.PARTNER,
          entityId: partner.id,
          entityTitle: partner.name,
          details: `Deleted partner: ${partner.name}`,
        });
        toast.success("Partner deleted successfully");
        fetchPartners(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete partner");
      }
    } catch (error: any) {
      console.error("Error deleting partner:", error);
      toast.error(error.message || "Failed to delete partner");
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    try {
      const result = await adminPartnerService.toggleActive(partner.id, !partner.isActive);
      if (result.success) {
        await log({
          action: partner.isActive ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.PARTNER,
          entityId: partner.id,
          entityTitle: partner.name,
          details: `${partner.isActive ? 'Deactivated' : 'Activated'} partner: ${partner.name}`,
        });
        toast.success(partner.isActive ? "Partner deactivated" : "Partner activated");
        fetchPartners(true);
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
    fetchPartners(true);
    fetchStats();
  };

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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">🤝 Trusted Partners</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage community partners</p>
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
            Add Partner
          </button>
        </div>
      </div>

      {/* Stats */}
      <PartnerStats stats={stats} />

      {/* Table */}
      <PartnerTable
        partners={partners}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Create/Edit Modal */}
      <CreatePartnerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPartner(null);
        }}
        onSave={handleSave}
        editingPartner={editingPartner}
        isSaving={isSaving}
      />
    </div>
  );
}