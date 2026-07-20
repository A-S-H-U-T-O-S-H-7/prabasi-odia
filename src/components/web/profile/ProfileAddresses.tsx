"use client";

import { Home, MapPin } from "lucide-react";

export default function ProfileAddresses({ profile }: { profile: any }) {
  const odishaAddress = [profile.odishaHomeAddress, profile.odishaCity, profile.odishaDistrict, profile.odishaPinCode].filter(Boolean).join(", ");
  const currentAddress = [profile.currentAddress, profile.currentCity, profile.currentState, profile.currentPinCode].filter(Boolean).join(", ");

  return (
    <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-[#2A1636] mb-4">Addresses</h3>
      <div className="space-y-4">
        <AddressItem icon={<Home className="w-4 h-4 text-[#6B1E5B]" />} title="Odisha Home" value={odishaAddress} />
        <AddressItem icon={<MapPin className="w-4 h-4 text-[#D9772B]" />} title="Current Address" value={currentAddress} />
      </div>
    </section>
  );
}

function AddressItem({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="flex gap-3 rounded-xl border border-[#D4C8C0]/20 bg-white/50 p-3"><div className="mt-0.5">{icon}</div><div><p className="text-xs font-medium text-[#6B5E5A]">{title}</p><p className="mt-0.5 text-sm leading-6 text-[#2A1636]">{value || "Not provided"}</p></div></div>;
}
