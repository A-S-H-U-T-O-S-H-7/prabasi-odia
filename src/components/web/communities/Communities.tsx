"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useAuthStore, useUserStore } from "@/lib/store";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import CommunityHero from "@/components/web/communities/CommunityHero";
import CommunityFilters from "@/components/web/communities/CommunityFilters";
import CommunityGrid from "@/components/web/communities/CommunityGrid";

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { profile, hasJoinedCommunity } = useUserStore();
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<PublicCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState<string[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  const isVerified = profile?.isVerified || false;

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const result = await publicCommunityService.getActiveCommunities();
      if (result.success) {
        setCommunities(result.communities);
        setFilteredCommunities(result.communities);
        
        const cityList = [...new Set(result.communities.map(c => c.city).filter(Boolean))];
        setCities(cityList);
        
        const total = result.communities.reduce((sum, c) => sum + c.memberCount, 0);
        setTotalMembers(total);
      } else {
        toast.error(result.error || "Failed to load communities");
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to join a community");
      return;
    }
    
    if (!hasJoinedCommunity || !isVerified) {
      toast.error("Please complete your profile and get verified to join communities");
      return;
    }

    try {
      const result = await publicCommunityService.joinCommunity(communityId, user?.uid || '');
      if (result.success) {
        toast.success("Successfully joined the community!");
        setCommunities(prev => prev.map(c => 
          c.id === communityId 
            ? { ...c, memberCount: c.memberCount + 1, members: [...(c.members || []), user?.uid || ''] }
            : c
        ));
        setFilteredCommunities(prev => prev.map(c => 
          c.id === communityId 
            ? { ...c, memberCount: c.memberCount + 1, members: [...(c.members || []), user?.uid || ''] }
            : c
        ));
        setTotalMembers(prev => prev + 1);
        fetchCommunities();
      } else {
        toast.error(result.error || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error("Failed to join community");
    }
  };

  const isUserMember = (communityId: string) => {
    const community = communities.find(c => c.id === communityId);
    if (!community || !user?.uid) return false;
    return community.members?.includes(user.uid) || false;
  };

  useEffect(() => {
    let filtered = communities;
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term)
      );
    }
    
    if (selectedCity !== "all") {
      filtered = filtered.filter(c => c.city === selectedCity);
    }
    
    setFilteredCommunities(filtered);
  }, [searchTerm, selectedCity, communities]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6] py-4 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors mb-3 md:mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium">Back</span>
        </button>

        {/* Hero with Banner */}
        <CommunityHero 
          totalCommunities={communities.length} 
          totalMembers={totalMembers} 
        />

        {/* Filters */}
        <div className="mt-6 md:mt-8">
          <CommunityFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={cities}
          />
        </div>

        {/* Results Count */}
        <div className="mt-4 md:mt-6 text-xs md:text-sm text-[#6B5E5A]">
          Showing {filteredCommunities.length} of {communities.length} communities
        </div>

        {/* Grid */}
        <div className="mt-4 md:mt-6">
          <CommunityGrid
            communities={filteredCommunities}
            loading={loading}
            onJoin={handleJoin}
            isMember={isUserMember}
            isAuthenticated={isAuthenticated}
            isVerified={isVerified && hasJoinedCommunity}
          />
        </div>
      </div>
    </div>
  );
}