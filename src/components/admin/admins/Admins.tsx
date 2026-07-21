"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import AdminTable from "@/components/admin/admins/AdminTable";
import AdminModal from "@/components/admin/admins/AdminModal";
import { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin,
} from "@/lib/services/adminManagementService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";

export default function AdminManagementPage() {
  const router = useRouter();
  const { admin: currentAdmin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const fetchAdmins = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await getAllAdmins();
      if (result.success) {
        setAdmins(result.admins);
      } else {
        toast.error(result.error || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    
    if (!isSuperAdmin) {
      toast.error("Access denied. Super Admin only.");
      router.push("/admin/dashboard");
      return;
    }
    
    fetchAdmins();
  }, [currentAdmin, isAuthenticated, isSuperAdmin, router, fetchAdmins]);

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin: any) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleSaveAdmin = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingAdmin) {
        const adminId = editingAdmin.uid || editingAdmin.id;
        result = await updateAdmin(adminId, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.ADMIN,
            entityId: adminId,
            entityTitle: formData.name,
            details: `Updated admin: ${formData.name}`,
          });
        }
      } else {
        result = await createAdmin(formData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.ADMIN,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created admin: ${formData.name}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingAdmin ? "Admin updated successfully" : "Admin created successfully");
        setIsModalOpen(false);
        fetchAdmins(true);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving admin:", error);
      toast.error(error.message || "Failed to save admin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (admin: any) => {
    const adminId = admin.uid || admin.id;
    const currentAdminId = currentAdmin?.uid || '';
    
    if (adminId === currentAdminId) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!confirm(`Delete admin "${admin.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteAdmin(adminId);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.ADMIN,
          entityId: adminId,
          entityTitle: admin.name,
          details: `Deleted admin: ${admin.name}`,
        });
        toast.success("Admin deleted successfully");
        fetchAdmins(true);
      } else {
        toast.error(result.error || "Failed to delete admin");
      }
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(error.message || "Failed to delete admin");
    }
  };

  const handleRefresh = () => {
    fetchAdmins(true);
  };

  // ✅ Use only uid - no id
  const currentAdminId = currentAdmin?.uid || '';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">👑 Admin Management</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage system administrators and their permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-[#2A1636] text-sm font-medium hover:bg-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleAddAdmin}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      <div className="text-sm text-[#6B5E5A]">
        Total: {admins.length} admin{admins.length !== 1 ? 's' : ''}
      </div>

      <AdminTable
        admins={admins}
        currentAdminId={currentAdminId}
        onEdit={handleEditAdmin}
        onDelete={handleDeleteAdmin}
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAdmin(null);
        }}
        onSave={handleSaveAdmin}
        editingAdmin={editingAdmin}
        isSaving={isSaving}
      />
    </div>
  );
}