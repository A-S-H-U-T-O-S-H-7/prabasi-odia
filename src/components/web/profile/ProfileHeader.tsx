"use client";

import { User, MapPin, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProfileHeaderProps {
  profile: any;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg overflow-hidden">
      {/* Cover Image - Static */}
      <div className="h-32 sm:h-40 relative">
        <Image
          src="/loginbg3.png"
          alt="Cover"
          fill
          className="object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B1E5B]/40 via-[#8A2E72]/20 to-[#D9772B]/40" />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 gap-4 mt-2">
          {/* Avatar */}
          <div className="relative">
            {profile.photoURL && !imgError ? (
              <Image
                src={profile.photoURL}
                alt={profile.displayName || "User"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                onError={() => setImgError(true)}
                unoptimized={profile.photoURL.includes('firebasestorage')}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {profile.displayName?.charAt(0) || "U"}
                </span>
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name & Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-serif font-bold text-[#2A1636]">
                {profile.displayName || "User"}
              </h1>
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
              {profile.memberId && (
                <span className="text-sm text-[#6B5E5A] font-medium">
                  ID: {profile.memberId}
                </span>
              )}
            </div>
            {profile.currentCity && (
              <p className="text-sm text-[#6B5E5A] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {profile.currentCity}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}