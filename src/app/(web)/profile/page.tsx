"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useUserStore } from "@/lib/store";
import ProfileHeader from "@/components/web/profile/ProfileHeader";
import ProfileStats from "@/components/web//profile/ProfileStats";
import ProfileAbout from "@/components/web//profile/ProfileAbout";
import ProfileMemberCard from "@/components/web//profile/ProfileMemberCard";
import ProfileActivity from "@/components/web//profile/ProfileActivity";
import ProfileAddresses from "@/components/web/profile/ProfileAddresses";
import ProfilePeopleNearby from "@/components/web/profile/ProfilePeopleNearby";
import ProfileDonations from "@/components/web/profile/ProfileDonations";
import { Heart, Loader2, User } from "lucide-react";
import { canHaveMemberCard } from '@/lib/residency';

type ProfileTab = "overview" | "donations";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const { profile, fetchUserProfile, loading: profileLoading } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

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

  const isGuest = profile.residencyStatus === 'GUEST';
  const hasCard = canHaveMemberCard(profile.residencyStatus) && profile.isVerified && Boolean(profile.memberId);

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-6 pb-12">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#6B1E5B]/5 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader profile={profile} />

        {!isGuest && <div className="mt-6 inline-flex p-1 rounded-2xl bg-white/70 border border-white/60 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#6B1E5B] text-white shadow-sm"
                : "text-[#6B5E5A] hover:text-[#2A1636]"
            }`}
          >
            <User className="w-4 h-4" />
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("donations")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "donations"
                ? "bg-[#6B1E5B] text-white shadow-sm"
                : "text-[#6B5E5A] hover:text-[#2A1636]"
            }`}
          >
            <Heart className="w-4 h-4" />
            Donations
          </button>
        </div>}

        {isGuest ? (
          <div className="mt-6 max-w-2xl rounded-2xl border border-[#D4C8C0] bg-white/80 p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#2A1636]">Guest account</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B5E5A]">You can explore the site. Posting, applications, enquiries, and community membership are available to approved Odia applicants.</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-[#6B5E5A]">Email</dt><dd className="font-medium text-[#2A1636]">{profile.email}</dd></div>
              <div><dt className="text-[#6B5E5A]">Mobile</dt><dd className="font-medium text-[#2A1636]">{profile.phoneNumber || 'Not provided'}</dd></div>
            </dl>
          </div>
        ) : activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <ProfilePeopleNearby profile={profile} />
              <ProfileAbout profile={profile} />
              {hasCard ? (
                <ProfileMemberCard profile={profile} />
              ) : profile.isVerified ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                  <p className="font-semibold">Your account is approved</p>
                  <p className="mt-1 text-sm">{canHaveMemberCard(profile.residencyStatus)
                    ? 'Your member card will appear after an administrator assigns your member ID.'
                    : 'You can use member services. This account type does not receive a member card.'}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                  <p className="font-semibold">{profile.residencyStatus === 'RO' ? 'Odia account under review' : 'Membership application under review'}</p>
                  <p className="mt-1 text-sm">An administrator will review your application before member services become available.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <ProfileStats profile={profile} />
              <ProfileAddresses profile={profile} />
              <ProfileActivity profile={profile} />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <ProfileDonations userId={user?.uid || profile.uid} />
          </div>
        )}
      </div>
    </div>
  );
}
