"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";

interface TopCommunitiesProps {
  communities: { id: string; name: string; memberCount: number }[];
}

export default function TopCommunities({ communities }: TopCommunitiesProps) {
  if (communities.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-[#6B5E5A]">No communities yet</p>
      </div>
    );
  }

  const maxMembers = communities.length > 0 ? communities[0].memberCount : 1;

  return (
    <div className="space-y-3">
      {communities.map((community, index) => {
        const percentage = maxMembers > 0 ? (community.memberCount / maxMembers) * 100 : 0;
        return (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-sm font-medium text-[#2A1636] truncate">
                  {community.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-[#6B5E5A]">
                <Users className="w-3 h-3" />
                <span>{community.memberCount}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#E7D7E8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-[#6B1E5B] to-[#D9772B]"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}