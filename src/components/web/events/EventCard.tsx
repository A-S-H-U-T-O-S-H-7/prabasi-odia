"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Building2, Sparkles } from "lucide-react";
import { PublicEvent } from "@/lib/services/publicEventService";

interface EventCardProps {
  event: PublicEvent;
  index: number;
  onRsvp?: (id: string) => void;
  onCancelRsvp?: (id: string) => void;
  hasRsvped?: boolean;
  isAuthenticated?: boolean;
  isVerified?: boolean;
}

export default function EventCard({
  event,
  index,
  onRsvp,
  onCancelRsvp,
  hasRsvped = false,
  isAuthenticated = false,
  isVerified = false,
}: EventCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">📅 Upcoming</span>;
      case 'ongoing':
        return <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20">🔄 Ongoing</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">✅ Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">❌ Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Cover Image */}
        <div className="sm:w-28 md:w-32 h-28 md:h-32 rounded-xl bg-gradient-to-r from-[#6B1E5B]/10 to-[#D9772B]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {event.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">🎉</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-bold text-[#2A1636] truncate group-hover:text-[#6B1E5B] transition-colors">
                {event.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs md:text-sm text-[#6B5E5A] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {event.communityName || 'Community'}
                </span>
                {getStatusBadge(event.status)}
              </div>
            </div>
            <div className="text-xs md:text-sm text-[#6B5E5A] whitespace-nowrap flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {event.attendeeCount || 0}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-[#6B5E5A] mt-1.5 md:mt-2 line-clamp-2">
            {event.description || "Join us for this community event!"}
          </p>

          {/* Details */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2 md:mt-3 text-xs text-[#6B5E5A]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.time || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}, {event.city}</span>
            </div>
          </div>

          {/* RSVP Button */}
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#E7D7E8]/30">
            {isAuthenticated && isVerified ? (
              hasRsvped ? (
                <button
                  onClick={() => onCancelRsvp?.(event.id)}
                  className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-red-100 text-red-700 text-xs md:text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Cancel RSVP
                </button>
              ) : (
                <button
                  onClick={() => onRsvp?.(event.id)}
                  className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white text-xs md:text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  RSVP Now
                </button>
              )
            ) : (
              <div className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-[#D4C8C0] text-white text-xs md:text-sm font-medium text-center">
                {isAuthenticated ? "Verify to RSVP" : "Login to RSVP"}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}