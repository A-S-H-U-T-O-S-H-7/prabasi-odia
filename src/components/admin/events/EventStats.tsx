"use client";

import { Calendar, CalendarDays, CheckCircle, Clock, XCircle, Users } from "lucide-react";

interface EventStatsProps {
  stats: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    totalAttendees: number;
  };
}

export default function EventStats({ stats }: EventStatsProps) {
  const statCards = [
    { 
      label: "Total Events", 
      value: stats.total, 
      icon: Calendar, 
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
    },
    { 
      label: "Upcoming", 
      value: stats.upcoming, 
      icon: CalendarDays, 
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    { 
      label: "Ongoing", 
      value: stats.ongoing, 
      icon: Clock, 
      color: "text-[#D9772B]",
      bg: "bg-[#D9772B]/5",
    },
    { 
      label: "Completed", 
      value: stats.completed, 
      icon: CheckCircle, 
      color: "text-green-600",
      bg: "bg-green-50",
    },
    { 
      label: "Total Attendees", 
      value: stats.totalAttendees, 
      icon: Users, 
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-[#2A1636]">{stat.value}</p>
                <p className="text-xs text-[#6B5E5A]">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}