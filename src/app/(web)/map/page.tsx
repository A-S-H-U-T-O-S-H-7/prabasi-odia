"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { mapService, MapMember } from "@/lib/services/mapService";

const MapView = dynamic(() => import("@/components/web/map/MapView"), { ssr: false });

export default function MemberMapPage() {
  const [members, setMembers] = useState<MapMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      const data = await mapService.getVerifiedMembersWithCoordinates();
      setMembers(data);
      setLoading(false);
    };
    loadMembers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2A1636]">Member Map</h1>
        <p className="text-sm text-[#6B5E5A] mt-1">
          Verified Prabasi members across locations (privacy-protected view).
        </p>

        <div className="mt-5">
          {loading ? (
            <div className="h-[60vh] rounded-2xl border border-[#E7D7E8] bg-white/70 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MapView members={members} />
          )}
        </div>
      </div>
    </div>
  );
}
