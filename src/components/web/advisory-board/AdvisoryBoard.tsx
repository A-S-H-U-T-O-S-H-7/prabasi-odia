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
import { ADVISORY_CATEGORIES, normalizeAdvisoryCategory } from "@/lib/advisoryCategories";

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

        {loading ? <AdvisoryBoardGrid members={[]} loading /> : (
          <div className="space-y-10">
            {ADVISORY_CATEGORIES.map((category) => {
              const group = members.filter((member) => normalizeAdvisoryCategory(member.category) === category.value);
              return <section key={category.value} aria-labelledby={`${category.value}-heading`}>
                <div className="mb-4 flex items-center justify-between border-b border-[#E7D7E8] pb-3">
                  <h2 id={`${category.value}-heading`} className="text-2xl font-serif font-bold text-[#2A1636]">{category.title}</h2>
                  <span className="rounded-full bg-[#6B1E5B]/10 px-3 py-1 text-xs font-medium text-[#6B1E5B]">{group.length} {group.length === 1 ? 'member' : 'members'}</span>
                </div>
                {group.length ? <AdvisoryBoardGrid members={group} /> : <p className="rounded-xl bg-white/70 p-5 text-sm text-[#6B5E5A]">Members will be announced soon.</p>}
              </section>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
