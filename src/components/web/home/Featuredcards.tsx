'use client';

import { motion } from 'framer-motion';
import { 
  Users, Globe, Calendar, Briefcase, GraduationCap, 
  Heart, MapPin, Gift, Star, Sparkles, Award, 
  Newspaper, Shield, TrendingUp, Handshake, Building2,
  Laptop, Mic, Gift as GiftIcon, UserPlus, Rocket,
  Zap, Music, BookOpen, Coffee, Compass, Palette,
  Languages
} from 'lucide-react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  color: string;
  bgColor: string;
  shadowColor: string;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  delay = 0, 
  color, 
  bgColor, 
  shadowColor,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08 }}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.2 }
      }}
      className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-white/40 to-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.10)] transition-all duration-300"
    >
      {/* Claymorphism Inner */}
      <div className="relative h-full rounded-2xl bg-white/60 backdrop-blur-sm p-6 overflow-hidden">
        {/* Soft Inner Shadow for Clay Effect */}
        <div className="absolute inset-0 rounded-2xl shadow-[inset_2px_2px_8px_rgba(255,255,255,0.6),inset_-2px_-2px_8px_rgba(0,0,0,0.04)] pointer-events-none" />
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10">
          {/* Icon with Claymorphism */}
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
            style={{
              background: bgColor,
              boxShadow: `0 8px 24px ${shadowColor}, inset 2px 2px 8px rgba(255,255,255,0.4), inset -2px -2px 8px rgba(0,0,0,0.08)`
            }}
          >
            <div className={color}>
              {icon}
            </div>
          </div>
          
          <h3 className="text-base font-semibold text-[#2A1636] mb-2 group-hover:text-[#6B1E5B] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-[#6B5E5A] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityFeatures() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Directory & Networking",
      description: "Connect with Odias worldwide, local chapters, alumni groups and professional networks across the globe.",
      color: "text-blue-600",
      bgColor: "bg-blue-100/80",
      shadowColor: "rgba(37,99,235,0.15)"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "News, Events & Culture",
      description: "Stay updated on cultural programmes, festivals, webinars, regional events and online performances.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/80",
      shadowColor: "rgba(16,185,129,0.15)"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Job, Internship & Scholarship Alerts",
      description: "Curated opportunities targeted to Odia youth, professionals, and students from Odisha.",
      color: "text-amber-600",
      bgColor: "bg-amber-100/80",
      shadowColor: "rgba(217,119,6,0.15)"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Mentorship & Skill Programmes",
      description: "Access to mentoring, training, language/cultural classes, and capacity-building workshops.",
      color: "text-violet-600",
      bgColor: "bg-violet-100/80",
      shadowColor: "rgba(139,92,246,0.15)"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emergency Assistance & Coordination",
      description: "Help locating local contacts, coordinating support during crises, or linking to consular/NGO help.",
      color: "text-rose-600",
      bgColor: "bg-rose-100/80",
      shadowColor: "rgba(225,29,72,0.15)"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Travel & Relocation Guidance",
      description: "Practical tips on settling in a new city/country, documentation checklists and local resources.",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100/80",
      shadowColor: "rgba(6,182,212,0.15)"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Small Grants, Sponsorships & Funds",
      description: "Micro-grants, scholarships, or event sponsorships for registered members.",
      color: "text-pink-600",
      bgColor: "bg-pink-100/80",
      shadowColor: "rgba(236,72,153,0.15)"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Volunteering & Leadership Roles",
      description: "Opportunities to run local community activities or lead chapters worldwide.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100/80",
      shadowColor: "rgba(234,179,8,0.15)"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Visibility for Initiatives",
      description: "Platform to showcase artists, entrepreneurs, startups or social projects from the Odia diaspora.",
      color: "text-orange-600",
      bgColor: "bg-orange-100/80",
      shadowColor: "rgba(234,88,12,0.15)"
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "Newsletters & Targeted Communications",
      description: "Regular curated content and calls-to-action relevant to the diaspora.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100/80",
      shadowColor: "rgba(99,102,241,0.15)"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Reputation & Recognition",
      description: "Certificates, badges or lists of active diaspora members used by the NGO for outreach.",
      color: "text-purple-600",
      bgColor: "bg-purple-100/80",
      shadowColor: "rgba(168,85,247,0.15)"
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Cultural Exchange Programs",
      description: "Participate in cultural exchange initiatives, learn Odia language, and connect with your roots.",
      color: "text-teal-600",
      bgColor: "bg-teal-100/80",
      shadowColor: "rgba(20,184,166,0.15)"
    },
  ];

  return (
    <section className="relative py-8 md:py-10 overflow-hidden">
      {/* Soft Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F0] via-[#FDF6F0] to-[#FFF0EB]" />
      
      {/* Subtle Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#6B1E5B]/8 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D9772B]/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E8B84C]/5 blur-[100px]" />
        
        {/* Soft Pattern Dots */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-[#6B1E5B]" />
          <div className="absolute top-40 right-20 w-4 h-4 rounded-full bg-[#D9772B]" />
          <div className="absolute bottom-32 left-1/4 w-3 h-3 rounded-full bg-[#6B1E5B]" />
          <div className="absolute bottom-20 right-1/3 w-4 h-4 rounded-full bg-[#D9772B]" />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-[#E8B84C]" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#6B1E5B]" />
        </div>
      </div>

      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm text-[#6B1E5B] text-sm font-medium shadow-[0_4px_16px_rgba(107,30,91,0.08)] border border-white/50">
              <Shield className="w-4 h-4" />
              Empowering the Odia Diaspora
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2A1636]"
          >
            Everything You Need,{' '}
            <span className="bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] bg-clip-text text-transparent">
              All in One Place
            </span>
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
              color={feature.color}
              bgColor={feature.bgColor}
              shadowColor={feature.shadowColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}