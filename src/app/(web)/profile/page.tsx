"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useUserStore } from "@/lib/store";
import ProfileHeader from "@/components/web/profile/ProfileHeader";
import ProfileStats from "@/components/web//profile/ProfileStats";
import ProfileAbout from "@/components/web//profile/ProfileAbout";
import ProfileInterests from "@/components/web//profile/ProfileInterests";
import ProfileFamily from "@/components/web//profile/ProfileFamily";
import ProfileMemberCard from "@/components/web//profile/ProfileMemberCard";
import ProfileActivity from "@/components/web//profile/ProfileActivity";
import ProfileAddresses from "@/components/web/profile/ProfileAddresses";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const { profile, fetchUserProfile, loading: profileLoading } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && mounted) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, mounted]);

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [isAuthenticated, user?.uid, fetchUserProfile]);

  if (!mounted || loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2]">
        <Loader2 className="w-8 h-8 text-[#6B1E5B] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F2]">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-[#2A1636]">No Profile Found</h2>
          <p className="text-[#6B5E5A] mt-2">Please complete your profile to view this page.</p>
          <button
            onClick={() => router.push("/join-community")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[#6B1E5B] text-white font-medium hover:bg-[#531547] transition-colors"
          >
            Join Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-6 pb-12">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#6B1E5B]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader profile={profile} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileAbout profile={profile} />
            <ProfileInterests interests={profile.interests || []} />
            <ProfileFamily familyMembers={profile.familyMembers || []} />
            <ProfileMemberCard profile={profile} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <ProfileStats profile={profile} />
            <ProfileAddresses profile={profile} />
            <ProfileActivity profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}
