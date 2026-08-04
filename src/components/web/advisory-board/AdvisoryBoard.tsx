"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import {
  adminAdvisoryBoardService,
  AdvisoryBoardMember,
} from "@/lib/services/adminAdvisoryBoardService";
import AdvisoryBoardHero from "./AdvisoryBoardHero";
import AdvisoryBoardGrid from "./AdvisoryBoardGrid";

export default function AdvisoryBoardPage() {
  const router = useRouter();
  const [members, setMembers] = useState<AdvisoryBoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await adminAdvisoryBoardService.getActiveMembers();
      if (result.success) {
        setMembers(result.members);
      } else {
        toast.error(result.error || "Failed to load advisory board");
      }
    } catch (error) {
      console.error("Error fetching advisory board:", error);
      toast.error("Failed to load advisory board");
    } finally {
      setLoading(false);
    }
  };

  const featuredCount = members.filter((m) => m.featured).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6] py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors mb-3 md:mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        <AdvisoryBoardHero
          totalMembers={members.length}
          featuredCount={featuredCount}
        />

        <div className="mt-2 md:mt-4 mb-4 text-xs md:text-sm text-[#6B5E5A]">
          Hover a card to see more details
        </div>

        <AdvisoryBoardGrid members={members} loading={loading} />
      </div>
    </div>
  );
}
