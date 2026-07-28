"use client";

import { User } from "lucide-react";

interface FamilyMember {
  name: string;
  age?: number;
  relation: string;
  occupation?: string;
}

interface ProfileFamilyProps {
  familyMembers: FamilyMember[];
}

export default function ProfileFamily({ familyMembers }: ProfileFamilyProps) {
  // Filter out empty family members
  const validMembers = familyMembers.filter(m => m.name && m.name.trim() !== "");

  if (!validMembers || validMembers.length === 0) {
    return null; // Don't show the section at all if no family members
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#2A1636]">👨‍👩‍👧‍👦 Family</h3>
        <span className="text-xs text-[#6B5E5A]">{validMembers.length} members</span>
      </div>
      <div className="space-y-2">
        {validMembers.map((member, index) => (
          <div key={index} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 border border-[#D4C8C0]/20">
            <div className="w-8 h-8 rounded-full bg-[#6B1E5B]/10 flex items-center justify-center">
              <User className="w-4 h-4 text-[#6B1E5B]/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2A1636]">{member.name}</p>
              <p className="text-xs text-[#6B5E5A]">
                {member.relation || "Family"} 
                {member.age && ` • ${member.age} yrs`}
                {member.occupation && ` • ${member.occupation}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}