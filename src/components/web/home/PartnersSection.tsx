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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

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

  // Auto-scroll using setInterval (works better on mobile)
  useEffect(() => {
    if (partners.length <= 3 || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollPosition = 0;
    const speed = 0.5;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start auto-scroll
    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (isPausedRef.current || !scrollContainer) return;

        scrollPosition += speed;
        
        // Reset when reached halfway (seamless loop)
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }, 20); // ~50fps
    };

    startAutoScroll();

    // Pause on hover (desktop)
    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    // Pause on touch (mobile)
    const handleTouchStart = () => {
      isPausedRef.current = true;
    };

    const handleTouchEnd = () => {
      // Resume after a short delay
      setTimeout(() => {
        isPausedRef.current = false;
      }, 1500);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchend', handleTouchEnd);
    scrollContainer.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
      scrollContainer.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [partners.length]);

  // Only duplicate if more than 3 partners (for seamless scroll)
  const displayPartners = partners.length > 3 ? [...partners, ...partners] : partners;

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-5 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto mt-2 animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-px h-8 bg-gray-200" />
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
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
    <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2] overflow-hidden">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent via-[#6B1E5B] to-transparent opacity-40" />
          <span className="text-sm md:text-base font-serif font-semibold text-[#2A1636] whitespace-nowrap tracking-wide">
            Trusted by Community Partners
          </span>
          <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent via-[#6B1E5B] to-transparent opacity-40" />
        </motion.div>

        {/* Partners Scrolling Row */}
        <div
          ref={scrollRef}
          className="flex gap-6 md:gap-10 overflow-x-auto scroll-smooth py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex items-center gap-4 md:gap-6 flex-shrink-0"
            >
              {/* Partner Content */}
              {partner.website ? (
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 md:gap-4 group transition-all duration-300 hover:opacity-80"
                >
                  {/* Logo */}
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-[#6B1E5B]/30 shadow-sm group-hover:border-[#6B1E5B] group-hover:shadow-[0_0_20px_rgba(107,30,91,0.15)] transition-all duration-300">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5">
                        🏢
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-xs md:text-sm font-serif font-medium text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors whitespace-nowrap italic">
                    {partner.name}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 md:gap-4 group transition-all duration-300">
                  {/* Logo */}
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-[#6B1E5B]/30 shadow-sm group-hover:border-[#6B1E5B] group-hover:shadow-[0_0_20px_rgba(107,30,91,0.15)] transition-all duration-300">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5">
                        🏢
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-xs md:text-sm font-serif font-medium text-[#2A1636] whitespace-nowrap italic">
                    {partner.name}
                  </span>
                </div>
              )}

              {/* Separator Line */}
              {partners.length > 1 && index < displayPartners.length - 1 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-1 h-1 rounded-full bg-[#6B1E5B]/30" />
                  <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#6B1E5B]/40 to-transparent" />
                  <div className="w-1 h-1 rounded-full bg-[#6B1E5B]/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scroll hint - mobile */}
        <p className="text-center text-xs text-[#6B5E5A]/50 mt-4 md:hidden">
          ← Swipe to explore →
        </p>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}