"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";

export default function CommunityDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<PublicCommunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCommunity = async () => {
      if (!params?.id) return;
      setLoading(true);
      const result = await publicCommunityService.getCommunityById(params.id);
      if (result.success && result.community) {
        setCommunity(result.community);
      } else {
        toast.error("Community not found");
        router.replace("/communities");
      }
      setLoading(false);
    };

    loadCommunity();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2]">
        <div className="w-8 h-8 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6] py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/communities")}
          className="flex items-center gap-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Communities</span>
        </button>

        <div className="bg-white/80 border border-[#E7D7E8] rounded-2xl overflow-hidden shadow-sm">
          <div className="relative w-full h-64 bg-[#F0EAE6]">
            {community.coverImage ? (
              <Image src={community.coverImage} alt={community.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🏘️</div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-serif font-bold text-[#2A1636]">{community.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#6B5E5A]">
              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {community.city}, {community.state}</span>
              <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {community.memberCount} members</span>
            </div>
            <p className="mt-4 text-[#6B5E5A] leading-relaxed">
              {community.description || "A vibrant community of Odias in this location."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
