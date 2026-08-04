"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import {
  adminAdvisoryBoardService,
  AdvisoryBoardMember,
} from "@/lib/services/adminAdvisoryBoardService";
import {
  ActivityActions,
  ActivityEntityTypes,
} from "@/lib/services/activityLogService";
import AdvisoryBoardStats from "@/components/admin/advisory-board/AdvisoryBoardStats";
import AdvisoryBoardTable from "@/components/admin/advisory-board/AdvisoryBoardTable";
import CreateAdvisoryBoardModal from "@/components/admin/advisory-board/CreateAdvisoryBoardModal";

export default function AdminAdvisoryBoardPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();

  const [members, setMembers] = useState<AdvisoryBoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] =
    useState<AdvisoryBoardMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
  });

  const hasPermission =
    admin?.role === "super_admin" ||
    admin?.permissions?.includes("advisory_board");

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

    fetchMembers();
    fetchStats();
  }, []);

  const fetchMembers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await adminAdvisoryBoardService.getAllMembers();
      if (result.success) {
        setMembers(result.members);
      } else {
        toast.error(result.error || "Failed to load advisory board");
      }
    } catch (error) {
      console.error("Error fetching advisory board:", error);
      toast.error("Failed to load advisory board");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminAdvisoryBoardService.getMemberStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: AdvisoryBoardMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;

      if (editingMember) {
        result = await adminAdvisoryBoardService.updateMember(
          editingMember.id,
          formData
        );
        if (result.success) {
          toast.success("Member updated successfully");
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.ADVISORY_BOARD,
            entityId: editingMember.id,
            entityTitle: formData.name,
            details: `Updated advisory board member: ${formData.name}`,
          });
        }
      } else {
        result = await adminAdvisoryBoardService.createMember(formData);
        if (result.success) {
          toast.success("Member added successfully");
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.ADVISORY_BOARD,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created advisory board member: ${formData.name}`,
          });
        }
      }

      if (result.success) {
        setIsModalOpen(false);
        fetchMembers(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving member:", error);
      toast.error(error.message || "Failed to save member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (member: AdvisoryBoardMember) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${member.name}"? This action cannot be undone.`,
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
        const deleteResult = await adminAdvisoryBoardService.deleteMember(
          member.id
        );
        if (deleteResult.success) {
          toast.success("Member deleted successfully");
          await log({
            action: ActivityActions.DELETE,
            entityType: ActivityEntityTypes.ADVISORY_BOARD,
            entityId: member.id,
            entityTitle: member.name,
            details: `Deleted advisory board member: ${member.name}`,
          });
          fetchMembers(true);
          fetchStats();
        } else {
          toast.error(deleteResult.error || "Failed to delete member");
        }
      } catch (error: any) {
        console.error("Error deleting member:", error);
        toast.error(error.message || "Failed to delete member");
      }
    }
  };

  const handleToggleActive = async (member: AdvisoryBoardMember) => {
    try {
      const result = await adminAdvisoryBoardService.toggleActive(
        member.id,
        !member.isActive
      );
      if (result.success) {
        toast.success(
          member.isActive ? "Member deactivated" : "Member activated"
        );
        await log({
          action: member.isActive
            ? ActivityActions.UNPUBLISH
            : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.ADVISORY_BOARD,
          entityId: member.id,
          entityTitle: member.name,
          details: `${member.isActive ? "Deactivated" : "Activated"} advisory board member: ${member.name}`,
        });
        fetchMembers(true);
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
    fetchMembers(true);
    fetchStats();
  };

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">
            Access Denied
          </h2>
          <p className="text-[#6B5E5A] mt-2">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

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
              Advisory Board
            </h1>
            <p className="text-sm text-[#6B5E5A] mt-1">
              Manage advisory board members shown on the public page
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-[#2A1636] text-sm font-medium hover:bg-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      <AdvisoryBoardStats stats={stats} />

      <AdvisoryBoardTable
        members={members}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <CreateAdvisoryBoardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSave}
        editingMember={editingMember}
        isSaving={isSaving}
      />
    </div>
  );
}
