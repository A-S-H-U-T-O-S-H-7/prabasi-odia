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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

        {loading ? <AdvisoryBoardGrid members={[]} loading /> : (() => {
          const availableCategories = ADVISORY_CATEGORIES.filter((category) =>
            members.some((member) => normalizeAdvisoryCategory(member.category) === category.value)
          );
          const selectedCategory = availableCategories.find((category) => category.value === activeCategory) ?? availableCategories[0];
          const selectedMembers = selectedCategory
            ? members.filter((member) => normalizeAdvisoryCategory(member.category) === selectedCategory.value)
            : [];

          if (!selectedCategory) return null;

          return (
            <section aria-labelledby={`${selectedCategory.value}-heading`}>
              <div className="mb-5 flex flex-col gap-3 border-b border-[#E7D7E8] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <h2 id={`${selectedCategory.value}-heading`} className="text-2xl font-serif font-bold text-[#2A1636]">
                    {selectedCategory.title}
                  </h2>
                  <span className="rounded-full bg-[#6B1E5B]/10 px-3 py-1 text-xs font-medium text-[#6B1E5B]">
                    {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end" role="tablist" aria-label="Advisory member categories">
                  {availableCategories.map((category) => {
                    const isSelected = category.value === selectedCategory.value;
                    return (
                      <button
                        key={category.value}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveCategory(category.value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#6B1E5B] text-white shadow-sm'
                            : 'bg-white text-[#6B1E5B] ring-1 ring-[#6B1E5B]/20 hover:bg-[#6B1E5B]/10'
                        }`}
                      >
                        {category.role}
                      </button>
                    );
                  })}
                </div>
              </div>
              <AdvisoryBoardGrid members={selectedMembers} />
            </section>
          );
        })()}
      </div>
    </div>
  );
}
