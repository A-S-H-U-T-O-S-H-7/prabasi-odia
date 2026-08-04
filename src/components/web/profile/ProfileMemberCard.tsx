"use client";

import Image from "next/image";
import { Download, CheckCircle, MapPin, Calendar, Droplet, IdCard } from "lucide-react";
import { useState, type CSSProperties } from "react";

interface ProfileMemberCardProps {
  profile: any;
}

// Theme drawn from the same Pattachitra / temple palette as the rest of the site
const THEME = {
  primary: "#4A1942",
  terracotta: "#C1440E",
  gold: "#E8A33D",
};

// --- STYLE FIXES ---
// 1. For DARK text (labels, "Member ID", "Blood Group"):
// This creates a thick solid white shadow behind the text for absolute readability.
const darkTextHalo: CSSProperties = {
  textShadow: "0 0 4px white, 0 0 4px white, 0 0 8px white, 0 0 12px white",
};

// 2. For BOLD text (Name, Values, ID Number):
// This creates a soft glow around the text, making dark letters pop on any background.
const boldTextHalo: CSSProperties = {
  textShadow:
    "0 0 6px rgba(255,255,255,0.9), 0 0 3px rgba(255,255,255,0.9), 0 1px 2px rgba(255,255,255,0.8)",
};

// 3. Function to format date nicely (Matches your ProfileActivity)
const formatMemberDate = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return "";
  }
};

export default function ProfileMemberCard({ profile }: ProfileMemberCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1500);
  };

  // Pre-calculate formatted date
  const joinedDate = formatMemberDate(profile?.createdAt);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm w-full mx-auto">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">Member Card</h3>

      {/* --- CARD AREA --- */}
      <div className="relative w-full aspect-[7/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">

        {/* Background layer - RIGHT ALIGNED */}
        <div className="absolute inset-0 bg-[#F7F1E3] overflow-hidden">
          <Image
            src="/odisha.png"
            alt="Odisha"
            fill
            className="object-contain  scale-105 blur-[1px]"
            sizes="(max-width: 768px) 100vw, 1024px"
            priority
          />
          {/* REVERSED Gradient: Solid Cream on Left, Fades to Transparent on Right to show Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7F1E3]/95 via-[#F7F1E3]/40 to-transparent" />
        </div>

        {/* --- TOP CENTER: Prabasi Odia icon + wordmark --- */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-3.5">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-white/60 rounded-full pl-2 pr-4 py-1.5 shadow-lg">
            <div className="relative h-6 w-6 shrink-0 rounded-full overflow-hidden bg-white">
              <Image src="/logoicon.png" alt="" fill className="object-contain" />
            </div>
            <span
              className="text-sm font-bold tracking-wide font-serif"
              style={{ color: THEME.primary }}
            >
              Prabasi Odia
            </span>
          </div>
        </div>

        {/* --- BOTTOM RIGHT CORNER: issuer credit --- */}
        <div className="absolute bottom-3 right-3.5 z-20 flex items-center gap-2">
          <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full bg-white ring-2 ring-white/70 shadow-md overflow-hidden">
            <Image src="/svslogo.png" alt="Samudayik Vikas Samiti" fill className="object-contain p-1" sizes="36px" />
          </div>
          <div className="leading-tight text-left" style={boldTextHalo}>
            <p className="text-[7.5px] sm:text-[8px] tracking-wide uppercase font-semibold text-[#C1440E]">
              Issued by
            </p>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase leading-tight text-[#4A1942]">
              Samudayik Vikas Samiti
            </p>
          </div>
        </div>

        {/* --- MAIN CONTENT ROW --- */}
        <div className="relative z-10 h-full w-full flex items-center gap-4 sm:gap-5 px-4 sm:px-6 pt-14 pb-9">

          {/* LEFT — user photo */}
          <div className="shrink-0 self-center">
            <div className="relative w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] md:w-[112px] md:h-[112px] rounded-xl border-[3px] border-white shadow-lg overflow-hidden bg-white">
              {profile?.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile?.displayName || "Member"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-[#4A1942]/10 text-[#4A1942]">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                  profile?.isVerified
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white/80 border-[#DDD0BC] text-[#7A6A5E]"
                }`}
              >
                {profile?.isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Verified
                  </>
                ) : (
                  "Unverified"
                )}
              </span>
            </div>
          </div>

          {/* MIDDLE — name + detail lines */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Name with glow */}
            <h2
              className="text-xl sm:text-2xl md:text-[26px] font-bold tracking-tight leading-tight truncate font-serif text-[#4A1942]"
              style={boldTextHalo}
            >
              {profile?.displayName || "Member Name"}
            </h2>

            {/* Details with fixed visibility - Labels have darkTextHalo, Values have boldTextHalo */}
            <div className="space-y-1 text-[11px] sm:text-xs md:text-sm">
              
              <div className="flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Member ID —</span>
                <span className="font-mono font-medium text-[#2A1636]" style={boldTextHalo}>{profile?.memberId || "Pending"}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Blood Group —</span>
                <span className="font-semibold text-red-600" style={boldTextHalo}>{profile?.bloodGroup || "—"}</span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Location —</span>
                <span className="text-[#2A1636] truncate" style={boldTextHalo}>{profile?.currentCity || "Not set"}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#C1440E]" />
                <span className="text-[#2A1636] opacity-60" style={darkTextHalo}>Joined —</span>
                <span className="text-[#2A1636]" style={boldTextHalo}>
                  {joinedDate || "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        style={{ background: `linear-gradient(120deg, ${THEME.primary} 0%, ${THEME.terracotta} 100%)` }}
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 cursor-pointer disabled:cursor-not-allowed"
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