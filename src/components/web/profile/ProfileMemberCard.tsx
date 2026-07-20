"use client";

import { Download, CheckCircle, User, MapPin } from "lucide-react";
import { useState } from "react";

interface ProfileMemberCardProps {
  profile: any;
}

export default function ProfileMemberCard({ profile }: ProfileMemberCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">💳 Member Card</h3>
      
      <div className="relative bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] rounded-2xl p-5 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/10" />
        </div>

        {/* Card Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs opacity-80 font-medium">Prabasi Odia</p>
              <p className="text-lg font-bold mt-1">{profile.displayName || "Member"}</p>
            </div>
            {profile.isVerified && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span className="text-[10px] font-medium">Verified</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-xs opacity-70">Member ID</p>
              <p className="text-sm font-mono font-medium">{profile.memberId || "Pending"}</p>
              {profile.currentCity && (
                <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.currentCity}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">Blood Group</p>
              <p className="text-sm font-bold">{profile.bloodGroup || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B1E5B] text-white text-sm font-medium hover:bg-[#531547] transition-colors disabled:opacity-50"
      >
        {isDownloading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Downloading...
          </span>
        ) : (
          <>
            <Download className="w-4 h-4" /> Download Member Card
          </>
        )}
      </button>
    </div>
  );
}