"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HeroContent from "./HeroContent";

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FFF9F5]">
      {/* Hero Container */}
      <div className="relative mx-auto min-h-[55vh] md:min-h-[75vh] w-full flex items-center">
        
        {/* Background Image - Fixed positioning */}
        <div className="absolute inset-0 z-0">
          <Image
            src={isMobile ? "/heromob.png" : "/bg3.png"}
            alt="Prabasi Odia Hero"
            fill
            priority
            quality={100}
            className="object-cover object-center"
          />
        </div>

        {/* Gradient Overlay - Only from left for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FFF9F5]/80 via-[#FFF9F5]/40 via-[30%] to-transparent" />

        {/* Decorative Blur */}
        <div className="absolute left-[-180px] top-[-180px] z-10 h-[520px] w-[520px] rounded-full bg-orange-100 blur-[120px] opacity-60" />

        {/* Content */}
        <div className="relative z-20 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
            <HeroContent />
          </div>
        </div>
      </div>
    </section>
  );
}