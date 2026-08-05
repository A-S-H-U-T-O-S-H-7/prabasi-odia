"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users as UsersIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PublicEvent } from "@/lib/services/publicEventService";

interface CommunityEventsListProps {
  events: PublicEvent[];
  isLoading: boolean;
}

export default function CommunityEventsList({ events, isLoading }: CommunityEventsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="w-16 h-16 text-[#D4C8C0] mb-4" />
        <h4 className="text-lg font-semibold text-[#2A1636]">No Upcoming Events</h4>
        <p className="text-sm text-[#6B5E5A] mt-2 max-w-xs">
          This community hasn't planned any events yet. Check back later!
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'ongoing':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'completed':
        return 'border-gray-200 bg-gray-50 text-gray-600';
      case 'cancelled':
        return 'border-red-200 bg-red-50 text-red-600';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="group bg-white/80 backdrop-blur-sm rounded-xl border border-[#E7D7E8]/50 hover:border-[#6B1E5B]/20 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Date Badge */}
            <div className="flex-shrink-0 sm:w-24 p-4 sm:p-3 flex sm:flex-col items-center sm:items-center justify-between sm:justify-center bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5">
              <span className="text-2xl font-bold text-[#6B1E5B]">
                {new Date(event.date).getDate()}
              </span>
              <span className="text-sm font-medium text-[#6B5E5A]">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-xs text-[#6B5E5A]/60">
                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric' })}
              </span>
            </div>

            {/* Event Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors truncate">
                    {event.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-[#6B5E5A]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(event.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </span>
                    {event.attendeeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3.5 h-3.5" />
                        {event.attendeeCount}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(event.status)} flex-shrink-0`}>
                  {event.status}
                </span>
              </div>

              {event.description && (
                <p className="text-sm text-[#6B5E5A] mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E7D7E8]/30">
                <span className="text-xs text-[#6B5E5A]/60">
                  {event.communityName || 'Community Event'}
                </span>
                <Link
                  href={`/events/${event.id}`}
                  className="text-sm font-medium text-[#6B1E5B] hover:text-[#D9772B] transition-colors flex items-center gap-1 group-hover:gap-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}