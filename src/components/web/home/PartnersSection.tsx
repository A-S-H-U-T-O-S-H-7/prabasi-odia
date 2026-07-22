"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { adminPartnerService, Partner } from "@/lib/services/adminPartnerService";

export default function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const result = await adminPartnerService.getActivePartners();
      if (result.success) {
        setPartners(result.partners);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll animation - only if more than 1 partner
  useEffect(() => {
    if (partners.length <= 1 || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.8;

    const scroll = () => {
      if (!scrollContainer) return;
      
      scrollPosition += speed;
      
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const handleMouseEnter = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [partners.length]);

  // Only duplicate if more than 1 partner
  const displayPartners = partners.length > 1 ? [...partners, ...partners] : partners;

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="flex-1 h-px bg-[#D4C8C0]" />
            <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="flex-1 h-px bg-[#D4C8C0]" />
          </div>
          <div className="flex gap-8 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse" />
                <div className="w-px h-10 bg-[#D4C8C0]" />
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-10 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2] overflow-hidden">
      <div className="max-w-8xl px-5 mx-auto">
        {/* Header with Left + Right Lines - Larger font */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex-1 max-w-32 h-px bg-gradient-to-r from-transparent to-[#6B1E5B]/30" />
          <span className="text-base md:text-lg font-medium text-[#2A1636] whitespace-nowrap">
            Trusted by Community Partners
          </span>
          <div className="flex-1 max-w-32 h-px bg-gradient-to-l from-transparent to-[#6B1E5B]/30" />
        </motion.div>

        {/* Partners Scrolling Row */}
        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-hidden scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex items-center gap-6 flex-shrink-0"
            >
              {/* Partner Content */}
              {partner.website ? (
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group transition-all duration-300 hover:opacity-80"
                >
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/50 border border-[#6B1E5B]/10 flex items-center justify-center group-hover:border-[#6B1E5B]/30 transition-colors">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-sm font-medium text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors whitespace-nowrap">
                    {partner.name}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-4 group transition-all duration-300">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/50 border border-[#6B1E5B]/10 flex items-center justify-center">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-sm font-medium text-[#2A1636] whitespace-nowrap">
                    {partner.name}
                  </span>
                </div>
              )}

              {/* Separator Line - Only show if more than 1 partner */}
              {partners.length > 1 && (
                <div className="w-px h-10 bg-[#6B1E5B]/20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}