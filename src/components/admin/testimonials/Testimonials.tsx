"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminTestimonialService, 
  Testimonial 
} from "@/lib/services/adminTestimonialService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import TestimonialStats from "@/components/admin/testimonials/TestimonialStats";
import TestimonialTable from "@/components/admin/testimonials/TestimonialTable";
import CreateTestimonialModal from "@/components/admin/testimonials/CreateTestimonialModal";

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, unpublished: 0 });

  const hasPermission = admin?.role === 'super_admin' || admin?.permissions?.includes('testimonials');

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
    
    fetchTestimonials();
    fetchStats();
  }, []);

  const fetchTestimonials = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminTestimonialService.getAllTestimonials();
      if (result.success) {
        setTestimonials(result.testimonials);
      } else {
        toast.error(result.error || "Failed to load testimonials");
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminTestimonialService.getTestimonialStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleCreate = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingTestimonial) {
        result = await adminTestimonialService.updateTestimonial(editingTestimonial.id, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.TESTIMONIAL,
            entityId: editingTestimonial.id,
            entityTitle: formData.name,
            details: `Updated testimonial from ${formData.name}`,
          });
        }
      } else {
        result = await adminTestimonialService.createTestimonial(formData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.TESTIMONIAL,
            entityId: result.id,
            entityTitle: formData.name,
            details: `Created testimonial from ${formData.name}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingTestimonial ? "Testimonial updated successfully" : "Testimonial created successfully");
        setIsModalOpen(false);
        fetchTestimonials(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast.error(error.message || "Failed to save testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (!confirm(`Delete testimonial from "${testimonial.name}"?`)) {
      return;
    }

    try {
      const result = await adminTestimonialService.deleteTestimonial(testimonial.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.TESTIMONIAL,
          entityId: testimonial.id,
          entityTitle: testimonial.name,
          details: `Deleted testimonial from ${testimonial.name}`,
        });
        toast.success("Testimonial deleted successfully");
        fetchTestimonials(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete testimonial");
      }
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error(error.message || "Failed to delete testimonial");
    }
  };

  const handleTogglePublish = async (testimonial: Testimonial) => {
    try {
      const result = await adminTestimonialService.togglePublish(testimonial.id, !testimonial.isPublished);
      if (result.success) {
        await log({
          action: testimonial.isPublished ? ActivityActions.UNPUBLISH : ActivityActions.PUBLISH,
          entityType: ActivityEntityTypes.TESTIMONIAL,
          entityId: testimonial.id,
          entityTitle: testimonial.name,
          details: `${testimonial.isPublished ? 'Unpublished' : 'Published'} testimonial from ${testimonial.name}`,
        });
        toast.success(testimonial.isPublished ? "Testimonial unpublished" : "Testimonial published");
        fetchTestimonials(true);
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
    fetchTestimonials(true);
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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">⭐ Testimonials</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage member testimonials</p>
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
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Stats */}
      <TestimonialStats stats={stats} />

      {/* Table */}
      <TestimonialTable
        testimonials={testimonials}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
      />

      {/* Create/Edit Modal */}
      <CreateTestimonialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSave}
        editingTestimonial={editingTestimonial}
        isSaving={isSaving}
      />
    </div>
  );
}