"use client";

import { UserData } from "@/lib/services/adminUserService";
import { useEffect, useState } from "react";
import { CheckCircle, User, UserPlus, ShieldCheck } from "lucide-react";

interface RegisteredUserTableProps {
  users: UserData[];
  loading?: boolean;
  startIndex?: number;
}

export default function RegisteredUserTable({
  users,
  loading = false,
  startIndex = 0,
}: RegisteredUserTableProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#6B1E5B] border-t-transparent mx-auto" />
        <p className="text-[#6B5E5A] mt-3">Loading registered users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 text-center">
        <p className="text-[#6B5E5A]">No registered users found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E7D7E8] bg-[#FFF9F2]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">
                Sl. No.
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider hidden md:table-cell">
                Member ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider hidden sm:table-cell">
                Signed Up
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7D7E8]">
            {users.map((user, index) => (
              <tr key={user.uid} className="hover:bg-[#6B1E5B]/5 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-[#6B5E5A]">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <RegisteredUserAvatar
                      src={user.photoURL || user.documents?.profilePhoto}
                      name={user.displayName || "User"}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2A1636] truncate">
                        {user.displayName || "Unknown"}
                      </p>
                      <p className="text-xs text-[#6B5E5A] truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-[#6B5E5A] font-mono">
                    {user.memberId || "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-[#6B5E5A]">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {user.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : user.hasJoinedCommunity ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#6B1E5B]/10 text-[#6B1E5B] text-xs font-medium rounded-full border border-[#6B1E5B]/20">
                      <CheckCircle className="w-3 h-3" /> Application submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20">
                      <UserPlus className="w-3 h-3" /> Account only
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegisteredUserAvatar({ src, name }: { src?: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  return (
    <div className="w-10 h-10 rounded-full bg-[#6B1E5B]/10 border border-[#E7D7E8] flex items-center justify-center text-[#6B1E5B] flex-shrink-0 overflow-hidden">
      {src && !hasError ? (
        <img
          src={src}
          alt={`${name} profile`}
          className="h-full w-full object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <User className="h-5 w-5" aria-hidden="true" />
      )}
    </div>
  );
}
