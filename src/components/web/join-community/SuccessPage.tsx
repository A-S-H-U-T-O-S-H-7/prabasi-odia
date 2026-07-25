"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle, Home, User, Sparkles, Award, Clock, 
  Mail, MessageCircle, Share2,
  ArrowRight, Heart, Shield
} from "lucide-react";
import { FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { useEffect, useState } from "react";

interface SuccessPageProps {
  onGoHome: () => void;
  onGoProfile: () => void;
}

export default function SuccessPage({ onGoHome, onGoProfile }: SuccessPageProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onGoProfile();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onGoProfile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative text-center py-4 md:py-6 overflow-hidden px-2"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.3, 
          type: "spring", 
          stiffness: 200, 
          damping: 20 
        }}
        className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] flex items-center justify-center mx-auto shadow-2xl shadow-[#6B1E5B]/30"
      >
        <CheckCircle className="w-10 h-10 md:w-14 md:h-14 text-white" />
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-4 border-[#D9772B]/30"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute inset-0 rounded-full border-4 border-[#6B1E5B]/20"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 md:mt-6 text-2xl md:text-3xl font-serif font-bold text-[#2A1636]"
      >
        Welcome to Prabasi Odia! 🎉
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-2 md:mt-3 text-xs md:text-sm text-[#6B5E5A] max-w-md mx-auto px-2"
      >
        Your profile has been submitted for verification. 
        You'll receive a notification once your identity is verified.
      </motion.p>

      {/* Next Steps Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 md:mt-6 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/50 max-w-sm mx-auto text-left"
      >
        <div className="flex items-start gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-semibold text-amber-800">What happens next?</p>
            <div className="mt-1.5 md:mt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-amber-700/80">
                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span>Admin verifies your documents (24-48 hours)</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-amber-700/80">
                <Shield className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span>You'll receive a verified badge on your profile</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-amber-700/80">
                <Award className="w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0" />
                <span>Get access to exclusive community features</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 md:mt-6"
      >
        <p className="text-[10px] md:text-xs text-[#6B5E5A] mb-2 md:mb-3 flex items-center justify-center gap-1.5">
          <Share2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
          Share your achievement
        </p>
        <div className="flex items-center justify-center gap-2 md:gap-3">
          {[
            { icon: FaTwitter, label: 'Twitter', color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]' },
            { icon: FaLinkedin, label: 'LinkedIn', color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]' },
            { icon: FaWhatsapp, label: 'WhatsApp', color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]' },
            { icon: Mail, label: 'Email', color: 'hover:bg-[#EA4335]/10 hover:text-[#EA4335]' },
          ].map((social, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-1.5 md:p-2 rounded-full bg-white/50 border border-[#D4C8C0]/30 text-[#6B5E5A] transition-all duration-300 ${social.color}`}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title: 'I just joined Prabasi Odia Community!',
                    text: 'I just joined the Prabasi Odia community! 🎉 Come join us!',
                    url: window.location.origin,
                  }).catch(() => {});
                }
              }}
            >
              <social.icon className="w-3 h-3 md:w-4 md:h-4" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoProfile}
          className="px-5 md:px-8 py-3 md:py-3.5 rounded-2xl bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white font-medium hover:shadow-xl shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
        >
          <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Go to Profile
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoHome}
          className="px-5 md:px-8 py-3 md:py-3.5 rounded-2xl border-2 border-[#6B1E5B]/30 text-[#6B1E5B] font-medium hover:bg-[#6B1E5B]/5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
        >
          <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Go to Home
        </motion.button>
      </motion.div>

      {/* Auto Redirect */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 md:mt-6 text-[10px] md:text-xs text-[#6B5E5A]/50 flex items-center justify-center gap-1.5"
      >
        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
        Redirecting to profile in {countdown}s...
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#6B1E5B]"
        />
      </motion.p>

      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#D9772B]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#6B1E5B]/5 blur-3xl pointer-events-none" />
      
      {/* Floating hearts */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: [-20, -60, -100],
            opacity: [0, 1, 0],
            x: [i * 20 - 20, i * 30 - 30, i * 20 - 20]
          }}
          transition={{ 
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut"
          }}
          className="absolute pointer-events-none"
          style={{ 
            left: `${30 + i * 20}%`,
            top: `${20 + i * 10}%`
          }}
        >
          <Heart className={`w-3 h-3 md:w-4 md:h-4 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-purple-400' : 'text-pink-400'}`} />
        </motion.div>
      ))}
    </motion.div>
  );
}