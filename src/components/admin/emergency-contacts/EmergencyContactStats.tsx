"use client";

import { Phone, CheckCircle, XCircle } from "lucide-react";

interface EmergencyContactStatsProps {
  stats: { total: number; active: number; inactive: number };
}

export default function EmergencyContactStats({ stats }: EmergencyContactStatsProps) {
  const cards = [
    { label: "Total Contacts", value: stats.total, icon: Phone, color: "text-[#6B1E5B]", bg: "bg-[#6B1E5B]/5" },
    { label: "Active", value: stats.active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Inactive", value: stats.inactive, icon: XCircle, color: "text-[#D9772B]", bg: "bg-[#D9772B]/5" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-sm"
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
