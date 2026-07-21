"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { 
  adminEventService, 
  Event 
} from "@/lib/services/adminEventService";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import EventStats from "./EventStats";
import EventFilters from "./EventFilters";
import EventTable from "./EventTable";
import CreateEventModal from "./CreateEventModal";
import EventAttendeesModal from "./EventAttendeesModal";
import { adminCommunityService } from "@/lib/services/adminCommunityService";

export default function AdminEventsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const { log } = useActivityLogger();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0, totalAttendees: 0 });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Event[] | null>(null);

  const hasPermission = admin?.permissions?.includes('events') || admin?.role === 'super_admin';

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
    fetchEvents();
    fetchStats();
  }, [statusFilter]);

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

  const fetchEvents = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const result = await adminEventService.getAllEvents();
      if (result.success) {
        let filtered = result.events;
        if (statusFilter !== 'all') {
          filtered = filtered.filter(e => e.status === statusFilter);
        }
        setEvents(filtered);
      } else {
        toast.error(result.error || "Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await adminEventService.getEventStats();
      setStats(result);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      fetchEvents();
      return;
    }
    setLoading(true);
    try {
      const result = await adminEventService.searchEvents(searchTerm);
      if (result.success) {
        setSearchResults(result.events);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    setIsSaving(true);
    try {
      let result;
      
      if (editingEvent) {
        result = await adminEventService.updateEvent(editingEvent.id, formData);
        if (result.success) {
          await log({
            action: ActivityActions.UPDATE,
            entityType: ActivityEntityTypes.EVENT,
            entityId: editingEvent.id,
            entityTitle: formData.title,
            details: `Updated event: ${formData.title}`,
          });
        }
      } else {
        const createData = {
          ...formData,
          createdBy: admin?.uid || '',
          createdByAdminName: admin?.name || '',
        };
        result = await adminEventService.createEvent(createData);
        if (result.success) {
          await log({
            action: ActivityActions.CREATE,
            entityType: ActivityEntityTypes.EVENT,
            entityId: result.id,
            entityTitle: formData.title,
            details: `Created event: ${formData.title}`,
          });
        }
      }
      
      if (result.success) {
        toast.success(editingEvent ? "Event updated successfully" : "Event created successfully");
        setIsModalOpen(false);
        fetchEvents(true);
        fetchStats();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast.error(error.message || "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Delete event "${event.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminEventService.deleteEvent(event.id);
      if (result.success) {
        await log({
          action: ActivityActions.DELETE,
          entityType: ActivityEntityTypes.EVENT,
          entityId: event.id,
          entityTitle: event.title,
          details: `Deleted event: ${event.title}`,
        });
        toast.success("Event deleted successfully");
        fetchEvents(true);
        fetchStats();
      } else {
        toast.error(result.error || "Failed to delete event");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleViewAttendees = (event: Event) => {
    setSelectedEvent(event);
    setIsAttendeesModalOpen(true);
  };

  const handleRefresh = () => {
    fetchEvents(true);
    fetchStats();
  };

  const displayEvents = searchResults || events;

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
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">📅 Events</h1>
            <p className="text-sm text-[#6B5E5A] mt-1">Manage all events</p>
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
            Add Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <EventStats stats={stats} />

      {/* Filters */}
      <EventFilters
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
      <EventTable
        events={displayEvents}
        loading={loading}
        onViewAttendees={handleViewAttendees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        editingEvent={editingEvent}
        isSaving={isSaving}
        communities={communities}
      />

      {/* Attendees Modal */}
      <EventAttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => {
          setIsAttendeesModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}