// components/web/home/AdvisoryBoardPreview.tsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { adminAdvisoryBoardService, AdvisoryBoardMember } from "@/lib/services/adminAdvisoryBoardService";

interface AdvisoryBoardPreviewProps {
  limit?: number;
}

export default function AdvisoryBoardPreview({ limit = 6 }: AdvisoryBoardPreviewProps) {
  const [members, setMembers] = useState<AdvisoryBoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const result = await adminAdvisoryBoardService.getActiveMembers();
      if (result.success) {
        const sorted = result.members.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.order - b.order;
        });
        setMembers(sorted.slice(0, limit));
      }
    } catch (error) {
      console.error("Error fetching advisory board:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 md:py-10 px-3 md:px-5 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-5 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto mt-2 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-4 text-center animate-pulse">
                <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded mt-3 w-16 mx-auto" />
                <div className="h-3 bg-gray-200 rounded mt-2 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-10 px-3 md:px-5 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
      <div className="max-w-8xl px-3 md:px-5 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-10"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            Advisory Board
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2A1636] mt-3">
            Meet Our <span className="text-[#6B1E5B]">Advisors</span>
          </h2>
          
        </motion.div>

        {/* Members Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href="/advisory-board">
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-[#6B1E5B]/10 cursor-pointer hover:ring-2 hover:ring-[#6B1E5B]/30 hover:ring-offset-2"
                  style={{
                    background: 'linear-gradient(135deg, #FFF5F5 0%, #FDE8F0 30%, #F5D4E8 60%, #E8C4DC 100%)',
                  }}
                >
                  {/* Decorative Pattern Overlay */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, #6B1E5B 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Gold Decorative Circle */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors duration-500" />

                  {/* Content */}
                  <div className="relative z-10 p-4 text-center">
                    {/* Photo */}
                    <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white/80 shadow-lg group-hover:border-[#D4AF37] transition-all duration-500">
                      {member.photoURL ? (
                        <Image
                          src={member.photoURL}
                          alt={member.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
                          <span className="text-2xl font-serif font-bold text-white">
                            {member.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      
                      {member.featured && (
                        <div className="absolute -top-1 -right-1 z-20">
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg animate-pulse">
                            <Star className="w-3 h-3 text-[#6B1E5B] fill-[#6B1E5B]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-serif font-bold text-[#2A1636] mt-3 group-hover:text-[#6B1E5B] transition-colors line-clamp-1">
                      {member.name}
                    </h3>

                    {/* Position */}
                    <p className="text-xs font-medium text-[#D9772B] mt-0.5 line-clamp-1">
                      {member.position}
                    </p>

                    {/* Organization */}
                    {member.organization && (
                      <p className="text-[10px] text-[#5A4A4A] mt-1 line-clamp-1">
                        {member.organization}
                      </p>
                    )}

                    {/* View indicator */}
                    <div className="mt-3 text-[#6B1E5B]/40 text-xs font-medium flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-6 md:mt-8"
        >
          <Link
            href="/advisory-board"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm font-medium"
          >
            View Full Advisory Board
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}