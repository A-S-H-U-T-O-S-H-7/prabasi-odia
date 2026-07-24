"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";

export default function CommunitiesPreview() {
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const result = await publicCommunityService.getActiveCommunities();
      if (result.success) {
        setCommunities(result.communities.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">Communities</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-3">Explore Communities</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/70 rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="w-full aspect-[3/2] bg-gray-200" />
                <div className="p-3 text-center">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (communities.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-10 px-2 md:px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
      <div className="max-w-8xl px-2 md:px-5 mx-auto">
        {/* Header - Center Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            Communities
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-2">
            Explore <span className="text-[#6B1E5B]">Communities</span>
          </h2>
          
        </motion.div>

        {/* Community Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {communities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/communities/${community.id}`} className="block">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#F0EAE6] shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  {community.coverImage ? (
                    <Image
                      src={community.coverImage}
                      alt={community.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-[#6B1E5B]/10 to-[#D9772B]/10">
                      🏘️
                    </div>
                  )}
                  
                  {/* Hover Overlay - Explore */}
                  <div className="absolute inset-0 bg-[#6B1E5B]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-semibold text-xs flex items-center gap-1.5">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Content - Centered */}
                <div className="text-center mt-1.5">
                  <h3 className="text-xs md:text-sm font-serif font-semibold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors truncate italic">
                    {community.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-[#6B5E5A] flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    {community.memberCount} members
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All - Center */}
        <div className="text-center mt-6">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 text-[#6B1E5B] font-medium hover:text-[#531547] transition-colors group text-sm"
          >
            View All Communities
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}