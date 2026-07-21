"use client";

import { PublicEvent } from "@/lib/services/publicEventService";
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface EventGridProps {
  events: PublicEvent[];
  loading?: boolean;
  onRsvp?: (id: string) => void;
  onCancelRsvp?: (id: string) => void;
  hasRsvped?: (id: string) => boolean;
  isAuthenticated?: boolean;
  isVerified?: boolean;
}

export default function EventGrid({
  events,
  loading = false,
  onRsvp,
  onCancelRsvp,
  hasRsvped,
  isAuthenticated = false,
  isVerified = false,
}: EventGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/70 rounded-2xl border border-[#E7D7E8]/50 p-6 shadow-sm animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-32 h-32 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Calendar className="w-16 h-16 text-[#6B5E5A]/30 mx-auto" />
        <h3 className="text-xl font-semibold text-[#2A1636] mt-4">No events found</h3>
        <p className="text-[#6B5E5A] mt-2">Try adjusting your search or filters</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          index={index}
          onRsvp={onRsvp}
          onCancelRsvp={onCancelRsvp}
          hasRsvped={hasRsvped?.(event.id)}
          isAuthenticated={isAuthenticated}
          isVerified={isVerified}
        />
      ))}
    </div>
  );
}