"use client";

import { MessageSquare, CheckCircle, XCircle } from "lucide-react";

interface TestimonialStatsProps {
  stats: {
    total: number;
    published: number;
    unpublished: number;
  };
}

export default function TestimonialStats({ stats }: TestimonialStatsProps) {
  const statCards = [
    { 
      label: "Total Testimonials", 
      value: stats.total, 
      icon: MessageSquare, 
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