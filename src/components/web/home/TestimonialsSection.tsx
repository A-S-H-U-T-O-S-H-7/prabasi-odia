"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, Sparkles } from "lucide-react";
import Image from "next/image";
import { adminTestimonialService, Testimonial } from "@/lib/services/adminTestimonialService";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

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

  useEffect(() => {
    if (testimonials.length <= 1) return;

    intervalRef.current = setInterval(() => {
      if (!isDragging) {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testimonials.length, isDragging]);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 0;
      const gap = 24;
      scrollRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth",
      });
    }
    setCurrentIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % testimonials.length;
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    scrollToIndex(prevIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (!isDragging) {
          setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }
      }, 5000);
    }, 3000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
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

  const getVisibleCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDE8D0]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
              What Our Members Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
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
    <section className="py-10 px-4 relative overflow-hidden bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDE8D0]/30">
      {/* Decorative Soft Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B1E5B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E6A11C]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D9772B]/5 rounded-full blur-3xl" />
        
        {/* Abstract Decorative Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1000 400">
          <path d="M0 200 Q200 100 400 200 T800 200 T1000 150" stroke="#6B1E5B" strokeWidth="2" fill="none" />
          <path d="M0 250 Q250 150 500 250 T1000 200" stroke="#D9772B" strokeWidth="2" fill="none" />
          <path d="M0 150 Q200 250 400 150 T800 150 T1000 100" stroke="#E6A11C" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="max-w-8xl px-5 mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            💬 Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
            What Our <span className="text-[#6B1E5B]">Members</span> Say
          </h2>
          <p className="text-[#6B5E5A] mt-2 max-w-2xl mx-auto">
            Real stories from real members who found their community on Prabasi Odia.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {testimonials.length > getVisibleCount() && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-3 lg:-ml-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-[#E7D7E8] flex items-center justify-center hover:bg-[#6B1E5B] hover:text-white hover:border-[#6B1E5B] transition-all duration-300 cursor-pointer text-[#2A1636]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-3 lg:-mr-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-[#E7D7E8] flex items-center justify-center hover:bg-[#6B1E5B] hover:text-white hover:border-[#6B1E5B] transition-all duration-300 cursor-pointer text-[#2A1636]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] md:min-w-[320px] md:max-w-[320px] snap-start flex-shrink-0"
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col group">
                  {/* Gradient Border on Hover */}
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#6B1E5B]/20 via-[#D9772B]/20 to-[#E6A11C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />

                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Quote className="w-10 h-10 text-[#6B1E5B]" />
                  </div>

                  {/* Rating */}
                  <div className="mb-3">{renderStars(testimonial.rating)}</div>

                  {/* Content */}
                  <p className="text-sm text-[#2A1636] leading-relaxed flex-1">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E7D7E8]/30">
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] ring-2 ring-white shadow-sm">
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-base font-bold">
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
                    <div className="text-[#6B1E5B] opacity-0 group-hover:opacity-40 transition-opacity duration-300">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {testimonials.length > getVisibleCount() && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? "w-8 h-2 rounded-full bg-[#6B1E5B]"
                    : "w-2 h-2 rounded-full bg-[#D4C8C0] hover:bg-[#6B1E5B]/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}