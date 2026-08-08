"use client";

import { Calendar, Heart, Users, MapPin } from "lucide-react";

interface ProfileStatsProps {
  profile: any;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  // Format date to show "08 Aug 2026" format
  const formatMemberSince = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "N/A";
    }
  };

  // Count actual family members with names
  const familyCount = profile.familyMembers 
    ? profile.familyMembers.filter((m: any) => m.name && m.name.trim() !== "").length 
    : 0;

  const stats = [
    { icon: Calendar, label: "Member Since", value: formatMemberSince(profile.createdAt) },
    { icon: Heart, label: "Interests", value: (profile.interests || []).length || 0 },
    { icon: Users, label: "Family Members", value: familyCount },
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