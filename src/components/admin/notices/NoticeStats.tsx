"use client";

import { FileText, CheckCircle, XCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface NoticeStatsProps {
  stats: {
    total: number;
    published: number;
    unpublished: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
}

export default function NoticeStats({ stats }: NoticeStatsProps) {
  const statCards = [
    { 
      label: "Total Notices", 
      value: stats.total, 
      icon: FileText, 
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
    },
    { 
      label: "Published", 
      value: stats.published, 
      icon: CheckCircle, 
      color: "text-green-600",
      bg: "bg-green-50",
    },
    { 
      label: "Unpublished", 
      value: stats.unpublished, 
      icon: XCircle, 
      color: "text-[#D9772B]",
      bg: "bg-[#D9772B]/5",
    },
    { 
      label: "High Priority", 
      value: stats.highPriority, 
      icon: AlertTriangle, 
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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