"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useAuthStore, useUserStore } from "@/lib/store";
import { publicEventService, PublicEvent } from "@/lib/services/publicEventService";
import EventHero from "./EventHero";
import EventFilters from "./EventFilters";
import EventGrid from "./EventGrid";

export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { profile, hasJoinedCommunity } = useUserStore();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [totalAttendees, setTotalAttendees] = useState(0);

  const isVerified = profile?.isVerified || false;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await publicEventService.getEvents('all');
      if (result.success) {
        setEvents(result.events);
        setFilteredEvents(result.events);
        
        const total = result.events.reduce((sum, e) => sum + e.attendeeCount, 0);
        setTotalAttendees(total);
      } else {
        toast.error(result.error || "Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to RSVP");
      return;
    }
    
    if (!hasJoinedCommunity || !isVerified) {
      toast.error("Please complete your profile and get verified to RSVP");
      return;
    }

    try {
      const result = await publicEventService.rsvpEvent(eventId, user?.uid || '');
      if (result.success) {
        toast.success("Successfully RSVPed to the event!");
        setEvents(prev => prev.map(e => 
          e.id === eventId 
            ? { ...e, attendeeCount: e.attendeeCount + 1, attendees: [...(e.attendees || []), user?.uid || ''] }
            : e
        ));
        setFilteredEvents(prev => prev.map(e => 
          e.id === eventId 
            ? { ...e, attendeeCount: e.attendeeCount + 1, attendees: [...(e.attendees || []), user?.uid || ''] }
            : e
        ));
        setTotalAttendees(prev => prev + 1);
        fetchEvents();
      } else {
        toast.error(result.error || "Failed to RSVP");
      }
    } catch (error) {
      console.error("Error RSVPing:", error);
      toast.error("Failed to RSVP");
    }
  };

  const handleCancelRsvp = async (eventId: string) => {
    if (!isAuthenticated || !user?.uid) return;

    try {
      const result = await publicEventService.cancelRsvp(eventId, user.uid);
      if (result.success) {
        toast.success("RSVP cancelled");
        setEvents(prev => prev.map(e => 
          e.id === eventId 
            ? { ...e, attendeeCount: Math.max(0, e.attendeeCount - 1), attendees: e.attendees?.filter(id => id !== user.uid) || [] }
            : e
        ));
        setFilteredEvents(prev => prev.map(e => 
          e.id === eventId 
            ? { ...e, attendeeCount: Math.max(0, e.attendeeCount - 1), attendees: e.attendees?.filter(id => id !== user.uid) || [] }
            : e
        ));
        setTotalAttendees(prev => Math.max(0, prev - 1));
        fetchEvents();
      } else {
        toast.error(result.error || "Failed to cancel RSVP");
      }
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      toast.error("Failed to cancel RSVP");
    }
  };

  const hasUserRsvped = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user?.uid) return false;
    return event.attendees?.includes(user.uid) || false;
  };

  useEffect(() => {
    let filtered = events;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term) ||
        e.city.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6] py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors mb-3 md:mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        {/* Hero with Banner */}
        <EventHero 
          totalEvents={events.length} 
          upcomingEvents={upcomingEvents}
          totalAttendees={totalAttendees}
        />

        {/* Filters */}
        <div className="mt-6 md:mt-8">
          <EventFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {/* Results Count */}
        <div className="mt-4 md:mt-6 text-xs md:text-sm text-[#6B5E5A]">
          Showing {filteredEvents.length} of {events.length} events
        </div>

        {/* Grid */}
        <div className="mt-4 md:mt-6">
          <EventGrid
            events={filteredEvents}
            loading={loading}
            onRsvp={handleRsvp}
            onCancelRsvp={handleCancelRsvp}
            hasRsvped={hasUserRsvped}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified && hasJoinedCommunity}
          />
        </div>
      </div>
    </div>
  );
}