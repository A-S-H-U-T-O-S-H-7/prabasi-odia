"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, MapPin, Phone, Calendar, Heart, Shield, 
  FileText, Check, XCircle, Loader2, Eye, Briefcase, Users,
  Building2, Home, Globe, Droplet, Sparkles
} from "lucide-react";
import Image from "next/image";
import { UserData } from "@/lib/services/adminUserService";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";

interface UserVerificationModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (uid: string, memberId: string) => Promise<void>;
  onReject: (uid: string, reason: string) => Promise<void>;
  isVerifying?: boolean;
}

export default function UserVerificationModal({
  user,
  isOpen,
  onClose,
  onVerify,
  onReject,
  isVerifying = false,
}: UserVerificationModalProps) {
  // ============================================
  // ALL HOOKS FIRST - TOP LEVEL
  // ============================================
  const { log } = useActivityLogger();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // ============================================
  // FETCH MEMBER COUNT WHEN MODAL OPENS
  // ============================================
  useEffect(() => {
    if (isOpen && user) {
      fetchMemberCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // ============================================
  // FUNCTIONS
  // ============================================

  // Fetch member count from Firestore
  const fetchMemberCount = async () => {
    setIsLoadingCount(true);
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('isVerified', '==', true));
      const snapshot = await getDocs(q);
      const count = snapshot.size + 1;
      setMemberCount(count);
      
      if (user) {
        const generatedId = generateMemberId(user, count);
        setMemberId(generatedId);
      }
    } catch (error) {
      console.error("Error fetching member count:", error);
      if (user) {
        const fallbackId = `26${user.displayName?.charAt(0) || 'O'}${user.displayName?.charAt(1) || 'D'}${user.age || 0}${Date.now().toString().slice(-5)}`;
        setMemberId(fallbackId);
      }
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Generate Member ID: Year(2-digit) + Initials + Age + Serial(5-digit)
  const generateMemberId = (userData: UserData, count: number) => {
    // Get current year (last 2 digits)
    const currentYear = new Date().getFullYear().toString().slice(-2);
    
    // Get initials from name
    const nameParts = userData.displayName?.split(" ") || [];
    let initials = "";
    if (nameParts.length >= 2) {
      initials = nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    } else if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0).toUpperCase() + "X";
    } else {
      initials = "OD";
    }
    
    // Get age
    const age = userData.age || 0;
    
    // Serial number padded to 5 digits
    const serial = String(count).padStart(5, "0");
    
    // Combine: Year + Initials + Age + Serial
    return `${currentYear}${initials}${age}${serial}`;
  };

  // Regenerate member ID
  const regenerateMemberId = () => {
    if (user) {
      const newId = generateMemberId(user, memberCount);
      setMemberId(newId);
    }
  };

  // Handle verification
  const handleVerify = async () => {
    const finalMemberId = memberId || generateMemberId(user!, memberCount);
    
    await log({
      action: ActivityActions.VERIFY,
      entityType: ActivityEntityTypes.USER,
      entityId: user!.uid,
      entityTitle: user!.displayName,
      details: `Verified user ${user!.displayName} with member ID ${finalMemberId}`,
    });
    
    await onVerify(user!.uid, finalMemberId);
  };

  // Handle rejection
  const handleReject = async () => {
    const reason = rejectReason || "No reason provided";
    
    await log({
      action: ActivityActions.REJECT,
      entityType: ActivityEntityTypes.USER,
      entityId: user!.uid,
      entityTitle: user!.displayName,
      details: `Rejected user ${user!.displayName}. Reason: ${reason}`,
    });
    
    onReject(user!.uid, reason);
  };

  // ============================================
  // EARLY RETURN - AFTER ALL HOOKS
  // ============================================
  if (!user) return null;

  // ============================================
  // RENDER
  // ============================================

  const hasDocuments = user.documents && (
    user.documents.aadharFront ||
    user.documents.aadharBack ||
    user.documents.voterId ||
    user.documents.profilePhoto
  );

  const documentLabels: Record<string, { label: string; icon: string }> = {
    profilePhoto: { label: "Profile Photo", icon: "📸" },
    aadharFront: { label: "Aadhar Front", icon: "🪪" },
    aadharBack: { label: "Aadhar Back", icon: "🪪" },
    voterId: { label: "Voter ID", icon: "🗳️" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-20 z-50 overflow-hidden"
          >
            <div className="h-full bg-[#FFF9F2] rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7D7E8] bg-white/50 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[#2A1636] truncate">{user.displayName || "Unknown User"}</h2>
                    <p className="text-sm text-[#6B5E5A] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.isVerified && (
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 whitespace-nowrap">
                      ✅ Verified
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-[#6B1E5B]/5 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-[#6B5E5A]" />
                  </button>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-[#E7D7E8]/50">
                    <p className="text-xs text-[#6B5E5A]">Age</p>
                    <p className="text-sm font-semibold text-[#2A1636]">{user.age || "—"}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-[#E7D7E8]/50">
                    <p className="text-xs text-[#6B5E5A]">Blood Group</p>
                    <p className="text-sm font-semibold text-[#2A1636]">{user.bloodGroup || "—"}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-[#E7D7E8]/50">
                    <p className="text-xs text-[#6B5E5A]">Gender</p>
                    <p className="text-sm font-semibold text-[#2A1636]">{user.gender || "—"}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center border border-[#E7D7E8]/50">
                    <p className="text-xs text-[#6B5E5A]">Status</p>
                    <p className={`text-sm font-semibold ${user.isVerified ? 'text-green-600' : 'text-[#D9772B]'}`}>
                      {user.isVerified ? "✅ Verified" : "⏳ Pending"}
                    </p>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: User Details */}
                  <div className="space-y-4">
                    {/* Odisha Address */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#6B1E5B]" /> Odisha Address
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-[#6B5E5A]">Address:</span> {user.odishaHomeAddress || "—"}</p>
                        <p><span className="text-[#6B5E5A]">District:</span> {user.odishaDistrict || "—"}</p>
                        <p><span className="text-[#6B5E5A]">City:</span> {user.odishaCity || "—"}</p>
                        <p><span className="text-[#6B5E5A]">Pin:</span> {user.odishaPinCode || "—"}</p>
                      </div>
                    </div>

                    {/* Current Address */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#6B1E5B]" /> Current Address
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-[#6B5E5A]">Address:</span> {user.currentAddress || "—"}</p>
                        <p><span className="text-[#6B5E5A]">City:</span> {user.currentCity || "—"}</p>
                        <p><span className="text-[#6B5E5A]">State:</span> {user.currentState || "—"}</p>
                        <p><span className="text-[#6B5E5A]">Pin:</span> {user.currentPinCode || "—"}</p>
                      </div>
                    </div>

                    {/* Nearby Community */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6B1E5B]" /> Nearby Community
                      </h4>
                      <div className="space-y-1 text-sm">
                        {user.requestedCommunityName ? (
                          <>
                            <p className="text-[#D9772B] font-medium">⚠️ Community request pending</p>
                            <p>
                              <span className="text-[#6B5E5A]">Suggested name:</span>{" "}
                              <span className="font-semibold text-[#2A1636]">{user.requestedCommunityName}</span>
                            </p>
                            <p className="text-xs text-[#6B5E5A] mt-1">
                              This community will be created automatically when you verify the user.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              <span className="text-[#6B5E5A]">Community:</span>{" "}
                              {user.nearbyCommunityName || "—"}
                            </p>
                            {user.communityRequestStatus === "joined" && (
                              <p className="text-xs text-green-600 mt-1">✅ Auto-joined on registration</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Professional */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#6B1E5B]" /> Professional
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-[#6B5E5A]">Occupation:</span> {user.occupation || "—"}</p>
                        <p><span className="text-[#6B5E5A]">Organization:</span> {user.organization || "—"}</p>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#6B1E5B]" /> Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(user.interests || []).map((interest) => (
                          <span key={interest} className="px-2.5 py-1 bg-[#6B1E5B]/5 text-[#6B1E5B] text-xs rounded-full border border-[#6B1E5B]/10">
                            {interest}
                          </span>
                        ))}
                        {(!user.interests || user.interests.length === 0) && (
                          <span className="text-sm text-[#6B5E5A]">No interests added</span>
                        )}
                      </div>
                    </div>

                    {/* Family Members */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#6B1E5B]" /> Family Members
                      </h4>
                      {(user.familyMembers && user.familyMembers.length > 0) ? (
                        <div className="space-y-2">
                          {user.familyMembers.map((member, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm p-2 bg-white/50 rounded-lg">
                              <span className="text-[#6B5E5A]">👤</span>
                              <span className="font-medium text-[#2A1636]">{member.name || "Member"}</span>
                              <span className="text-[#6B5E5A]">• {member.relation || "Family"}</span>
                              <span className="text-[#6B5E5A]">• {member.age || "—"} yrs</span>
                              {member.occupation && (
                                <span className="text-[#6B5E5A]">• {member.occupation}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B5E5A]">No family members added</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Documents & Actions */}
                  <div className="space-y-4">
                    {/* Documents */}
                    <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                      <h4 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#6B1E5B]" /> Documents
                      </h4>
                      <div className="space-y-3">
                        {user.documents && Object.entries(user.documents).map(([key, url]) => {
                          if (!url) return null;
                          const docInfo = documentLabels[key] || { label: key, icon: "📄" };
                          return (
                            <div key={key} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-[#E7D7E8]/50">
                              <span className="text-sm text-[#2A1636]">
                                {docInfo.icon} {docInfo.label}
                              </span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => window.open(url, '_blank')}
                                  className="text-[#6B1E5B] hover:text-[#531547] text-sm font-medium cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" /> View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {!hasDocuments && (
                          <p className="text-sm text-[#6B5E5A] text-center py-4">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Actions - Only show if not verified */}
                    {!user.isVerified && (
                      <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                        <h4 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#6B1E5B]" /> Verification
                        </h4>
                        
                        {/* Member ID Input with Auto-generation info */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-[#6B5E5A]">Member ID</label>
                            <button
                              onClick={regenerateMemberId}
                              className="text-xs text-[#6B1E5B] hover:text-[#531547] font-medium cursor-pointer flex items-center gap-1"
                            >
                              <span>⟳</span> Regenerate
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={memberId}
                              onChange={(e) => setMemberId(e.target.value)}
                              placeholder="Auto-generated"
                              className="w-full px-3 py-2 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm font-mono"
                            />
                            {isLoadingCount && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-[#6B5E5A]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-[#6B5E5A] mt-1">
                            Format: Year(2-digit) + Name Initials + Age + Serial Number
                            <br />
                            <span className="text-[#6B1E5B]">Example: 26SD3000001</span>
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleVerify}
                            disabled={isVerifying || isLoadingCount}
                            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Verify
                          </button>
                          <button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                        </div>

                        {/* Reject Reason */}
                        {showRejectForm && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection..."
                              className="w-full px-3 py-2 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none text-sm resize-none h-20"
                            />
                            <button
                              onClick={handleReject}
                              disabled={isVerifying}
                              className="w-full py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}