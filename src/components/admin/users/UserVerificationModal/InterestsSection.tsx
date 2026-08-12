"use client";

import { Sparkles } from "lucide-react";
import { UserData } from "@/lib/services/adminUserService";

interface InterestsSectionProps {
  user: UserData;
}

const interestMap: Record<string, { label: string; color: string }> = {
  volunteering: { label: "🤝 Volunteering", color: "bg-purple-100 text-purple-700" },
  bloodDonation: { label: "🩸 Blood Donation", color: "bg-red-100 text-red-700" },
  jobHelp: { label: "💼 Job Help", color: "bg-blue-100 text-blue-700" },
  socialAwareness: { label: "🌟 Social Awareness", color: "bg-orange-100 text-orange-700" },
  cleanlinessDrives: { label: "🧹 Cleanliness Drives", color: "bg-green-100 text-green-700" },
  culturalEvents: { label: "🎭 Cultural Events", color: "bg-amber-100 text-amber-700" },
  mentorship: { label: "📚 Mentorship", color: "bg-indigo-100 text-indigo-700" },
  startupNetworking: { label: "🚀 Startup Networking", color: "bg-teal-100 text-teal-700" },
};

export function InterestsSection({ user }: InterestsSectionProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
      <h4 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#6B1E5B]" />
        Interests
      </h4>
      <div className="flex flex-wrap gap-2">
        {user.interests && user.interests.length > 0 ? (
          user.interests.map((interest: string) => {
            const info = interestMap[interest];
            return info ? (
              <span key={interest} className={`text-xs px-3 py-1.5 rounded-full ${info.color}`}>
                {info.label}
              </span>
            ) : null;
          })
        ) : (
          <span className="text-sm text-[#6B5E5A]">No interests selected</span>
        )}
      </div>
    </div>
  );
}