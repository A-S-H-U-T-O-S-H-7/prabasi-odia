"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import {
  adminEmergencyContactService,
  EmergencyContact,
} from "@/lib/services/adminEmergencyContactService";
import {
  ActivityActions,
  ActivityEntityTypes,
} from "@/lib/services/activityLogService";
import EmergencyContactStats from "./EmergencyContactStats";
import EmergencyContactTable from "./EmergencyContactTable";
import CreateEmergencyContactModal from "./CreateEmergencyContactModal";

export default function AdminEmergencyContactsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const hasPermission =
    admin?.role === "super_admin" ||
    admin?.permissions?.includes("emergency_contacts");

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
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await adminEmergencyContactService.getAllContacts();
      if (result.success) setContacts(result.contacts);
      else toast.error(result.error || "Failed to load contacts");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStats(await adminEmergencyContactService.getContactStats());
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      if (editingContact) {
        result = await adminEmergencyContactService.updateContact(
          editingContact.id,
          formData
        );
        if (result.success) {
          toast.success("Contact updated");
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.EMERGENCY_CONTACT,
            entityId: editingContact.id,
            entityTitle: formData.title,
            details: `Updated emergency contact: ${formData.title}`,
          });
        }
      } else {
        result = await adminEmergencyContactService.createContact(formData);
        if (result.success) {
          toast.success("Contact added");
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.EMERGENCY_CONTACT,
            entityId: result.id,
            entityTitle: formData.title,
            details: `Created emergency contact: ${formData.title}`,
          });
        }
      }
      if (result.success) {
        setIsModalOpen(false);
        setEditingContact(null);
        fetchContacts(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (contact: EmergencyContact) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${contact.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6B1E5B",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      background: "#FFF9F2",
      color: "#2A1636",
    });

    if (!result.isConfirmed) return;

    try {
      const deleteResult = await adminEmergencyContactService.deleteContact(contact.id);
      if (deleteResult.success) {
        toast.success("Contact deleted");
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.EMERGENCY_CONTACT,
          entityId: contact.id,
          entityTitle: contact.title,
          details: `Deleted emergency contact: ${contact.title}`,
        });
        fetchContacts(true);
        fetchStats();
      } else {
        toast.error(deleteResult.error || "Failed to delete");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (contact: EmergencyContact) => {
    try {
      const result = await adminEmergencyContactService.toggleActive(
        contact.id,
        !contact.isActive
      );
      if (result.success) {
        toast.success(contact.isActive ? "Deactivated" : "Activated");
        await log({
          action: contact.isActive
            ? ActivityActions.UNPUBLISH
            : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.EMERGENCY_CONTACT,
          entityId: contact.id,
          entityTitle: contact.title,
          details: `${contact.isActive ? "Deactivated" : "Activated"} emergency contact: ${contact.title}`,
        });
        fetchContacts(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to toggle");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle");
    }
  };

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">Access Denied</h2>
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
            className="mt-0.5 p-2 rounded-xl border-2 border-[#6B1E5B]/20 text-[#6B1E5B] hover:bg-[#6B1E5B]/5 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">
              Emergency Contacts
            </h1>
            <p className="text-sm text-[#6B5E5A] mt-1">
              Manage numbers shown on the sticky emergency button
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchContacts(true);
              fetchStats();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7D7E8] bg-white/70 text-[#2A1636] text-sm font-medium hover:bg-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <EmergencyContactStats stats={stats} />

      <EmergencyContactTable
        contacts={contacts}
        loading={loading}
        onEdit={(c) => {
          setEditingContact(c);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <CreateEmergencyContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSave}
        editingContact={editingContact}
        isSaving={isSaving}
      />
    </div>
  );
}
