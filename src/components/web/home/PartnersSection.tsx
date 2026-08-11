// components/web/home/PartnersMarquee.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { adminPartnerService, Partner } from "@/lib/services/adminPartnerService";
import { Building2 } from "lucide-react";

export default function PartnersMarquee() {
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

  // Auto-scroll using setInterval
  useEffect(() => {
    if (partners.length <= 3 || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    let scrollPosition = 0;
    const speed = 0.5;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (isPausedRef.current || !scrollContainer) return;

        scrollPosition += speed;
        
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }, 20);
    };

    startAutoScroll();

    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    const handleTouchStart = () => {
      isPausedRef.current = true;
    };

    const handleTouchEnd = () => {
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
      <section className="py-8 md:py-10 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
        <div className="max-w-8xl px-3 md:px-5 mx-auto">
          <div className="text-center mb-8">
            <div className="h-5 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto mt-2 animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
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
    <section className="py-8 md:py-10 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2] overflow-hidden">
      <div className="max-w-8xl px-3 md:px-5 mx-auto">
        {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="text-center mb-10"
>
  <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
    Our Partners
  </span>
  
  <div className="flex items-center justify-center gap-4 mt-4">
    <div className="flex-1 max-w-20 h-px bg-gradient-to-r from-transparent via-[#6B1E5B] to-transparent opacity-40" />
    <span className="text-sm md:text-base font-serif font-semibold text-[#2A1636] whitespace-nowrap tracking-wide">
      Trusted by Leading Organizations
    </span>
    <div className="flex-1 max-w-20 h-px bg-gradient-to-l from-transparent via-[#6B1E5B] to-transparent opacity-40" />
  </div>
</motion.div>

        {/* Partners Scrolling Row - Logo on top, name below */}
        <div
          ref={scrollRef}
          className="flex gap-6 md:gap-10 overflow-x-auto scroll-smooth py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 min-w-[80px] md:min-w-[100px]"
            >
              {partner.website ? (
                <Link
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 md:gap-3 group transition-all duration-300 hover:opacity-80 w-full"
                >
                  {/* Logo - Larger and centered */}
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-[#6B1E5B]/30 shadow-sm group-hover:border-[#6B1E5B] group-hover:shadow-[0_0_30px_rgba(107,30,91,0.15)] transition-all duration-300">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5">
                        <Building2 className="w-6 h-6 md:w-8 md:h-8 text-[#6B1E5B]/40" />
                      </div>
                    )}
                  </div>

                  {/* Name - Below the logo */}
                  <span className="text-xs md:text-sm font-serif font-medium text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors text-center leading-tight line-clamp-2 max-w-[80px] md:max-w-[100px]">
                    {partner.name}
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2 md:gap-3 group transition-all duration-300 w-full">
                  {/* Logo */}
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-[#6B1E5B]/30 shadow-sm group-hover:border-[#6B1E5B] group-hover:shadow-[0_0_30px_rgba(107,30,91,0.15)] transition-all duration-300">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5">
                        <Building2 className="w-6 h-6 md:w-8 md:h-8 text-[#6B1E5B]/40" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-xs md:text-sm font-serif font-medium text-[#2A1636] text-center leading-tight line-clamp-2 max-w-[80px] md:max-w-[100px]">
                    {partner.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Partners Button */}
        {/* <div className="flex justify-center mt-6">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm font-medium"
          >
            View All Partners
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div> */}

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