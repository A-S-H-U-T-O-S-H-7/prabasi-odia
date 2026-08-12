"use client";

import { User, CalendarDays, Heart, Droplet, Smartphone, Briefcase } from "lucide-react";
import { UserData } from "@/lib/services/adminUserService";

interface PersonalDetailsProps {
  user: UserData;
  formatDate: (date?: string) => string;
  calculateAge: (dob?: string) => number | null;
}

export function PersonalDetails({ user, formatDate, calculateAge }: PersonalDetailsProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
      <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-[#6B1E5B]" />
        Personal Details
      </h4>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> DOB
          </span>
          <span className="font-medium text-[#2A1636]">{formatDate(user.dob)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" /> Age
          </span>
          <span className="font-medium text-[#2A1636]">{user.age || calculateAge(user.dob) || "—"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5" /> Blood Group
          </span>
          <span className="font-medium text-[#2A1636]">{user.bloodGroup || "—"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Gender
          </span>
          <span className="font-medium text-[#2A1636] capitalize">{user.gender || "—"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </span>
          <span className="font-medium text-[#2A1636]">
            {user.mobileCountryCode ? `${user.mobileCountryCode} ` : ""}
            {user.phoneNumber || user.mobileNumber || "—"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B5E5A] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Occupation
          </span>
          <span className="font-medium text-[#2A1636]">{user.occupation || "—"}</span>
        </div>
      </div>
    </div>
  );
}