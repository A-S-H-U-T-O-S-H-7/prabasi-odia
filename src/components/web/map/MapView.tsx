"use client";

import { useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapMember } from "@/lib/services/mapService";
import MemberMarker from "@/components/web/map/MemberMarker";
import MapFilters from "@/components/web/map/MapFilters";
import MapLegend from "@/components/web/map/MapLegend";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  members: MapMember[];
}

export default function MapView({ members }: MapViewProps) {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("all");

  const countries = useMemo(
    () => [...new Set(members.map((m) => m.currentCountry).filter(Boolean))].sort(),
    [members]
  );

  const states = useMemo(() => {
    const source = selectedCountry === "all"
      ? members
      : members.filter((m) => m.currentCountry === selectedCountry);
    return [...new Set(source.map((m) => m.currentState).filter(Boolean))].sort();
  }, [members, selectedCountry]);

  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const byCountry = selectedCountry === "all" || member.currentCountry === selectedCountry;
        const byState = selectedState === "all" || member.currentState === selectedState;
        return byCountry && byState;
      }),
    [members, selectedCountry, selectedState]
  );

  return (
    <div className="space-y-4">
      <MapFilters
        countries={countries}
        states={states}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        onCountryChange={(value) => {
          setSelectedCountry(value);
          setSelectedState("all");
        }}
        onStateChange={setSelectedState}
      />

      <MapLegend totalMembers={members.length} visibleMembers={filteredMembers.length} />

      <div className="h-[65vh] rounded-2xl overflow-hidden border border-[#E7D7E8]">
        <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredMembers.map((member) => (
            <MemberMarker key={member.id} member={member} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
