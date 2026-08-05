"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import { publicEventService, PublicEvent } from "@/lib/services/publicEventService";
import CommunityCover from "@/components/web/community/CommunityCover";
import MembersAutoScroll from "@/components/web/community/MembersAutoScroll";
import CommunityEventsList from "@/components/web/community/CommunityEventsList";
import { Calendar, Users } from "lucide-react";

export default function CommunityDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [community, setCommunity] = useState<PublicCommunity | null>(null);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  const communityId = params?.id;

  // Load community and check membership
  const loadCommunity = useCallback(async () => {
    if (!communityId) return;
    
    setLoading(true);
    try {
      // Load community details
      const communityResult = await publicCommunityService.getCommunityById(communityId);
      if (!communityResult.success || !communityResult.community) {
        toast.error("Community not found");
        router.replace("/communities");
        return;
      }
      setCommunity(communityResult.community);

      // Check if user is member
      if (isAuthenticated && user?.uid) {
        const memberResult = await publicCommunityService.isUserMember(communityId, user.uid);
        setIsMember(memberResult.isMember || false);
      }

      // Load events for this community
      setEventsLoading(true);
      const eventsResult = await publicEventService.getEventsByCommunity(communityId);
      if (eventsResult.success) {
        setEvents(eventsResult.events || []);
      }
      setEventsLoading(false);

    } catch (error) {
      console.error("Error loading community:", error);
      toast.error("Failed to load community details");
    } finally {
      setLoading(false);
    }
  }, [communityId, isAuthenticated, user?.uid, router]);

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

  // Handle Join Community
  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/join-community");
      return;
    }

    if (!user?.uid || !community) return;

    setIsJoining(true);
    try {
      const result = await publicCommunityService.joinCommunity(community.id, user.uid);
      if (result.success) {
        setIsMember(true);
        setCommunity(prev => prev ? { ...prev, memberCount: (prev.memberCount || 0) + 1 } : prev);
        toast.success(`You've joined ${community.name}! 🎉`);
      } else if (result.error === 'Already a member') {
        setIsMember(true);
        toast.error("You're already a member of this community");
      } else {
        toast.error(result.error || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error("Failed to join community");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Leave Community
  const handleLeave = async () => {
    if (!user?.uid || !community) return;

    setIsJoining(true);
    try {
      const result = await publicCommunityService.leaveCommunity(community.id, user.uid);
      if (result.success) {
        setIsMember(false);
        setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, (prev.memberCount || 0) - 1) } : prev);
        toast.success(`You've left ${community.name}`);
      } else {
        toast.error(result.error || "Failed to leave community");
      }
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave community");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6B1E5B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#6B5E5A] mt-4">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#F5EDE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cover Section */}
        <CommunityCover
          community={community}
          eventsCount={events.length}
          isMember={isMember}
          onJoin={handleJoin}
          onLeave={handleLeave}
          isLoading={isJoining}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Members (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg overflow-hidden h-[500px] relative"
            >
              <div className="p-4 border-b border-[#E7D7E8]/50">
                <h3 className="text-lg font-semibold text-[#2A1636] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#6B1E5B]" />
                  Community Members
                  <span className="ml-auto text-sm font-normal text-[#6B5E5A]">
                    {community.memberCount || 0} members
                  </span>
                </h3>
              </div>
              <MembersAutoScroll
                memberIds={community.members || []}
                communityId={community.id}
              />
            </motion.div>
          </div>

          {/* Right Column - Events (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg overflow-hidden max-h-[500px] flex flex-col"
            >
              <div className="p-4 border-b border-[#E7D7E8]/50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-[#2A1636] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#6B1E5B]" />
                  Upcoming Events
                  <span className="ml-auto text-sm font-normal text-[#6B5E5A]">
                    {events.length}
                  </span>
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#D4C8C0] scrollbar-track-transparent">
                <CommunityEventsList events={events} isLoading={eventsLoading} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Community Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50 shadow-sm">
            <p className="text-2xl font-bold text-[#6B1E5B]">{community.memberCount || 0}</p>
            <p className="text-xs text-[#6B5E5A]">Total Members</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50 shadow-sm">
            <p className="text-2xl font-bold text-[#6B1E5B]">{events.length}</p>
            <p className="text-xs text-[#6B5E5A]">Upcoming Events</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50 shadow-sm">
            <p className="text-2xl font-bold text-[#6B1E5B]">{community.city}</p>
            <p className="text-xs text-[#6B5E5A]">Location</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50 shadow-sm">
            <p className="text-2xl font-bold text-[#6B1E5B]">
              {isMember ? '✅' : '🔓'}
            </p>
            <p className="text-xs text-[#6B5E5A]">
              {isMember ? 'Member' : 'Not a Member'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}