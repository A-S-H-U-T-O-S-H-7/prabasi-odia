"use client";

import { motion } from "framer-motion";
import { Calendar, CalendarDays, Users } from "lucide-react";

interface EventHeroProps {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
}

export default function EventHero({ totalEvents, upcomingEvents, totalAttendees }: EventHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2A1636]">
        <span className="text-[#6B1E5B]">Events</span> & Gatherings
      </h1>
      <p className="text-lg text-[#6B5E5A] mt-4 max-w-2xl mx-auto">
        Discover Odia events happening near you. Connect, celebrate, and grow together.
      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#6B1E5B]" />
          <span className="text-sm text-[#6B5E5A]">
            <span className="font-bold text-[#2A1636]">{totalEvents}</span> Total Events
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#6B1E5B]" />
          <span className="text-sm text-[#6B5E5A]">
            <span className="font-bold text-[#2A1636]">{upcomingEvents}</span> Upcoming
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6B1E5B]" />
          <span className="text-sm text-[#6B5E5A]">
            <span className="font-bold text-[#2A1636]">{totalAttendees}</span> Attendees
          </span>
        </div>
      </div>
    </motion.div>
  );
}