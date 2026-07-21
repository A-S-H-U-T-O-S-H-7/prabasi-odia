"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Users, ArrowRight } from "lucide-react";
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
        setCommunities(result.communities.slice(0, 4)); // Show only 4
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    "from-[#6B1E5B]/5 to-[#8A2E72]/5",
    "from-[#D9772B]/5 to-[#E6A11C]/5",
    "from-[#059669]/5 to-[#0EA5E9]/5",
    "from-[#7C3AED]/5 to-[#EC4899]/5",
  ];

  if (loading) {
    return (
      <section className="py-20 px-4 bg-[#FFF9F2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">Communities</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">Communities Near You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/70 rounded-2xl border border-[#E7D7E8] p-6 shadow-sm animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20" />
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
    <section className="py-10 px-4 bg-[#FFF9F2]">
      <div className="max-w-8xl px-5 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Communities
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
              Communities <span className="text-[#6B1E5B]">Near You</span>
            </h2>
            <p className="text-[#6B5E5A] mt-2">
              Join a community in your city and connect with Odias nearby.
            </p>
          </div>
          <Link
            href="/communities"
            className="flex items-center gap-2 text-[#6B1E5B] font-medium hover:text-[#531547] transition-colors group shrink-0"
          >
            View All Communities
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {communities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group bg-gradient-to-br ${gradients[index % gradients.length]} backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2`}
            >
              {/* Cover Image Placeholder */}
              <div className="w-full h-28 rounded-xl bg-gradient-to-r from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center mb-4 overflow-hidden">
                {community.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={community.coverImage}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏘️</span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#2A1636] truncate">{community.name}</h3>
              <p className="text-xs text-[#6B5E5A] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {community.city}, {community.state}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-[#6B5E5A]">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{community.memberCount} members</span>
                </div>
              </div>

              <Link
                href={`/communities`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#6B1E5B] hover:text-[#531547] transition-colors group-hover:gap-2"
              >
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}