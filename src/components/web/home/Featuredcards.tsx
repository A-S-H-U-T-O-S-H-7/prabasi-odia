"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Users, Globe, Calendar, Briefcase, GraduationCap, 
  Heart, MapPin, Gift, Star, Sparkles, Award, 
  Newspaper, Shield, TrendingUp, Handshake, Building2,
  Laptop, Mic, Gift as GiftIcon, UserPlus, Rocket,
  Zap, Music, BookOpen, Coffee, Compass, Palette,
  Languages
} from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  titleOd: string;
  descriptionOd: string;
  delay?: number;
  color: string;
  bgColor: string;
  shadowColor: string;
  language: 'en' | 'od';
}

const FeatureCard = ({ 
  icon, 
  title, 
  description,
  titleOd,
  descriptionOd,
  delay = 0, 
  color, 
  bgColor, 
  shadowColor,
  language
}: FeatureCardProps) => {
  const displayTitle = language === 'od' ? titleOd : title;
  const displayDescription = language === 'od' ? descriptionOd : description;

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
            {displayTitle}
          </h3>
          <p className="text-sm text-[#6B5E5A] leading-relaxed">
            {displayDescription}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityFeatures() {
  const [language, setLanguage] = useState<'en' | 'od'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'od' : 'en');
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Directory & Networking",
      description: "Connect with Odias worldwide, local chapters, alumni groups and professional networks across the globe.",
      titleOd: "ସମୁଦାୟ ନିର୍ଦ୍ଦେଶିକା ଓ ନେଟୱର୍କିଙ୍ଗ",
      descriptionOd: "ବିଶ୍ୱସ୍ତରୀୟ ଓଡ଼ିଆଙ୍କ ସହ ଯୋଡ଼ିହୁଅନ୍ତୁ, ସ୍ଥାନୀୟ ଶାଖା, ପୂର୍ବତନ ଛାତ୍ର ସଂଘ ଓ ବୃତ୍ତିଗତ ନେଟୱର୍କ ସହିତ ସଂଯୋଗ କରନ୍ତୁ।",
      color: "text-blue-600",
      bgColor: "bg-blue-100/80",
      shadowColor: "rgba(37,99,235,0.15)"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "News, Events & Culture",
      description: "Stay updated on cultural programmes, festivals, webinars, regional events and online performances.",
      titleOd: "ଖବର, କାର୍ଯ୍ୟକ୍ରମ ଓ ସଂସ୍କୃତି",
      descriptionOd: "ସାଂସ୍କୃତିକ କାର୍ଯ୍ୟକ୍ରମ, ପର୍ବପର୍ବାଣୀ, ୱେବିନାର, ଆଞ୍ଚଳିକ କାର୍ଯ୍ୟକ୍ରମ ଓ ଅନଲାଇନ୍ ପ୍ରଦର୍ଶନ ସମ୍ପର୍କରେ ଅପଡେଟ୍ ପାଆନ୍ତୁ।",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100/80",
      shadowColor: "rgba(16,185,129,0.15)"
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Job, Internship & Scholarship Alerts",
      description: "Curated opportunities targeted to Odia youth, professionals, and students from Odisha.",
      titleOd: "ଚାକିରି, ଇଣ୍ଟର୍ନସିପ୍ ଓ ସ୍କଲାରସିପ୍ ସୂଚନା",
      descriptionOd: "ଓଡ଼ିଆ ଯୁବକ, ବୃତ୍ତିଗତ ଓ ଓଡ଼ିଶାର ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ସୁଯୋଗ।",
      color: "text-amber-600",
      bgColor: "bg-amber-100/80",
      shadowColor: "rgba(217,119,6,0.15)"
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Mentorship & Skill Programmes",
      description: "Access to mentoring, training, language/cultural classes, and capacity-building workshops.",
      titleOd: "ମେଣ୍ଟରସିପ୍ ଓ କୌଶଳ କାର୍ଯ୍ୟକ୍ରମ",
      descriptionOd: "ମେଣ୍ଟରିଙ୍ଗ, ତାଲିମ, ଭାଷା/ସଂସ୍କୃତି ଶ୍ରେଣୀ ଓ କ୍ଷମତା ବୃଦ୍ଧି କାର୍ଯ୍ୟଶାଳା।",
      color: "text-violet-600",
      bgColor: "bg-violet-100/80",
      shadowColor: "rgba(139,92,246,0.15)"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emergency Assistance & Coordination",
      description: "Help locating local contacts, coordinating support during crises, or linking to consular/NGO help.",
      titleOd: "ଜରୁରୀ ସହାୟତା ଓ ସମନ୍ୱୟ",
      descriptionOd: "ସ୍ଥାନୀୟ ସମ୍ପର୍କ ଖୋଜିବା, ସଙ୍କଟ ସମୟରେ ସହାୟତା ସମନ୍ୱୟ କରିବା ଏବଂ କନସୁଲାର/ଏନଜିଓ ସହାୟତା ପାଇବା।",
      color: "text-rose-600",
      bgColor: "bg-rose-100/80",
      shadowColor: "rgba(225,29,72,0.15)"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Travel & Relocation Guidance",
      description: "Practical tips on settling in a new city/country, documentation checklists and local resources.",
      titleOd: "ଯାତ୍ରା ଓ ସ୍ଥାନାନ୍ତର ମାର୍ଗଦର୍ଶନ",
      descriptionOd: "ନୂଆ ସହର/ଦେଶରେ ବସବାସ ପାଇଁ ବ୍ୟବହାରିକ ଟିପ୍ସ, ଡକ୍ୟୁମେଣ୍ଟେସନ୍ ଚେକଲିଷ୍ଟ ଓ ସ୍ଥାନୀୟ ସମ୍ବଳ।",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100/80",
      shadowColor: "rgba(6,182,212,0.15)"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Small Grants, Sponsorships & Funds",
      description: "Micro-grants, scholarships, or event sponsorships for registered members.",
      titleOd: "ଛୋଟ ଅନୁଦାନ, ପ୍ରାୟୋଜକତା ଓ ପାଣ୍ଠି",
      descriptionOd: "ପଞ୍ଜୀକୃତ ସଦସ୍ୟମାନଙ୍କ ପାଇଁ ମାଇକ୍ରୋ-ଗ୍ରାଣ୍ଟ, ସ୍କଲାରସିପ୍ କିମ୍ବା ଇଭେଣ୍ଟ ପ୍ରାୟୋଜକତା।",
      color: "text-pink-600",
      bgColor: "bg-pink-100/80",
      shadowColor: "rgba(236,72,153,0.15)"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Volunteering & Leadership Roles",
      description: "Opportunities to run local community activities or lead chapters worldwide.",
      titleOd: "ସ୍ଵେଚ୍ଛାସେବା ଓ ନେତୃତ୍ୱ ଭୂମିକା",
      descriptionOd: "ସ୍ଥାନୀୟ ସମୁଦାୟ କାର୍ଯ୍ୟକଳାପ ଚଳାଇବା କିମ୍ବା ବିଶ୍ୱସ୍ତରରେ ଶାଖା ପରିଚାଳନା କରିବାର ସୁଯୋଗ।",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100/80",
      shadowColor: "rgba(234,179,8,0.15)"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Visibility for Initiatives",
      description: "Platform to showcase artists, entrepreneurs, startups or social projects from the Odia diaspora.",
      titleOd: "ପଦକ୍ଷେପଗୁଡ଼ିକର ଦୃଶ୍ୟମାନତା",
      descriptionOd: "ଓଡ଼ିଆ ପ୍ରବାସୀଙ୍କ କଳାକାର, ଉଦ୍ୟୋଗୀ, ଷ୍ଟାର୍ଟଅପ୍ କିମ୍ବା ସାମାଜିକ ପ୍ରକଳ୍ପଗୁଡ଼ିକୁ ପ୍ରଦର୍ଶିତ କରିବାର ପ୍ଲାଟଫର୍ମ।",
      color: "text-orange-600",
      bgColor: "bg-orange-100/80",
      shadowColor: "rgba(234,88,12,0.15)"
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "Newsletters & Targeted Communications",
      description: "Regular curated content and calls-to-action relevant to the diaspora.",
      titleOd: "ନ୍ୟୁଜଲେଟର ଓ ଲକ୍ଷ୍ୟଭିତ୍ତିକ ସମ୍ପର୍କ",
      descriptionOd: "ପ୍ରବାସୀଙ୍କ ପାଇଁ ନିୟମିତ କ୍ୟୁରେଟେଡ୍ ବିଷୟବସ୍ତୁ ଓ କଲ୍-ଟୁ-ଆକ୍ସନ।",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100/80",
      shadowColor: "rgba(99,102,241,0.15)"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Reputation & Recognition",
      description: "Certificates, badges or lists of active diaspora members used by the NGO for outreach.",
      titleOd: "ପ୍ରତିଷ୍ଠା ଓ ସ୍ୱୀକୃତି",
      descriptionOd: "ଏନଜିଓଦ୍ୱାରା ଆଉଟ୍ରିଚ୍ ପାଇଁ ବ୍ୟବହୃତ ସକ୍ରିୟ ପ୍ରବାସୀ ସଦସ୍ୟଙ୍କ ପ୍ରମାଣପତ୍ର, ବ୍ୟାଜ୍ କିମ୍ବା ତାଲିକା।",
      color: "text-purple-600",
      bgColor: "bg-purple-100/80",
      shadowColor: "rgba(168,85,247,0.15)"
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Cultural Exchange Programs",
      description: "Participate in cultural exchange initiatives, learn Odia language, and connect with your roots.",
      titleOd: "ସାଂସ୍କୃତିକ ବିନିମୟ କାର୍ଯ୍ୟକ୍ରମ",
      descriptionOd: "ସାଂସ୍କୃତିକ ବିନିମୟ ପଦକ୍ଷେପରେ ଅଂଶଗ୍ରହଣ କରନ୍ତୁ, ଓଡ଼ିଆ ଭାଷା ଶିଖନ୍ତୁ ଏବଂ ନିଜ ମୂଳ ସହ ସଂଯୋଗ କରନ୍ତୁ।",
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
        {/* Header with Language Toggle */}
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

            {/* Language Toggle - Both Languages Visible */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-1 p-1 rounded-full bg-white/60 backdrop-blur-sm shadow-[0_4px_16px_rgba(107,30,91,0.08)] border border-white/50"
            >
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#6B1E5B] text-white shadow-lg shadow-[#6B1E5B]/25'
                    : 'text-[#6B5E5A] hover:text-[#6B1E5B] hover:bg-white/50'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('od')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  language === 'od'
                    ? 'bg-[#6B1E5B] text-white shadow-lg shadow-[#6B1E5B]/25'
                    : 'text-[#6B5E5A] hover:text-[#6B1E5B] hover:bg-white/50'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
            </motion.div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2A1636]"
          >
            {language === 'en' ? (
              <>
                Everything You Need,{' '}
                <span className="bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] bg-clip-text text-transparent">
                  All in One Place
                </span>
              </>
            ) : (
              <>
                ଆପଣଙ୍କୁ ଯାହା ଦରକାର,{' '}
                <span className="bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] bg-clip-text text-transparent">
                  ସବୁ ଗୋଟିଏ ସ୍ଥାନରେ
                </span>
              </>
            )}
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
              titleOd={feature.titleOd}
              descriptionOd={feature.descriptionOd}
              delay={index}
              color={feature.color}
              bgColor={feature.bgColor}
              shadowColor={feature.shadowColor}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}