"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";
import { adminTestimonialService, Testimonial } from "@/lib/services/adminTestimonialService";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTestimonials();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchTestimonials = async () => {
    try {
      const result = await adminTestimonialService.getPublishedTestimonials();
      if (result.success) {
        setTestimonials(result.testimonials);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 280 : 320;
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = isMobile ? 280 : 320;
      scrollContainerRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < rating ? "fill-[#E6A11C] text-[#E6A11C]" : "text-[#D4C8C0]"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDE8D0]/30">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-3">What Our Members Say</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/70 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-10 px-2 md:px-4 bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDE8D0]/30">
      <div className="max-w-8xl px-3 md:px-5 mx-auto">
        {/* Header - Center Aligned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            💬 Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-2">
            What Our <span className="text-[#6B1E5B]">Members</span> Say
          </h2>
          
        </motion.div>

        {/* Rail Container */}
        <div className="relative group">
          {/* Navigation Arrows - Only on mobile */}
          {isMobile && testimonials.length > 2 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#2A1636]" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#2A1636]" />
              </button>
            </>
          )}

          {/* Cards Container - Horizontal Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex-shrink-0"
                style={{ width: isMobile ? "280px" : "320px" }}
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="absolute top-3 right-3 opacity-10">
                    <Quote className="w-8 h-8 text-[#6B1E5B]" />
                  </div>

                  {/* Rating */}
                  <div className="mb-2">{renderStars(testimonial.rating)}</div>

                  {/* Content */}
                  <p className="text-sm text-[#2A1636] leading-relaxed flex-1 line-clamp-4">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E7D7E8]/30">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] ring-2 ring-white shadow-sm">
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2A1636] truncate">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-[#6B5E5A] truncate">
                        {testimonial.profession} • {testimonial.city}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}