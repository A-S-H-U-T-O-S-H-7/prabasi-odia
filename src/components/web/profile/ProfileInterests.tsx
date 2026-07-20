"use client";

interface ProfileInterestsProps {
  interests: string[];
}

const interestColors: Record<string, { bg: string; text: string; icon: string }> = {
  volunteering: { bg: "bg-purple-50", text: "text-purple-700", icon: "🤝" },
  bloodDonation: { bg: "bg-red-50", text: "text-red-700", icon: "🩸" },
  jobHelp: { bg: "bg-blue-50", text: "text-blue-700", icon: "💼" },
  socialAwareness: { bg: "bg-orange-50", text: "text-orange-700", icon: "🌟" },
  cleanlinessDrives: { bg: "bg-green-50", text: "text-green-700", icon: "🧹" },
  culturalEvents: { bg: "bg-amber-50", text: "text-amber-700", icon: "🎭" },
  mentorship: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "📚" },
  startupNetworking: { bg: "bg-teal-50", text: "text-teal-700", icon: "🚀" },
};

const interestLabels: Record<string, string> = {
  volunteering: "Volunteering",
  bloodDonation: "Blood Donation",
  jobHelp: "Job Help / Referrals",
  socialAwareness: "Social Awareness",
  cleanlinessDrives: "Cleanliness Drives",
  culturalEvents: "Cultural Events",
  mentorship: "Mentorship",
  startupNetworking: "Startup Networking",
};

export default function ProfileInterests({ interests }: ProfileInterestsProps) {
  if (!interests || interests.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-4">🎯 Interests</h3>
        <p className="text-sm text-[#6B5E5A] italic">No interests added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">🎯 Interests</h3>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest) => {
          const color = interestColors[interest] || { bg: "bg-gray-50", text: "text-gray-700", icon: "✨" };
          const label = interestLabels[interest] || interest;
          return (
            <span
              key={interest}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
            >
              <span>{color.icon}</span> {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}