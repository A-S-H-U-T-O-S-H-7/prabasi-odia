'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import {
  adminAdvisoryBoardService,
  type AdvisoryBoardMember,
} from '@/lib/services/adminAdvisoryBoardService';
import {
  ADVISORY_CATEGORIES,
  normalizeAdvisoryCategory,
  type AdvisoryCategory,
} from '@/lib/advisoryCategories';
import AdvisoryBoardHero from './AdvisoryBoardHero';
import AdvisoryBoardGrid from './AdvisoryBoardGrid';

export default function AdvisoryBoardPage() {
  const router = useRouter();
  const [members, setMembers] = useState<AdvisoryBoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<AdvisoryCategory | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const result = await adminAdvisoryBoardService.getActiveMembers();
        if (result.success) {
          setMembers(result.members);
        } else {
          toast.error(result.error || 'Failed to load advisory board');
        }
      } catch (error) {
        console.error('Error fetching advisory board:', error);
        toast.error('Failed to load advisory board');
      } finally {
        setLoading(false);
      }
    };

    void fetchMembers();
  }, []);

  const availableCategories = ADVISORY_CATEGORIES.filter((category) =>
    members.some((member) => normalizeAdvisoryCategory(member.category) === category.value)
  );
  const selectedCategory = availableCategories.find((category) => category.value === activeCategory)
    ?? availableCategories[0];
  const selectedMembers = selectedCategory
    ? members.filter((member) => normalizeAdvisoryCategory(member.category) === selectedCategory.value)
    : [];
  const featuredCount = members.filter((member) => member.featured).length;

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-2 py-3 sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#6B5E5A] transition-colors hover:text-[#6B1E5B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <AdvisoryBoardHero
          totalMembers={members.length}
          featuredCount={featuredCount}
          loading={loading}
        />

        <section aria-labelledby="advisory-heading">
          <div className="mb-6">
            <h2 id="advisory-heading" className="text-2xl font-bold text-[#2A1636]">
              Meet our advisory community
            </h2>
            <p className="mt-2 text-sm text-[#6B5E5A]">
              Explore the patrons, mentors, and advisors guiding Prabasi Odia.
            </p>
          </div>

          {loading ? (
            <AdvisoryBoardGrid members={[]} loading />
          ) : selectedCategory ? (
            <>
              <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Advisory member categories">
                {availableCategories.map((category, index) => {
                  const isSelected = category.value === selectedCategory.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls="advisory-panel"
                      id={`advisory-tab-${category.value}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setActiveCategory(category.value)}
                      onKeyDown={(event) => {
                        const next = event.key === 'ArrowRight' ? (index + 1) % availableCategories.length
                          : event.key === 'ArrowLeft' ? (index + availableCategories.length - 1) % availableCategories.length
                          : event.key === 'Home' ? 0
                          : event.key === 'End' ? availableCategories.length - 1 : -1;
                        if (next >= 0) {
                          event.preventDefault();
                          const nextCategory = availableCategories[next].value;
                          setActiveCategory(nextCategory);
                          document.getElementById(`advisory-tab-${nextCategory}`)?.focus();
                        }
                      }}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isSelected
                        ? 'bg-[#6B1E5B] text-white shadow-sm'
                        : 'border border-[#E7D7E8] bg-white text-[#6B1E5B] hover:bg-[#F7EFF5]'}`}
                    >
                      {category.role}
                    </button>
                  );
                })}
              </div>

              <div id="advisory-panel" role="tabpanel" aria-labelledby={`advisory-tab-${selectedCategory.value}`}>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-[#2A1636]">{selectedCategory.title}</h3>
                  <span className="rounded-full bg-[#6B1E5B]/10 px-3 py-1 text-xs font-medium text-[#6B1E5B]">
                    {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <AdvisoryBoardGrid members={selectedMembers} />
              </div>
            </>
          ) : (
            <AdvisoryBoardGrid members={[]} />
          )}
        </section>
      </div>
    </div>
  );
}
