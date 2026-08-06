'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, ExternalLink, Calendar, Briefcase, Award, X, Mail, Phone, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { useState, useEffect } from 'react';

interface Member {
  id: string;
  name: string;
  position: string;
  designation?: string;
  organization?: string;
  bio?: string;
  photoURL?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  featured?: boolean;
  joinedDate?: string;
  experience?: string;
  email?: string;
  phone?: string;
  location?: string;
  achievements?: string[];
  expertise?: string[];
}

interface AdvisoryBoardCardProps {
  member: Member;
  index: number;
}

export default function AdvisoryBoardCard({ member, index }: AdvisoryBoardCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click for mobile
  const handleCardClick = () => {
    if (isMobile) {
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Main Card with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        viewport={{ once: true }}
        className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-[#6B1E5B]/10 cursor-pointer ${
          isHovered && !isMobile ? 'ring-2 ring-[#6B1E5B]/30 ring-offset-2' : ''
        } ${isMobile ? 'active:scale-[0.98]' : ''}`}
        onClick={handleCardClick}
        style={{
          background: 'linear-gradient(135deg, #FFF5F5 0%, #FDE8F0 30%, #F5D4E8 60%, #E8C4DC 100%)',
        }}
      >
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #6B1E5B 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Gold Decorative Circle */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 transition-colors duration-500" />
        
        {/* Photo - Round */}
        <div className="relative pt-6 px-6">
          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/80 shadow-lg group-hover:border-[#D4AF37] transition-all duration-500">
            {member.photoURL ? (
              <Image
                src={member.photoURL}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
                <span className="text-4xl font-serif font-bold text-white">
                  {member.name?.charAt(0) || '?'}
                </span>
              </div>
            )}

            {member.featured && (
              <div className="absolute -top-1 -right-1 z-20">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg animate-pulse">
                  <Star className="w-4 h-4 text-[#6B1E5B] fill-[#6B1E5B]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-center relative z-10">
          <h3 className="text-lg font-serif font-bold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors">
            {member.name}
          </h3>
          
          <p className="text-sm font-medium text-[#D9772B] mt-0.5">
            {member.position}
          </p>
          
          {member.designation && (
            <p className="text-xs text-[#5A4A4A] mt-1">
              {member.designation}
              {member.organization && ` at ${member.organization}`}
            </p>
          )}

          {/* Hover/Click indicator */}
          <div className="mt-3 text-[#6B1E5B]/40 text-xs font-medium flex items-center justify-center gap-1">
            {isMobile ? (
              <>
                <span>Tap for details</span>
                <ChevronDown className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Hover for details</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-[#6B1E5B]/10">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/50 text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label={`${member.name} LinkedIn`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/50 text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label={`${member.name} Twitter`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaTwitter className="w-4 h-4" />
              </a>
            )}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/50 text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm"
                aria-label={`${member.name} Website`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Desktop Tooltip Popover */}
      {!isMobile && (
        <div className="absolute top-1/2 left-full z-50 -translate-y-1/2 ml-4 pointer-events-none">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-auto"
              >
                <div className="relative">
                  {/* Pointer/Triangle */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-white rotate-45 border-l border-t border-[#6B1E5B]/20 shadow-lg" />
                  </div>

                  {/* Popover Content */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-[480px] max-h-[500px] overflow-y-auto border border-[#6B1E5B]/20 relative ml-1">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-transparent rounded-t-2xl" />
                    
                    {/* Popover content */}
                    <PopoverContent member={member} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Slide-up Modal */}
      <AnimatePresence>
        {isMobile && isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Handle Bar */}
              <div className="sticky top-0 bg-white pt-4 pb-2 px-6 border-b border-[#6B1E5B]/10 z-10">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-1 bg-[#6B1E5B]/30 rounded-full mx-auto" />
                  <button
                    onClick={closeModal}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 pb-8">
                <MobileModalContent member={member} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Popover Content Component (for desktop)
function PopoverContent({ member }: { member: Member }) {
  return (
    <>
      {/* Header with photo and name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#6B1E5B]/20 flex-shrink-0">
          {member.photoURL ? (
            <Image
              src={member.photoURL}
              alt={member.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
              <span className="text-lg font-serif font-bold text-white">
                {member.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif font-bold text-[#2A1636] text-base truncate">
            {member.name}
          </h4>
          <p className="text-xs text-[#D9772B] font-medium">
            {member.position}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Bio */}
        {member.bio && (
          <div className="bg-gradient-to-r from-[#FDF5F8] to-transparent rounded-xl p-3">
            <p className="text-sm text-[#5A4A4A] leading-relaxed">
              {member.bio}
            </p>
          </div>
        )}

        {/* Experience */}
        {member.experience && (
          <div className="flex items-start gap-2 bg-[#FDF5F8] p-2 rounded-lg">
            <Briefcase className="w-4 h-4 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#2A1636]">Experience</p>
              <p className="text-sm text-[#5A4A4A]">{member.experience}</p>
            </div>
          </div>
        )}

        {/* Joined Date & Location */}
        <div className="grid grid-cols-2 gap-2">
          {member.joinedDate && (
            <div className="flex items-start gap-2 bg-[#FDF5F8] p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#2A1636]">Joined</p>
                <p className="text-xs text-[#5A4A4A]">{member.joinedDate}</p>
              </div>
            </div>
          )}
          {member.location && (
            <div className="flex items-start gap-2 bg-[#FDF5F8] p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#2A1636]">Location</p>
                <p className="text-xs text-[#5A4A4A] truncate">{member.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Expertise */}
        {member.expertise && member.expertise.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#2A1636] mb-1.5">Expertise</p>
            <div className="flex flex-wrap gap-1.5">
              {member.expertise.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gradient-to-r from-[#6B1E5B]/10 to-[#D9772B]/10 text-[#6B1E5B] text-xs rounded-full border border-[#6B1E5B]/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {member.achievements && member.achievements.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#2A1636] mb-1.5">Achievements</p>
            <div className="space-y-1">
              {member.achievements.slice(0, 3).map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#FDF5F8] p-1.5 rounded-lg">
                  <Award className="w-3 h-3 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#5A4A4A]">{achievement}</p>
                </div>
              ))}
              {member.achievements.length > 3 && (
                <p className="text-xs text-[#D9772B] text-center">
                  +{member.achievements.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        {(member.email || member.phone) && (
          <div className="pt-2 border-t border-[#6B1E5B]/10 flex gap-3">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 text-xs text-[#5A4A4A] hover:text-[#6B1E5B] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#6B1E5B]" />
                <span className="truncate max-w-[100px]">{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-1.5 text-xs text-[#5A4A4A] hover:text-[#6B1E5B] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#6B1E5B]" />
                <span>{member.phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Mobile Modal Content
function MobileModalContent({ member }: { member: Member }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#6B1E5B]/20 flex-shrink-0">
          {member.photoURL ? (
            <Image
              src={member.photoURL}
              alt={member.name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
              <span className="text-3xl font-serif font-bold text-white">
                {member.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-serif font-bold text-[#2A1636]">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-[#D9772B]">
            {member.position}
          </p>
          {member.organization && (
            <p className="text-xs text-[#5A4A4A]">
              {member.organization}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Bio */}
        {member.bio && (
          <div className="bg-gradient-to-r from-[#FDF5F8] to-transparent rounded-xl p-4">
            <p className="text-sm text-[#5A4A4A] leading-relaxed">
              {member.bio}
            </p>
          </div>
        )}

        {/* Experience */}
        {member.experience && (
          <div className="flex items-start gap-3 bg-[#FDF5F8] p-3 rounded-xl">
            <Briefcase className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide">Experience</p>
              <p className="text-sm text-[#5A4A4A]">{member.experience}</p>
            </div>
          </div>
        )}

        {/* Joined Date & Location */}
        <div className="grid grid-cols-2 gap-3">
          {member.joinedDate && (
            <div className="flex items-start gap-3 bg-[#FDF5F8] p-3 rounded-xl">
              <Calendar className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide">Joined</p>
                <p className="text-sm text-[#5A4A4A]">{member.joinedDate}</p>
              </div>
            </div>
          )}
          {member.location && (
            <div className="flex items-start gap-3 bg-[#FDF5F8] p-3 rounded-xl">
              <MapPin className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide">Location</p>
                <p className="text-sm text-[#5A4A4A]">{member.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Expertise */}
        {member.expertise && member.expertise.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide mb-2">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {member.expertise.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#6B1E5B]/10 to-[#D9772B]/10 text-[#6B1E5B] text-sm rounded-full border border-[#6B1E5B]/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {member.achievements && member.achievements.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide mb-2">Achievements</p>
            <div className="space-y-2">
              {member.achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-[#FDF5F8] p-3 rounded-xl">
                  <Award className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#5A4A4A]">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {(member.email || member.phone) && (
          <div className="pt-4 border-t border-[#6B1E5B]/10 flex flex-col gap-3">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-3 text-sm text-[#5A4A4A] hover:text-[#6B1E5B] transition-colors p-3 bg-[#FDF5F8] rounded-xl"
              >
                <Mail className="w-5 h-5 text-[#6B1E5B]" />
                <span>{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-3 text-sm text-[#5A4A4A] hover:text-[#6B1E5B] transition-colors p-3 bg-[#FDF5F8] rounded-xl"
              >
                <Phone className="w-5 h-5 text-[#6B1E5B]" />
                <span>{member.phone}</span>
              </a>
            )}
          </div>
        )}

        {/* Social Links - Mobile */}
        <div className="pt-4 border-t border-[#6B1E5B]/10">
          <p className="text-xs font-medium text-[#2A1636] uppercase tracking-wide mb-3">Connect</p>
          <div className="flex gap-3">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FDF5F8] text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </a>
            )}
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FDF5F8] text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            )}
            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FDF5F8] text-[#5A4A4A] hover:bg-[#6B1E5B] hover:text-white transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}