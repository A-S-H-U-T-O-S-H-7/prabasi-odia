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
  memberId?: string;
  photoURL?: string;
}

export const maskName = (name: string): string => {
  if (!name || name.trim().length === 0) return "Member";
  
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return `${part}*`;
      const firstChar = part.charAt(0);
      const maskLength = Math.min(part.length - 1, 4);
      return `${firstChar}${'*'.repeat(maskLength)}`;
    })
    .join(" ");
};

export const getMemberTitle = (gender: string, name: string): string => {
  const masked = maskName(name);
  if (gender?.toLowerCase() === 'male') return `Mr. ${masked}`;
  if (gender?.toLowerCase() === 'female') return `Ms. ${masked}`;
  return masked;
};

export const mapService = {
  async getVerifiedMembersWithCoordinates(): Promise<MapMember[]> {
    const q = query(
      collection(db, "users"),
      where("isVerified", "==", true)
    );
    const snapshot = await getDocs(q);
    const members: MapMember[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      const lat = Number(data.currentLatitude);
      const lng = Number(data.currentLongitude);

      if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
        const displayName = data.displayName || "Member";
        members.push({
          id: docSnap.id,
          displayName,
          maskedName: maskName(displayName),
          currentCity: data.currentCity || "Unknown",
          currentState: data.currentState || "Unknown",
          currentCountry: data.currentCountry || "Unknown",
          age: typeof data.age === "number" ? data.age : null,
          gender: data.gender || "Unknown",
          lat,
          lng,
          isVerified: Boolean(data.isVerified),
          memberId: data.memberId || "",
          photoURL: data.photoURL || "",
        });
      }
    });

    return members;
  },

  async getMemberCount(): Promise<number> {
    const members = await this.getVerifiedMembersWithCoordinates();
    return members.length;
  },

  async getMembersByCity(city: string): Promise<MapMember[]> {
    const allMembers = await this.getVerifiedMembersWithCoordinates();
    return allMembers.filter(
      (member) => member.currentCity.toLowerCase() === city.toLowerCase()
    );
  },
};