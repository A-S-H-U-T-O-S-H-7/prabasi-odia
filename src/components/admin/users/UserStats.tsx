"use client";

import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface UserStatsProps {
  stats: {
    total: number;
    pending: number;
    verified: number;
  };
}

export default function UserStats({ stats }: UserStatsProps) {
  const statCards = [
    { 
      label: "Total Users", 
      value: stats.total, 
      icon: Users, 
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
    },
    { 
      label: "Pending Verification", 
      value: stats.pending, 
      icon: Clock, 
      color: "text-[#D9772B]",
      bg: "bg-[#D9772B]/5",
    },
    { 
      label: "Verified Members", 
      value: stats.verified, 
      icon: CheckCircle, 
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2A1636]">{stat.value}</p>
                <p className="text-sm text-[#6B5E5A]">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}