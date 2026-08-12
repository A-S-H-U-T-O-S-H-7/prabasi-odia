"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, MapPin, Phone, Calendar, Heart, Shield, 
  FileText, Check, XCircle, Loader2, Eye, Briefcase, Users,
  Building2, Home, Globe, Droplet, Sparkles, CreditCard, 
  CalendarDays, Smartphone, UserCheck, Search, AlertCircle,
  ChevronDown, ChevronUp, Image as ImageIcon, X as XIcon
} from "lucide-react";
import { FaPassport } from "react-icons/fa";
import Image from "next/image";
import { UserData, VerifyUserCommunityOptions } from "@/lib/services/adminUserService";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import { emailService } from "@/lib/services/emailService";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import { toast } from "react-hot-toast";

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
// ============================================
// DOCUMENT VIEWER COMPONENT - FIXED
// ============================================
function DocumentViewer({ url, label }: { url?: string; label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!url) return null;

  const handleView = () => {
    setIsOpen(true);
    setImageError(false);
  };

  return (
    <>
      <button
        onClick={handleView}
        className="text-xs text-[#6B1E5B] hover:underline font-medium"
      >
        View
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[80]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-20 z-[90] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E7D7E8] flex-shrink-0">
                <h3 className="text-lg font-semibold text-[#2A1636]">{label}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-[#6B1E5B]/5 transition-colors"
                >
                  <XIcon className="w-5 h-5 text-[#6B5E5A]" />
                </button>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 overflow-hidden">
                {!imageError ? (
                  <div className="relative w-full h-full max-h-[80vh]">
                    <img
                      src={url}
                      alt={label}
                      className="w-full h-full object-contain"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium">Unable to load image</p>
                    <p className="text-gray-400 text-sm mt-1">The document may not be accessible</p>
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="mt-4 px-4 py-2 bg-[#6B1E5B] text-white rounded-lg hover:bg-[#531547] transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
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
        name: user!.displayName || "Member",
        email: user!.email || "",
        memberId: finalMemberId,
        memberSince: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        communityName: emailCommunityName,
        memberCardPath: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
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
                  {/* Box 1: Personal Details */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                    <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#6B1E5B]" />
                      Personal Details
                    </h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" /> DOB
                        </span>
                        <span className="font-medium text-[#2A1636]">{formatDate(user.dob)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" /> Age
                        </span>
                        <span className="font-medium text-[#2A1636]">{user.age || calculateAge(user.dob) || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <Droplet className="w-3.5 h-3.5" /> Blood Group
                        </span>
                        <span className="font-medium text-[#2A1636]">{user.bloodGroup || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Gender
                        </span>
                        <span className="font-medium text-[#2A1636] capitalize">{user.gender || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" /> Mobile
                        </span>
                        <span className="font-medium text-[#2A1636]">
                          {user.mobileCountryCode ? `${user.mobileCountryCode} ` : ""}
                          {user.phoneNumber || user.mobileNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6B5E5A] flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5" /> Occupation
                        </span>
                        <span className="font-medium text-[#2A1636]">{user.occupation || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Odisha Address */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                    <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#6B1E5B]" />
                      Odisha Address
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-[#6B5E5A] text-xs">Address</p>
                        <p className="font-medium text-[#2A1636]">{user.odishaHomeAddress || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">District</p>
                        <p className="font-medium text-[#2A1636]">{user.odishaDistrict || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">City</p>
                        <p className="font-medium text-[#2A1636]">{user.odishaCity || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">PIN Code</p>
                        <p className="font-medium text-[#2A1636]">{user.odishaPinCode || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Box 3: Current Address */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                    <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#6B1E5B]" />
                      Current Address
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-[#6B5E5A] text-xs">Address</p>
                        <p className="font-medium text-[#2A1636]">{user.currentAddress || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">City</p>
                        <p className="font-medium text-[#2A1636]">{user.currentCity || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">State</p>
                        <p className="font-medium text-[#2A1636]">{user.currentState || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[#6B5E5A] text-xs">PIN Code</p>
                        <p className="font-medium text-[#2A1636]">{user.currentPinCode || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6B1E5B]" />
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.interests && user.interests.length > 0 ? (
                      user.interests.map((interest: string) => {
                        const interestMap: Record<string, { label: string; color: string }> = {
                          volunteering: { label: "🤝 Volunteering", color: "bg-purple-100 text-purple-700" },
                          bloodDonation: { label: "🩸 Blood Donation", color: "bg-red-100 text-red-700" },
                          jobHelp: { label: "💼 Job Help", color: "bg-blue-100 text-blue-700" },
                          socialAwareness: { label: "🌟 Social Awareness", color: "bg-orange-100 text-orange-700" },
                          cleanlinessDrives: { label: "🧹 Cleanliness Drives", color: "bg-green-100 text-green-700" },
                          culturalEvents: { label: "🎭 Cultural Events", color: "bg-amber-100 text-amber-700" },
                          mentorship: { label: "📚 Mentorship", color: "bg-indigo-100 text-indigo-700" },
                          startupNetworking: { label: "🚀 Startup Networking", color: "bg-teal-100 text-teal-700" },
                        };
                        const info = interestMap[interest];
                        return info ? (
                          <span key={interest} className={`text-xs px-3 py-1.5 rounded-full ${info.color}`}>
                            {info.label}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-sm text-[#6B5E5A]">No interests selected</span>
                    )}
                  </div>
                </div>

                {/* Aadhar & Passport Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhar Box */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#6B1E5B]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2A1636]">Aadhar Number</p>
                        <p className="text-lg font-mono font-bold text-[#2A1636] tracking-wider">
                          {user.aadharNumber || "—"}
                        </p>
                      </div>
                    </div>
                    {user.aadharNumber ? (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                        ✅ Aadhar provided
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        ⚠️ No Aadhar number provided
                      </div>
                    )}
                  </div>

                  {/* Passport Box */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D9772B]/10 flex items-center justify-center">
                        <FaPassport className="w-5 h-5 text-[#D9772B]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2A1636]">Passport Number</p>
                        <p className="text-lg font-mono font-bold text-[#2A1636] tracking-wider">
                          {user.passportNumber || "—"}
                        </p>
                      </div>
                    </div>
                    {user.passportNumber ? (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                        ✅ Passport provided
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        ⚠️ No passport number provided
                      </div>
                    )}
                  </div>
                </div>

                {/* 📄 Documents Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6B1E5B]" />
                    Uploaded Documents
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-[#D4C8C0]/30">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2A1636] truncate">Profile Photo</p>
                        {user.photoURL ? (
                          <button 
                            onClick={() => window.open(user.photoURL, '_blank')}
                            className="text-xs text-[#6B1E5B] hover:underline"
                          >
                            View
                          </button>
                        ) : (
                          <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Aadhar Front */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                      hasAadharFront 
                        ? 'bg-white/50 border-[#D4C8C0]/30' 
                        : 'bg-gray-50/50 border-[#D4C8C0]/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        hasAadharFront ? 'bg-[#6B1E5B]/10' : 'bg-gray-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${hasAadharFront ? 'text-[#6B1E5B]' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2A1636] truncate">Aadhar Front</p>
                        {hasAadharFront ? (
                          <DocumentViewer url={user.documents?.aadharFront} label="Aadhar Front" />
                        ) : (
                          <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Aadhar Back */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                      hasAadharBack 
                        ? 'bg-white/50 border-[#D4C8C0]/30' 
                        : 'bg-gray-50/50 border-[#D4C8C0]/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        hasAadharBack ? 'bg-[#6B1E5B]/10' : 'bg-gray-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${hasAadharBack ? 'text-[#6B1E5B]' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2A1636] truncate">Aadhar Back</p>
                        {hasAadharBack ? (
                          <DocumentViewer url={user.documents?.aadharBack} label="Aadhar Back" />
                        ) : (
                          <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Passport File */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                      hasPassportFile 
                        ? 'bg-white/50 border-[#D4C8C0]/30' 
                        : 'bg-gray-50/50 border-[#D4C8C0]/20'
                    }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        hasPassportFile ? 'bg-[#D9772B]/10' : 'bg-gray-100'
                      }`}>
                        <FaPassport className={`w-5 h-5 ${hasPassportFile ? 'text-[#D9772B]' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2A1636] truncate">Passport File</p>
                        {hasPassportFile ? (
                          <DocumentViewer url={user.documents?.passportFile} label="Passport Document" />
                        ) : (
                          <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification & Community Section */}
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
                      {/* Community Assignment */}
                      <div className="mb-4">
                        <label className="text-xs font-medium text-[#2A1636] block mb-2">
                          Community Assignment
                        </label>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              checked={communityAction === "auto"}
                              onChange={() => {
                                setCommunityAction("auto");
                                setSearchTerm("");
                                setSelectedCommunityName("");
                                setSelectedCommunityId("");
                              }}
                              className="accent-[#6B1E5B]"
                            />
                            Auto
                          </label>
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              checked={communityAction === "existing"}
                              onChange={() => {
                                setCommunityAction("existing");
                                setIsSearchOpen(true);
                              }}
                              className="accent-[#6B1E5B]"
                            />
                            Assign Existing
                          </label>
                          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="radio"
                              checked={communityAction === "create"}
                              onChange={() => {
                                setCommunityAction("create");
                                setSearchTerm("");
                                setSelectedCommunityName("");
                                setSelectedCommunityId("");
                              }}
                              className="accent-[#6B1E5B]"
                            />
                            Create New
                          </label>
                        </div>

                        {communityAction === "existing" && (
                          <div className="relative">
                            <div 
                              className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm cursor-pointer flex items-center justify-between"
                              onClick={() => setIsSearchOpen(!isSearchOpen)}
                            >
                              <span className={selectedCommunityName ? "text-[#2A1636]" : "text-[#6B5E5A]/50"}>
                                {selectedCommunityName || "Search and select a community..."}
                              </span>
                              {isSearchOpen ? (
                                <ChevronUp className="w-4 h-4 text-[#6B5E5A]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#6B5E5A]" />
                              )}
                            </div>
                            
                            {isSearchOpen && (
                              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-[#D4C8C0]/30 shadow-lg overflow-hidden">
                                <div className="p-2">
                                  <input
                                    type="text"
                                    placeholder="Type to search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[#D4C8C0]/30 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                                    autoFocus
                                  />
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {loadingCommunities ? (
                                    <div className="flex items-center justify-center p-4">
                                      <Loader2 className="w-5 h-5 text-[#6B1E5B] animate-spin" />
                                    </div>
                                  ) : filteredCommunities.length === 0 ? (
                                    <p className="text-sm text-[#6B5E5A] p-3 text-center">
                                      {searchTerm ? "No communities found" : "No communities available"}
                                    </p>
                                  ) : (
                                    filteredCommunities.map((c) => (
                                      <button
                                        key={c.id}
                                        onClick={() => handleCommunitySelect(c)}
                                        className={`w-full text-left px-3 py-2.5 hover:bg-[#6B1E5B]/5 transition-colors ${
                                          selectedCommunityId === c.id ? 'bg-[#6B1E5B]/10' : ''
                                        }`}
                                      >
                                        <div className="text-sm font-medium text-[#2A1636]">{c.name}</div>
                                        <div className="text-xs text-[#6B5E5A]">
                                          {c.city}, {c.state} • {c.memberCount} members
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {communityAction === "create" && (
                          <p className="text-sm text-[#D9772B] bg-[#D9772B]/5 p-3 rounded-xl border border-[#D9772B]/20">
                            New community will be created: <strong>{user.requestedCommunityName || user.currentCity || "New Community"}</strong>
                          </p>
                        )}

                        {communityAction === "auto" && (
                          <p className="text-sm text-[#6B5E5A] bg-[#6B5E5A]/5 p-3 rounded-xl border border-[#D4C8C0]/30">
                            {user.requestedCommunityName ? (
                              <>Will auto-create: <strong className="text-[#D9772B]">{user.requestedCommunityName}</strong></>
                            ) : user.nearbyCommunityName ? (
                              <>Will add to: <strong className="text-green-600">{user.nearbyCommunityName}</strong></>
                            ) : (
                              "No community selected. Will create from city name."
                            )}
                          </p>
                        )}
                      </div>

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
          <AnimatePresence>
            {showRejectForm && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-[60]"
                  onClick={() => {
                    if (!isVerifying) {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                >
                  <div
                    className="w-full max-w-md rounded-2xl bg-[#FFF9F2] border border-white/60 shadow-2xl pointer-events-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7D7E8]">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#2A1636]">Reject Member</h3>
                          <p className="text-xs text-[#6B5E5A] truncate max-w-[220px]">
                            {user.displayName || "Unknown User"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isVerifying) {
                            setShowRejectForm(false);
                            setRejectReason("");
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-[#6B1E5B]/5 transition-colors cursor-pointer"
                        disabled={isVerifying}
                      >
                        <X className="w-4 h-4 text-[#6B5E5A]" />
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-[#2A1636] block mb-1.5">
                          Reason for rejection
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          autoFocus
                          className="w-full px-3 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none text-sm resize-none h-28"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isVerifying) {
                              setShowRejectForm(false);
                              setRejectReason("");
                            }
                          }}
                          disabled={isVerifying}
                          className="flex-1 py-2.5 rounded-xl border border-[#D4C8C0]/60 text-[#6B5E5A] font-medium hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={isVerifying}
                          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}