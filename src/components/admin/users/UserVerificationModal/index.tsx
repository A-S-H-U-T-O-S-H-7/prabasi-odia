"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCheck, Loader2, XCircle, AlertCircle, Shield, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { UserData, VerifyUserCommunityOptions } from "@/lib/services/adminUserService";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import { emailService } from "@/lib/services/emailService";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";

import { PersonalDetails } from "./PersonalDetails";
import { AddressDetails } from "./AddressDetails";
import { InterestsSection } from "./InterestsSection"; 
import { IdDetails } from "./IdDetails";
import { DocumentsSection } from "./DocumentsSection";
import { CommunityAssignment } from "./CommunityAssignment";
import { RejectConfirmation } from "./RejectConfirmation";

interface UserVerificationModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (
    uid: string,
    memberId: string,
    communityOptions: VerifyUserCommunityOptions
  ) => Promise<void>;
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
  const { log } = useActivityLogger();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [memberCount, setMemberCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("");
  const [communityAction, setCommunityAction] = useState<"auto" | "existing" | "create">("auto");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (isOpen && user) {
      fetchMemberCount();
      loadCommunities();
      resetState();
    }
  }, [isOpen, user]);

  const resetState = () => {
    setSelectedCommunityId("");
    setCommunityAction("auto");
    setSearchTerm("");
    setSelectedCommunityName("");
    setIsSearchOpen(false);
    setShowRejectForm(false);
    setRejectReason("");
  };

  // ============================================
  // DATA FETCHING
  // ============================================
  const loadCommunities = async () => {
    setLoadingCommunities(true);
    try {
      const result = await publicCommunityService.getActiveCommunities();
      if (result.success) {
        setCommunities(result.communities);
      }
    } catch (error) {
      console.error("Error loading communities:", error);
    } finally {
      setLoadingCommunities(false);
    }
  };

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

  // ============================================
  // MEMBER ID GENERATION
  // ============================================
  const generateMemberId = (userData: UserData, count: number) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const nameParts = userData.displayName?.split(" ") || [];
    let initials = "";
    if (nameParts.length >= 2) {
      initials = nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
    } else if (nameParts.length === 1) {
      initials = nameParts[0].charAt(0).toUpperCase() + "X";
    } else {
      initials = "OD";
    }
    const age = userData.age || 0;
    const serial = String(count).padStart(5, "0");
    return `${currentYear}${initials}${age}${serial}`;
  };

  const regenerateMemberId = () => {
    if (user) {
      const newId = generateMemberId(user, memberCount);
      setMemberId(newId);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleVerify = async () => {
    if (user?.isVerified) {
      toast.error("This member is already verified");
      return;
    }

    if (!memberId || memberId.trim().length === 0) {
      toast.error("Please generate or enter a Member ID");
      return;
    }

    if (communityAction === "existing" && !selectedCommunityId) {
      toast.error("Please select a community");
      return;
    }

    if (communityAction === "create") {
      const createName =
        user!.requestedCommunityName || user!.currentCity || user!.odishaCity || "";
      if (!String(createName).trim()) {
        toast.error("No community name available to create. Please use Assign Existing.");
        return;
      }
    }

    if (communityAction === "auto" && !user!.nearbyCommunityId) {
      const createName =
        user!.requestedCommunityName || user!.currentCity || user!.odishaCity || "";
      if (!String(createName).trim()) {
        toast.error("No auto community found. Please Assign Existing or Create New.");
        return;
      }
    }

    const finalMemberId = memberId || generateMemberId(user!, memberCount);

    const selected = communities.find((c) => c.id === selectedCommunityId);
    const communityOptions: VerifyUserCommunityOptions = {
      action: communityAction,
      communityId: communityAction === "existing" ? selectedCommunityId : undefined,
      communityName:
        communityAction === "existing"
          ? selected?.name
          : communityAction === "auto"
            ? user!.nearbyCommunityName || user!.requestedCommunityName || user!.currentCity || undefined
            : user!.requestedCommunityName || user!.currentCity || user!.odishaCity || undefined,
      createName:
        communityAction === "create" || (communityAction === "auto" && !user!.nearbyCommunityId)
          ? user!.requestedCommunityName || user!.currentCity || user!.odishaCity || undefined
          : undefined,
    };

    const emailCommunityName =
      communityOptions.communityName ||
      communityOptions.createName ||
      user!.currentCity ||
      "Prabasi Odia Community";

    await log({
      action: ActivityActions.VERIFY,
      entityType: ActivityEntityTypes.USER,
      entityId: user!.uid,
      entityTitle: user!.displayName,
      details: `Verified user ${user!.displayName} with member ID ${finalMemberId} (${communityAction}${
        communityOptions.communityName || communityOptions.createName
          ? `: ${communityOptions.communityName || communityOptions.createName}`
          : ""
      })`,
    });

    await onVerify(user!.uid, finalMemberId, communityOptions);

    try {
      await emailService.sendVerificationEmail({
        uid: user!.uid,
        name: user!.displayName || "Member",
        email: user!.email || "",
        memberId: finalMemberId,
        memberSince: user!.createdAt || new Date().toISOString(),
        communityName: emailCommunityName,
        bloodGroup: user!.bloodGroup || "",
        location: [user!.currentCity, user!.currentState].filter(Boolean).join(", "),
        photoURL: user!.photoURL || user!.documents?.profilePhoto || "",
      });
      console.log("✅ Verification email sent successfully");
    } catch (emailError) {
      console.error("Verification email error:", emailError);
    }
  };

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

  const handleCommunitySelect = (community: PublicCommunity) => {
    setSelectedCommunityId(community.id);
    setSelectedCommunityName(community.name);
    setSearchTerm(community.name);
    setIsSearchOpen(false);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (dob?: string): number | null => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const filteredCommunities = communities.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search) ||
      c.city.toLowerCase().includes(search) ||
      c.state.toLowerCase().includes(search)
    );
  });

  // ============================================
  // DOCUMENT CHECK
  // ============================================
  const hasAadharFront = user?.documents?.aadharFront;
  const hasAadharBack = user?.documents?.aadharBack;
  const hasPassportFile = user?.documents?.passportFile;

  // ============================================
  // EARLY RETURN
  // ============================================
  if (!user) return null;

  // ============================================
  // RENDER
  // ============================================
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.displayName?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#2A1636] truncate">{user.displayName || "Unknown User"}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-[#D9772B]/20 text-[#D9772B]'
                      }`}>
                        {user.isVerified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B5E5A] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-[#6B1E5B]/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#6B5E5A]" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 3 Column Grid - Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PersonalDetails user={user} formatDate={formatDate} calculateAge={calculateAge} />
                  <AddressDetails user={user} />
                </div>

                {/* Interests */}
                <InterestsSection user={user} />

                {/* Aadhar & Passport */}
                <IdDetails user={user} />

                {/* Documents */}
                <DocumentsSection 
                  user={user} 
                  hasAadharFront={hasAadharFront}
                  hasAadharBack={hasAadharBack}
                  hasPassportFile={hasPassportFile}
                />

                {/* Verification & Community */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#6B1E5B]" />
                    Verification & Community
                  </h4>

                  {user.isVerified ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <UserCheck className="w-4 h-4 flex-shrink-0" />
                        <span>This member is already verified. Verify action is locked.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-[#D4C8C0]/40 bg-white/50 px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-[#6B5E5A] mb-1">Member ID</p>
                          <p className="font-mono font-semibold text-[#2A1636]">{user.memberId || "—"}</p>
                        </div>
                        <div className="rounded-xl border border-[#D4C8C0]/40 bg-white/50 px-3 py-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-[#6B5E5A] mb-1">Community</p>
                          <p className="font-medium text-[#2A1636]">
                            {user.nearbyCommunityName || user.requestedCommunityName || "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="w-full py-3 rounded-xl border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <>
                      <CommunityAssignment
                        user={user}
                        communities={communities}
                        loadingCommunities={loadingCommunities}
                        communityAction={communityAction}
                        setCommunityAction={setCommunityAction}
                        selectedCommunityId={selectedCommunityId}
                        setSelectedCommunityId={setSelectedCommunityId}
                        selectedCommunityName={selectedCommunityName}
                        setSelectedCommunityName={setSelectedCommunityName}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        isSearchOpen={isSearchOpen}
                        setIsSearchOpen={setIsSearchOpen}
                        handleCommunitySelect={handleCommunitySelect}
                        filteredCommunities={filteredCommunities}
                      />

                      {/* Member ID */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-[#2A1636]">Member ID <span className="text-red-400">*</span></label>
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
                            className={`w-full px-3 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-sm font-mono ${
                              !memberId ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
                            }`}
                          />
                          {isLoadingCount && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-[#6B5E5A]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B5E5A] mt-1">
                          Format: Year(2-digit) + Name Initials + Age + Serial Number • <span className="text-[#6B1E5B]">Example: 26SD3000001</span>
                        </p>
                        {!memberId && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Member ID is required
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerify}
                          disabled={isVerifying || isLoadingCount || !memberId}
                          className={`flex-1 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                            isVerifying || isLoadingCount || !memberId
                              ? 'bg-gray-400 cursor-not-allowed opacity-50'
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg hover:scale-[1.02]'
                          }`}
                        >
                          {isVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Verify Member
                        </button>
                        <button
                          onClick={() => setShowRejectForm(true)}
                          className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Reject
                        </button>
                      </div>

                      {!memberId && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Please generate or enter a Member ID
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reject confirmation popup */}
          <RejectConfirmation
            showRejectForm={showRejectForm}
            setShowRejectForm={setShowRejectForm}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            handleReject={handleReject}
            isVerifying={isVerifying}
            userDisplayName={user.displayName || "Unknown User"}
          />
        </>
      )}
    </AnimatePresence>
  );
}