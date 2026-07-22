"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminContactService, 
  ContactRequest 
} from "@/lib/services/adminContactService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import ContactStats from "@/components/admin/contact/ContactStats";
import ContactTable from "@/components/admin/contact/ContactTable";
import ContactDetailModal from "@/components/admin/contact/ContactDetailModal";

export default function AdminContactRequestsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('contact');

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
    
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminContactService.getAllRequests();
      if (result.success) {
        setRequests(result.requests);
      } else {
        toast.error(result.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching contact requests:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminContactService.getContactStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleView = (request: ContactRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    // Mark as read when viewed
    if (!request.isRead) {
      handleToggleRead(request);
    }
  };

  const handleToggleRead = async (request: ContactRequest) => {
    try {
      const result = request.isRead 
        ? await adminContactService.markAsUnread(request.id)
        : await adminContactService.markAsRead(request.id);
      
      if (result.success) {
        await log({
          action: request.isRead ? ActivityActions.UPDATE : ActivityActions.UPDATE,
          entityType: ActivityEntityTypes.CONTACT,
          entityId: request.id,
          entityTitle: request.name,
          details: `${request.isRead ? 'Marked as unread' : 'Marked as read'} message from ${request.name}`,
        });
        fetchRequests(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Error toggling read status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (request: ContactRequest) => {
    if (!confirm(`Delete message from "${request.name}"?`)) {
      return;
    }

    try {
      const result = await adminContactService.deleteRequest(request.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.CONTACT,
          entityId: request.id,
          entityTitle: request.name,
          details: `Deleted message from ${request.name}`,
        });
        toast.success("Message deleted successfully");
        fetchRequests(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast.error(error.message || "Failed to delete message");
    }
  };

  const handleRefresh = () => {
    fetchRequests(true);
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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">📬 Contact Requests</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage messages from the contact form</p>
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

      {/* Stats */}
      <ContactStats stats={stats} />

      {/* Table */}
      <ContactTable
        requests={requests}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
        onToggleRead={handleToggleRead}
      />

      {/* Detail Modal */}
      <ContactDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
}