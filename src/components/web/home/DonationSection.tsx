// components/DonationBanner.tsx
'use client';

import React, { useEffect } from 'react';
import { Heart, Sparkles, BookOpen, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

interface DonationBannerProps {
  user?: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  } | null;
}

const DonationBanner: React.FC = () => {
  const { isAuthenticated, loading, initialize } = useAuthStore();
  const donateHref = isAuthenticated ? '/donation' : '/signup';

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  return (
    <>
      
        <div className="mx-3 md:mx-10 mb-2 md:mb-10 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 border-2 border-rose-100/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
          {/* Shine Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center gap-8 p-3 lg:p-8 relative z-10">
            
            {/* Image Section - Left Side */}
            <div className="flex-shrink-0 order-2 lg:order-1">
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white rounded-2xl p-3 shadow-lg">
                  <img
                    src="/donate.jpg"
                    alt="Community donation and support"
                    className="w-72 h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent rounded-xl" />
                </div>
              </div>
            </div>
            
            {/* Content Section - Right Side */}
            <div className="flex-1 order-1 lg:order-2 text-center lg:text-left space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                <div className="p-1.5 bg-rose-100 rounded-full">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                </div>
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="p-1.5 bg-pink-100 rounded-full">
                  <BookOpen className="w-4 h-4 text-pink-500" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Donate for a Smile
              </h2>
              
              <p className="text-lg font-medium text-slate-700 leading-relaxed">
                Every contribution brings hope — in classrooms, homes, and communities
              </p>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/50 space-y-3">
                
                
                <div className=" pt-3">
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">
                    Your kindness fuels education, health, and dignity for those in need.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-medium">Child Education</span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">Women Empowerment</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Senior Citizen Welfare</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">Poor Children Support</span>
                  </div>
                </div>
              </div>

              <Link href={donateHref} aria-disabled={loading}>
                <button className="inline-flex cursor-pointer items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm">
                  <Heart className="w-4 h-4 fill-current" />
                  Make a Donation
                </button>
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full -translate-y-12 translate-x-12 z-0" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full translate-y-8 -translate-x-8 z-0" />
        </div>
    
    </>
  );
};

export default DonationBanner;