"use client";

import { CreditCard } from "lucide-react";
import { FaPassport } from "react-icons/fa";
import { UserData } from "@/lib/services/adminUserService";

interface IdDetailsProps {
  user: UserData;
}

export function IdDetails({ user }: IdDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Aadhar Box */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#6B1E5B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2A1636]">Aadhar Number</p>
            <p className="text-lg font-mono font-bold text-[#2A1636] tracking-wider">
              {user.aadharNumber || "—"}
            </p>
          </div>
        </div>
        {user.aadharNumber ? (
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">✅ Aadhar provided</div>
        ) : (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">⚠️ No Aadhar number provided</div>
        )}
      </div>

      {/* Passport Box */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9772B]/10 flex items-center justify-center">
            <FaPassport className="w-5 h-5 text-[#D9772B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2A1636]">Passport Number</p>
            <p className="text-lg font-mono font-bold text-[#2A1636] tracking-wider">
              {user.passportNumber || "—"}
            </p>
          </div>
        </div>
        {user.passportNumber ? (
          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">✅ Passport provided</div>
        ) : (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">⚠️ No passport number provided</div>
        )}
      </div>
    </div>
  );
}