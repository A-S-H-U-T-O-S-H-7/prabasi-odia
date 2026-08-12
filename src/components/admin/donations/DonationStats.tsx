"use client";

import { Heart, CheckCircle2, Clock3, IndianRupee } from "lucide-react";

interface DonationStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    totalAmount: number;
  };
}

export default function DonationStats({ stats }: DonationStatsProps) {
  const statCards = [
    {
      label: "Total Donations",
      value: stats.total,
      icon: Heart,
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
      format: "count" as const,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      format: "count" as const,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      color: "text-[#D9772B]",
      bg: "bg-[#D9772B]/5",
      format: "count" as const,
    },
    {
      label: "Total Received",
      value: stats.totalAmount,
      icon: IndianRupee,
      color: "text-[#6B1E5B]",
      bg: "bg-[#6B1E5B]/5",
      format: "currency" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const display =
          stat.format === "currency"
            ? `₹${Number(stat.value).toLocaleString("en-IN")}`
            : stat.value;

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
                <p className="text-2xl font-bold text-[#2A1636]">{display}</p>
                <p className="text-sm text-[#6B5E5A]">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
