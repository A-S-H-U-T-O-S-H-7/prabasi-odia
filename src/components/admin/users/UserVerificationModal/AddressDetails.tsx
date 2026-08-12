"use client";

import { Home, Globe } from "lucide-react";
import { UserData } from "@/lib/services/adminUserService";

interface AddressDetailsProps {
  user: UserData;
}

export function AddressDetails({ user }: AddressDetailsProps) {
  return (
    <>
      {/* Odisha Address */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
        <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
          <Home className="w-4 h-4 text-[#6B1E5B]" />
          Odisha Address
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-[#6B5E5A] text-xs">Address</p>
            <p className="font-medium text-[#2A1636]">{user.odishaHomeAddress || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">District</p>
            <p className="font-medium text-[#2A1636]">{user.odishaDistrict || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">City</p>
            <p className="font-medium text-[#2A1636]">{user.odishaCity || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">PIN Code</p>
            <p className="font-medium text-[#2A1636]">{user.odishaPinCode || "—"}</p>
          </div>
        </div>
      </div>

      {/* Current Address */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
        <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#6B1E5B]" />
          Current Address
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-[#6B5E5A] text-xs">Address</p>
            <p className="font-medium text-[#2A1636]">{user.currentAddress || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">City</p>
            <p className="font-medium text-[#2A1636]">{user.currentCity || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">State</p>
            <p className="font-medium text-[#2A1636]">{user.currentState || "—"}</p>
          </div>
          <div>
            <p className="text-[#6B5E5A] text-xs">PIN Code</p>
            <p className="font-medium text-[#2A1636]">{user.currentPinCode || "—"}</p>
          </div>
        </div>
      </div>
    </>
  );
}