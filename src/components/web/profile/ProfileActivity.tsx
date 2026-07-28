"use client";

import { CheckCircle2, Clock } from "lucide-react";

interface ProfileActivityProps {
  profile: any;
}

export default function ProfileActivity({ profile }: ProfileActivityProps) {
  const activities = [];

  // Format date to show Day, Month Date, Year (e.g., "Thursday, July 15, 2026")
  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return "Recently";
    }
  };

  // Format date for display (Month Year format)
  const formatMonthYear = (dateString: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return "Recently";
    }
  };

  if (profile.createdAt) {
    activities.push({
      icon: CheckCircle2,
      label: "Joined Prabasi Odia",
      date: formatDate(profile.createdAt),
      monthYear: formatMonthYear(profile.createdAt),
      fullDate: formatDate(profile.createdAt),
      color: "text-green-500"
    });
  }

  if (profile.hasJoinedCommunity) {
    activities.push({
      icon: CheckCircle2,
      label: "Completed Community Registration",
      date: profile.updatedAt ? formatDate(profile.updatedAt) : "Recently",
      monthYear: profile.updatedAt ? formatMonthYear(profile.updatedAt) : "Recently",
      fullDate: profile.updatedAt ? formatDate(profile.updatedAt) : "Recently",
      color: "text-blue-500"
    });
  }

  if (profile.isVerified) {
    activities.push({
      icon: CheckCircle2,
      label: "Identity Verified",
      date: profile.verifiedAt ? formatDate(profile.verifiedAt) : "Recently",
      monthYear: profile.verifiedAt ? formatMonthYear(profile.verifiedAt) : "Recently",
      fullDate: profile.verifiedAt ? formatDate(profile.verifiedAt) : "Recently",
      color: "text-purple-500"
    });
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-4">📅 Activity</h3>
        <p className="text-sm text-[#6B5E5A] italic">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">📅 Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full ${activity.color} bg-opacity-10`}>
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2A1636]">{activity.label}</p>
              <p className="text-xs text-[#6B5E5A] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> {activity.fullDate || activity.date || activity.monthYear}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}