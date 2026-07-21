"use client";

import { motion } from "framer-motion";
import { User, CheckCircle, Clock } from "lucide-react";

interface RecentUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  isVerified: boolean;
}

interface RecentUsersProps {
  users: RecentUser[];
}

export default function RecentUsers({ users }: RecentUsersProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-[#6B5E5A]">No recent users</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <motion.div
          key={user.uid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-[#E7D7E8]/50 hover:border-[#6B1E5B]/20 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.displayName?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#2A1636] truncate">
              {user.displayName || "Unknown User"}
            </p>
            <p className="text-xs text-[#6B5E5A] truncate">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-[#6B5E5A]">{formatDate(user.createdAt)}</span>
            {user.isVerified ? (
              <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="text-[10px] text-[#D9772B] flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}