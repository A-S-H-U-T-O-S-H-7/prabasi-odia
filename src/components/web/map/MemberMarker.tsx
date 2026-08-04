"use client";

import { Marker, Popup } from "react-leaflet";
import { MapMember } from "@/lib/services/mapService";

interface MemberMarkerProps {
  member: MapMember;
}

export default function MemberMarker({ member }: MemberMarkerProps) {
  return (
    <Marker position={[member.lat, member.lng]}>
      <Popup>
        <div className="text-sm min-w-[150px]">
          <p className="font-semibold text-[#2A1636]">{member.maskedName}</p>
          <p className="text-[#6B5E5A]">{member.currentCity}, {member.currentState}</p>
          <p className="text-[#6B5E5A]">{member.currentCountry}</p>
          <p className="text-xs text-[#6B5E5A] mt-1">Gender: {member.gender}</p>
          {member.age !== null && <p className="text-xs text-[#6B5E5A]">Age: {member.age}</p>}
        </div>
      </Popup>
    </Marker>
  );
}
