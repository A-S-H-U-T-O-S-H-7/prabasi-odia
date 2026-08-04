"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Globe, Building2, Briefcase } from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { AdvisoryBoardMember } from "@/lib/services/adminAdvisoryBoardService";

interface AdvisoryBoardCardProps {
  member: AdvisoryBoardMember;
  index: number;
}

export default function AdvisoryBoardCard({
  member,
  index,
}: AdvisoryBoardCardProps) {
  const hasSocials = member.linkedin || member.twitter || member.website;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 overflow-hidden shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        {/* Photo */}
        <div className="relative w-full aspect-[4/5] bg-[#F0EAE6] overflow-hidden">
          {member.photoURL ? (
            <Image
              src={member.photoURL}
              alt={member.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B]/15 to-[#D9772B]/15 text-5xl font-serif font-bold text-[#6B1E5B]">
              {member.name?.charAt(0) || "?"}
            </div>
          )}

          {member.featured && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-[#E6A11C] text-white text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
              <Star className="w-3 h-3 fill-white" />
              Featured
            </div>
          )}

          {/* Hover overlay with details */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#2A1636]/95 via-[#2A1636]/80 to-[#2A1636]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5">
            {member.bio && (
              <p className="text-white/90 text-xs md:text-sm leading-relaxed line-clamp-4 mb-3">
                {member.bio}
              </p>
            )}

            <div className="space-y-1.5 mb-3">
              {member.organization && (
                <div className="flex items-center gap-1.5 text-white/80 text-[11px] md:text-xs">
                  <Building2 className="w-3 h-3 flex-shrink-0 text-[#E6A11C]" />
                  <span className="truncate">{member.organization}</span>
                </div>
              )}
              {member.designation && (
                <div className="flex items-center gap-1.5 text-white/80 text-[11px] md:text-xs">
                  <Briefcase className="w-3 h-3 flex-shrink-0 text-[#E6A11C]" />
                  <span className="truncate">{member.designation}</span>
                </div>
              )}
              {member.experience && (
                <p className="text-white/70 text-[11px] md:text-xs pl-5">
                  {member.experience}
                </p>
              )}
            </div>

            {hasSocials && (
              <div className="flex items-center gap-2">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <FaLinkedin className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                    aria-label={`${member.name} Twitter`}
                  >
                    <FaTwitter className="w-3.5 h-3.5" />
                  </a>
                )}
                {member.website && (
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                    aria-label={`${member.name} Website`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Default visible info */}
        <div className="p-4 text-center">
          <h3 className="text-base md:text-lg font-serif font-bold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors truncate">
            {member.name}
          </h3>
          <p className="text-xs md:text-sm font-medium text-[#6B1E5B] mt-0.5 truncate">
            {member.position}
          </p>
          {member.designation && (
            <p className="text-[11px] md:text-xs text-[#6B5E5A] mt-1 truncate">
              {member.designation}
            </p>
          )}
          {member.organization && (
            <p className="text-[11px] md:text-xs text-[#6B5E5A]/80 mt-0.5 truncate">
              {member.organization}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
