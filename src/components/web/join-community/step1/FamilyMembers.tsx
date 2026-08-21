// components/web/join-community/step1/FamilyMembers.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useFormContext } from "react-hook-form";

interface FamilyMember {
  id: string;
  name: string;
  dob: string;
  relation: string;
}

const relations = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Uncle", "Aunt", "Nephew", "Niece", "Cousin", "Other"];

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

interface FamilyMembersProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: (members: FamilyMember[]) => void;
  familyAgeErrors: Record<string, boolean>;
  setFamilyAgeErrors: (errors: Record<string, boolean>) => void;
}

export default function FamilyMembers({ 
  familyMembers, 
  setFamilyMembers, 
  familyAgeErrors, 
  setFamilyAgeErrors 
}: FamilyMembersProps) {
  const { setValue } = useFormContext();

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: "", dob: "", relation: "" }]);
  };

  const removeFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const updateFamilyMember = (id: string, field: string, value: string) => {
    setFamilyMembers(familyMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

    if (field === "dob") {
      const age = calculateAge(value);
      if (age >= 18 && value) {
        setFamilyAgeErrors({ ...familyAgeErrors, [id]: true });
        toast.error(`Family member is ${age} years old. They need to join separately.`);
      } else {
        setFamilyAgeErrors({ ...familyAgeErrors, [id]: false });
      }
    }
  };

  const getFamilyMemberAge = (dob: string): number => calculateAge(dob);

  return (
    <div className="pt-4 border-t border-[#D4C8C0]/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#6B1E5B]/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-[#6B1E5B]" />
          </div>
          <h3 className="text-sm font-semibold text-[#2A1636]">Family Members</h3>
          <span className="text-xs text-[#6B5E5A]">(Optional)</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={addFamilyMember}
          className="flex items-center gap-1.5 text-sm text-[#6B1E5B] hover:text-[#531547] font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {familyMembers.map((member, index) => {
            const age = getFamilyMemberAge(member.dob);
            const isAdult = age >= 18 && !!member.dob;
            const memberKey = member.id || `family-fallback-${index}`;

            return (
              <motion.div
                key={memberKey}
                layout
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/60 border border-[#D4C8C0]/30 overflow-hidden"
              >
                <input
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateFamilyMember(memberKey, "name", e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                />
                <div>
                  <input
                    type="date"
                    placeholder="DOB"
                    value={member.dob}
                    onChange={(e) => updateFamilyMember(memberKey, "dob", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                  />
                  <div className="min-h-4 mt-1">
                    {member.dob && (
                      <p className={`text-[10px] flex items-center gap-1 ${isAdult ? "text-red-500" : "text-green-500"}`}>
                        {isAdult ? (
                          <>
                            <AlertCircle className="w-3 h-3" /> {age} yrs - must join separately
                          </>
                        ) : (
                          `${age} yrs`
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <select
                  value={member.relation}
                  onChange={(e) => updateFamilyMember(memberKey, "relation", e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm appearance-none h-fit"
                >
                  <option value="">Relation</option>
                  {relations.map((relation) => (
                    <option key={relation} value={relation}>
                      {relation}
                    </option>
                  ))}
                </select>
                {familyMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(memberKey)}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-[#D4C8C0]/40 text-[#6B5E5A] hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="text-[10px] text-[#6B5E5A] mt-2">Family members under 18 can be added. Members 18+ need to join separately.</p>
    </div>
  );
}