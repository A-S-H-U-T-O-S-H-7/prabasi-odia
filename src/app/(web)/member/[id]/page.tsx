"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  MapPin,
  Droplet,
  IdCard,
  Calendar,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { userService } from "@/lib/services/userService";

interface PublicMember {
  uid: string;
  displayName: string;
  photoURL: string;
  memberId: string;
  bloodGroup: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  isVerified: boolean;
  createdAt: string;
}

function formatDate(dateString?: string | Date) {
  if (!dateString) return "—";
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function MemberVerifyPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<PublicMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid member link");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await userService.getPublicMemberById(id);
      if (cancelled) return;
      if (result.success && result.data) {
        setMember(result.data as PublicMember);
      } else {
        setMember(null);
        setError(result.error || "Member not found");
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const location = [member?.currentCity, member?.currentState, member?.currentCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Image src="/logo.png" alt="Prabasi Odia" width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <p className="font-serif text-lg font-bold text-[#4A1942]">Prabasi Odia</p>
            <p className="text-xs text-[#6B5E5A]">Member Verification</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E7D7E8] bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B5E5A]">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#6B1E5B]" />
              <p className="text-sm">Looking up member...</p>
            </div>
          ) : error || !member ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <ShieldAlert className="h-7 w-7 text-red-500" />
              </div>
              <h1 className="text-lg font-semibold text-[#2A1636]">Member not found</h1>
              <p className="mt-2 text-sm text-[#6B5E5A]">
                This QR code does not match a valid community member.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-white bg-[#4A1942]/10 shadow">
                  {member.photoURL ? (
                    <Image
                      src={member.photoURL}
                      alt={member.displayName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-[#4A1942]">
                      👤
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-serif text-xl font-bold text-[#4A1942]">
                    {member.displayName || "Member"}
                  </h1>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      member.isVerified
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-[#DDD0BC] bg-white text-[#7A6A5E]"
                    }`}
                  >
                    {member.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3" /> Verified Member
                      </>
                    ) : (
                      "Unverified"
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-[#FFF9F2] p-4">
                <div className="flex items-center gap-2 text-sm">
                  <IdCard className="h-4 w-4 shrink-0 text-[#C1440E]" />
                  <span className="text-[#6B5E5A]">Member ID</span>
                  <span className="ml-auto font-semibold text-[#2A1636]">
                    {member.memberId || "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Droplet className="h-4 w-4 shrink-0 text-[#C1440E]" />
                  <span className="text-[#6B5E5A]">Blood Group</span>
                  <span className="ml-auto font-semibold text-red-600">
                    {member.bloodGroup || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-[#C1440E]" />
                  <span className="text-[#6B5E5A]">Location</span>
                  <span className="ml-auto max-w-[55%] truncate text-right font-semibold text-[#2A1636]">
                    {location || "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 shrink-0 text-[#C1440E]" />
                  <span className="text-[#6B5E5A]">Joined</span>
                  <span className="ml-auto font-semibold text-[#2A1636]">
                    {formatDate(member.createdAt)}
                  </span>
                </div>
              </div>

              <p className="text-center text-[11px] text-[#6B5E5A]">
                Issued by Samudayik Vikas Samiti · Prabasi Odia
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#6B5E5A]">
          <Link href="/" className="font-medium text-[#6B1E5B] hover:underline">
            Back to Prabasi Odia
          </Link>
        </p>
      </div>
    </main>
  );
}
