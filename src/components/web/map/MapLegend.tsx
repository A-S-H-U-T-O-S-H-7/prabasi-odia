"use client";

interface MapLegendProps {
  totalMembers: number;
  visibleMembers: number;
}

export default function MapLegend({ totalMembers, visibleMembers }: MapLegendProps) {
  return (
    <div className="p-4 rounded-2xl border border-[#E7D7E8] bg-white/80 text-sm text-[#6B5E5A]">
      <p className="font-semibold text-[#2A1636] mb-1">Member Map Legend</p>
      <p>Total verified members with coordinates: <span className="font-semibold text-[#6B1E5B]">{totalMembers}</span></p>
      <p>Currently visible on map: <span className="font-semibold text-[#D9772B]">{visibleMembers}</span></p>
      <p className="text-xs mt-2">Member names are privacy-protected on this public map.</p>
    </div>
  );
}
