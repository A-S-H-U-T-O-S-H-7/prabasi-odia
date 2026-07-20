"use client";

import { Briefcase, Building, Pencil } from "lucide-react";
import { useState } from "react";

interface ProfileAboutProps {
  profile: any;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {

  return (
    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      
      <div className="space-y-3">
        {profile.occupation && (
          <div className="flex items-center gap-3 text-sm">
            <Briefcase className="w-4 h-4 text-[#6B1E5B]/60" />
            <div>
              <p className="text-[#6B5E5A]">Occupation</p>
              <p className="font-medium text-[#2A1636]">{profile.occupation}</p>
            </div>
          </div>
        )}
        {profile.organization && (
          <div className="flex items-center gap-3 text-sm">
            <Building className="w-4 h-4 text-[#6B1E5B]/60" />
            <div>
              <p className="text-[#6B5E5A]">Organization</p>
              <p className="font-medium text-[#2A1636]">{profile.organization}</p>
            </div>
          </div>
        )}
        {profile.odishaDistrict && (
          <div className="flex items-center gap-3 text-sm">
            <Building className="w-4 h-4 text-[#6B1E5B]/60" />
            <div>
              <p className="text-[#6B5E5A]">Home District</p>
              <p className="font-medium text-[#2A1636]">{profile.odishaDistrict}</p>
            </div>
          </div>
        )}
        {!profile.occupation && !profile.organization && !profile.odishaDistrict && (
          <p className="text-sm text-[#6B5E5A] italic">No additional information provided</p>
        )}
      </div>
    </div>
  );
}