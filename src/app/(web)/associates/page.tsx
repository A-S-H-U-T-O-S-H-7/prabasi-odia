// src/app/(web)/associates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  Building2, 
  Globe, 
  Users, 
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { adminPartnerService, Partner } from '@/lib/services/adminPartnerService';

export default function AssociatesPage() {
  const [associates, setAssociates] = useState<Partner[]>([]);
  const [filteredAssociates, setFilteredAssociates] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociate, setSelectedAssociate] = useState<Partner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAssociates();
  }, []);

  const fetchAssociates = async () => {
    try {
      const result = await adminPartnerService.getActivePartners();
      if (result.success) {
        setAssociates(result.partners);
        setFilteredAssociates(result.partners);
      }
    } catch (error) {
      console.error('Error fetching associates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAssociates(associates);
    } else {
      const filtered = associates.filter(associate =>
        associate.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssociates(filtered);
    }
  }, [searchTerm, associates]);

  const openModal = (associate: Partner) => {
    setSelectedAssociate(associate);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssociate(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF9F2] to-[#FDE8D0]/10">
        <Loader2 className="w-12 h-12 text-[#6B1E5B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] to-[#FDE8D0]/10 py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2A1636] mb-3 sm:mb-4">
            Our <span className="text-[#6B1E5B]">Associates</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#5A4A4A] max-w-2xl mx-auto px-4">
            Meet our trusted community partners and associates who help us create meaningful impact.
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-4 sm:mt-6">
            <div className="flex-1 max-w-20 h-px bg-gradient-to-r from-transparent via-[#D9772B] to-transparent" />
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#D9772B]" />
            <div className="flex-1 max-w-20 h-px bg-gradient-to-l from-transparent via-[#D9772B] to-transparent" />
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-md mx-auto mb-8 sm:mb-12 px-3 sm:px-0"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6B1E5B]/40" />
            <input
              type="text"
              placeholder="Search associates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-full border border-[#6B1E5B]/20 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B1E5B]/40" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {filteredAssociates.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs sm:text-sm text-[#5A4A4A]/60 text-center mb-6 sm:mb-8"
          >
            Showing {filteredAssociates.length} associate{filteredAssociates.length !== 1 ? 's' : ''}
          </motion.p>
        )}

        {/* Associates Grid - 2 columns on mobile */}
        {filteredAssociates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredAssociates.map((associate, index) => (
              <motion.div
                key={associate.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => openModal(associate)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#6B1E5B]/10 h-full flex flex-col">
                  {/* Logo - Reduced height on mobile */}
                  <div className="relative h-24 sm:h-48 bg-gradient-to-br from-[#FFF5F5] to-[#FDE8F0] flex items-center justify-center p-3 sm:p-8 flex-shrink-0">
                    <div className="relative w-14 h-14 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg group-hover:border-[#6B1E5B] transition-all duration-300">
                      {associate.logo ? (
                        <Image
                          src={associate.logo}
                          alt={associate.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
                          <Building2 className="w-7 h-7 sm:w-16 sm:h-16 text-white/60" />
                        </div>
                      )}
                    </div>
                    
                    {/* Decorative elements - smaller on mobile */}
                    <div className="absolute top-1 sm:top-4 right-1 sm:right-4 w-8 h-8 sm:w-20 sm:h-20 rounded-full bg-[#D4AF37]/5 blur-xl sm:blur-2xl" />
                    <div className="absolute bottom-1 sm:bottom-4 left-1 sm:left-4 w-6 h-6 sm:w-16 sm:h-16 rounded-full bg-[#6B1E5B]/5 blur-xl sm:blur-xl" />
                  </div>

                  {/* Content - Full name visible */}
                  <div className="p-2.5 sm:p-5 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-lg font-serif font-bold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors break-words leading-tight">
                        {associate.name}
                      </h3>
                      
                      {associate.website && (
                        <div className="hidden sm:flex items-center justify-center gap-1 mt-2 text-xs text-[#5A4A4A]/60">
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">
                            {associate.website.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-1.5 sm:mt-4 pt-1.5 sm:pt-4 border-t border-[#6B1E5B]/10">
                      <span className="text-[8px] sm:text-xs font-medium text-[#6B1E5B]/60">View</span>
                      <ChevronRight className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-[#6B1E5B]/40 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Building2 className="w-20 h-20 text-[#6B1E5B]/20 mx-auto mb-4" />
            <p className="text-lg text-[#5A4A4A]">No associates found</p>
            <p className="text-sm text-[#5A4A4A]/60 mt-2">
              Try adjusting your search terms
            </p>
          </motion.div>
        )}

        {/* Stats - Responsive grid */}
        {associates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto px-3 sm:px-0"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-[#6B1E5B]/10">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#6B1E5B] mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-[#2A1636]">{associates.length}</p>
              <p className="text-xs sm:text-sm text-[#5A4A4A]">Total Associates</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-[#6B1E5B]/10">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-[#D9772B] mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-[#2A1636]">
                {associates.filter(a => a.website).length}
              </p>
              <p className="text-xs sm:text-sm text-[#5A4A4A]">With Websites</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center border border-[#6B1E5B]/10">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37] mx-auto mb-1 sm:mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-[#2A1636]">100%</p>
              <p className="text-xs sm:text-sm text-[#5A4A4A]">Active Partners</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal - Responsive */}
      {isModalOpen && selectedAssociate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>

              {/* Modal Content */}
              <div className="p-4 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-[#6B1E5B]/20 flex-shrink-0">
                    {selectedAssociate.logo ? (
                      <Image
                        src={selectedAssociate.logo}
                        alt={selectedAssociate.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6B1E5B] to-[#D9772B]">
                        <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A1636]">
                      {selectedAssociate.name}
                    </h2>
                    {selectedAssociate.website && (
                      <a
                        href={selectedAssociate.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#6B1E5B] hover:text-[#D9772B] transition-colors mt-1"
                      >
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        {selectedAssociate.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-[#FDF5F8] rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs text-[#5A4A4A] uppercase tracking-wide">Status</p>
                      <p className="text-sm sm:text-base font-medium text-[#6B1E5B] mt-1">
                        {selectedAssociate.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="bg-[#FDF5F8] rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-xs text-[#5A4A4A] uppercase tracking-wide">Partner Since</p>
                      <p className="text-sm sm:text-base font-medium text-[#2A1636] mt-1">
                        {selectedAssociate.createdAt 
                          ? new Date(selectedAssociate.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gradient-to-r from-[#FFF9F2] to-[#FDE8D0]/10 rounded-xl p-4 sm:p-6">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#2A1636] mb-2 sm:mb-3">About This Associate</h4>
                    <p className="text-xs sm:text-sm text-[#5A4A4A] leading-relaxed">
                      {selectedAssociate.name} is a valued associate of Prabasi Odia, 
                      contributing to our mission of connecting the Odia community worldwide.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {selectedAssociate.website && (
                    <a
                      href={selectedAssociate.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white rounded-xl text-center font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base"
                    >
                      Visit Website
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline ml-2" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}