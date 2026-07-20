"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";

interface ProfileActivityProps {
  profile: any;
}

export default function ProfileActivity({ profile }: ProfileActivityProps) {
  const activities = [];

  if (profile.createdAt) {
    activities.push({
      icon: CheckCircle2,
      label: "Joined Prabasi Odia",
      date: new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      color: "text-green-500"
    });
  }

  if (profile.hasJoinedCommunity) {
    activities.push({
      icon: CheckCircle2,
      label: "Completed Community Registration",
      date: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
      color: "text-blue-500"
    });
  }

  if (profile.isVerified) {
    activities.push({
      icon: CheckCircle2,
      label: "Identity Verified",
      date: profile.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
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
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 p-1 rounded-full ${activity.color} bg-opacity-10`}>
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2A1636]">{activity.label}</p>
              <p className="text-xs text-[#6B5E5A] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}