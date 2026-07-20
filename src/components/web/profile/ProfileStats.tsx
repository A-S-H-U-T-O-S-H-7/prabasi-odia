"use client";

import { Calendar, Heart, Users, MapPin } from "lucide-react";

interface ProfileStatsProps {
  profile: any;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    { icon: Calendar, label: "Member Since", value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A" },
    { icon: Heart, label: "Interests", value: (profile.interests || []).length || 0 },
    { icon: Users, label: "Family Members", value: (profile.familyMembers || []).length || 0 },
    { icon: MapPin, label: "Location", value: profile.currentCity || "N/A" },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">📊 Stats</h3>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-[#D4C8C0]/10 last:border-0">
            <div className="flex items-center gap-2 text-[#6B5E5A] text-sm">
              <stat.icon className="w-4 h-4 text-[#6B1E5B]/60" />
              <span>{stat.label}</span>
            </div>
            <span className="text-sm font-semibold text-[#2A1636]">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}