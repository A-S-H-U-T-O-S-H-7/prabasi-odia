"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { userService, type UserProfileData } from "@/lib/services/userService";
import ProfileHeader from "@/components/web/profile/ProfileHeader";
import ProfileStats from "@/components/web/profile/ProfileStats";
import ProfileAbout from "@/components/web/profile/ProfileAbout";
import ProfileMemberCard from "@/components/web/profile/ProfileMemberCard";
import ProfileActivity from "@/components/web/profile/ProfileActivity";
import ProfileAddresses from "@/components/web/profile/ProfileAddresses";
import ProfilePeopleNearby from "@/components/web/profile/ProfilePeopleNearby";

interface AdminMemberProfileProps {
  uid?: string;
  onBack?: () => void;
}

export default function AdminMemberProfile({ uid: suppliedUid, onBack }: AdminMemberProfileProps) {
  const params = useParams();
  const uid = suppliedUid || (typeof params?.uid === "string" ? params.uid : "");
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setError("Invalid member profile link.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const result = await userService.getUserProfile(uid);
      if (cancelled) return;
      if (result.success && result.data) setProfile({ uid, ...result.data } as UserProfileData);
      else setError("Member profile not found.");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#6B1E5B]" /></div>;

  if (error || !profile) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-serif text-2xl font-bold text-[#2A1636]">Profile unavailable</h1>
      <p className="mt-2 text-sm text-[#6B5E5A]">{error || "Member profile not found."}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#6B1E5B]/5 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        {onBack && <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#E7D7E8] bg-white/70 px-3 py-2 text-sm font-medium text-[#6B1E5B] hover:bg-white"><ArrowLeft className="h-4 w-4" />Back to Joined Members</button>}
        <ProfileHeader profile={profile} />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ProfilePeopleNearby profile={profile} />
            <ProfileAbout profile={profile} />
            {profile.isVerified && profile.memberId ? <ProfileMemberCard profile={profile} memberUid={uid} /> : <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><p className="font-semibold">Membership application under review</p><p className="mt-1 text-sm">The member pass will appear here after approval.</p></div>}
          </div>
          <div className="space-y-6"><ProfileStats profile={profile} /><ProfileAddresses profile={profile} /><ProfileActivity profile={profile} /></div>
        </div>
      </div>
    </div>
  );
}
