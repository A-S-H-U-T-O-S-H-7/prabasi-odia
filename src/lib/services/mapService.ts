import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface MapMember {
  id: string;
  displayName: string;
  maskedName: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  age: number | null;
  gender: string;
  lat: number;
  lng: number;
  isVerified: boolean;
}

const maskName = (name: string) => {
  if (!name) return "Member";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => (part.length <= 1 ? `${part}*` : `${part[0]}${"*".repeat(Math.min(part.length - 1, 4))}`))
    .join(" ");
};

export const mapService = {
  async getVerifiedMembersWithCoordinates(): Promise<MapMember[]> {
    const q = query(collection(db, "users"), where("isVerified", "==", true));
    const snapshot = await getDocs(q);
    const members: MapMember[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const lat = Number(data.currentLatitude);
      const lng = Number(data.currentLongitude);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        members.push({
          id: docSnap.id,
          displayName: data.displayName || "Member",
          maskedName: maskName(data.displayName || "Member"),
          currentCity: data.currentCity || "Unknown",
          currentState: data.currentState || "Unknown",
          currentCountry: data.currentCountry || "Unknown",
          age: typeof data.age === "number" ? data.age : null,
          gender: data.gender || "Unknown",
          lat,
          lng,
          isVerified: Boolean(data.isVerified),
        });
      }
    });

    return members;
  },
};
