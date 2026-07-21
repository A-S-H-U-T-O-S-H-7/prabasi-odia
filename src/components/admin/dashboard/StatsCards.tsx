"use client";

import { Users, Shield, Clock, Building2, CalendarDays, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    pendingUsers: number;
    totalCommunities: number;
    totalEvents: number;
    totalNotices: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    { 
      label: "Total Users", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
      border: "border-[#6B1E5B]/20",
    },
    { 
      label: "Verified", 
      value: stats.verifiedUsers, 
      icon: Shield, 
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    { 
      label: "Pending Verification", 
      value: stats.pendingUsers, 
      icon: Clock, 
      color: "text-[#D9772B]",
      bg: "bg-[#D9772B]/5",
      border: "border-[#D9772B]/20",
    },
    { 
      label: "Communities", 
      value: stats.totalCommunities, 
      icon: Building2, 
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    { 
      label: "Events", 
      value: stats.totalEvents, 
      icon: CalendarDays, 
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    { 
      label: "Notices", 
      value: stats.totalNotices, 
      icon: FileText, 
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/70 backdrop-blur-sm rounded-2xl border ${stat.border} p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-[#2A1636] mt-2">{stat.value}</p>
              <p className="text-xs text-[#6B5E5A] truncate w-full">{stat.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}