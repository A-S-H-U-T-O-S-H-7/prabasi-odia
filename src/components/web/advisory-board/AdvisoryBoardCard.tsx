'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, ExternalLink } from 'lucide-react';
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";

interface Member {
  id: string;
  name: string;
  position: string;
  designation?: string;
  organization?: string;
  bio?: string;
  photoURL?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  featured?: boolean;
}

interface AdvisoryBoardCardProps {
  member: Member;
  index: number;
}

export default function AdvisoryBoardCard({ member, index }: AdvisoryBoardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-[#E5E3DD]/30">
        {/* Gold Decorative Circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#D4AF37]/5 group-hover:bg-[#D4AF37]/10 transition-colors duration-500" />
        
        {/* Photo - Round */}
        <div className="relative pt-6 px-6">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all duration-500 shadow-md group-hover:shadow-xl">
            {member.photoURL ? (
              <Image
                src={member.photoURL}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4AF37]/10 to-[#0B3C5D]/10">
                <span className="text-4xl font-serif font-bold text-[#D4AF37]">
                  {member.name?.charAt(0) || '?'}
                </span>
              </div>
            )}

            {member.featured && (
              <div className="absolute -top-1 -right-1 z-20">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-[#0B3C5D] fill-[#0B3C5D]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          <h3 className="text-lg font-serif font-bold text-[#0B3C5D] group-hover:text-[#D4AF37] transition-colors">
            {member.name}
          </h3>
          
          <p className="text-sm font-medium text-[#D4AF37] mt-0.5">
            {member.position}
          </p>
          
          {member.designation && (
            <p className="text-xs text-[#555555] mt-1">
              {member.designation}
              {member.organization && ` at ${member.organization}`}
            </p>
          )}

          {member.bio && (
            <p className="text-sm text-[#555555] mt-3 leading-relaxed line-clamp-2">
              {member.bio}
            </p>
          )}

          {/* Social Icons */}
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#E5E3DD]/30">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#E5E3DD]/20 text-[#555555] hover:bg-[#D4AF37] hover:text-[#0B3C5D] transition-all duration-300 hover:scale-110"
                aria-label={`${member.name} LinkedIn`}
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#E5E3DD]/20 text-[#555555] hover:bg-[#D4AF37] hover:text-[#0B3C5D] transition-all duration-300 hover:scale-110"
                aria-label={`${member.name} Twitter`}
              >
                <FaTwitter className="w-4 h-4" />
              </a>
            )}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[#E5E3DD]/20 text-[#555555] hover:bg-[#D4AF37] hover:text-[#0B3C5D] transition-all duration-300 hover:scale-110"
                aria-label={`${member.name} Website`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}