"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, MapPin, Phone, Calendar, Heart, Shield, 
  FileText, Check, XCircle, Loader2, Eye, Briefcase, Users,
  Building2, Home, Globe, Droplet, Sparkles, CreditCard, 
  CalendarDays, Smartphone, UserCheck, Search, AlertCircle
} from "lucide-react";
import Image from "next/image";
import { UserData } from "@/lib/services/adminUserService";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { ActivityActions, ActivityEntityTypes } from "@/lib/services/activityLogService";
import { emailService } from "@/lib/services/emailService";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import { toast } from "react-hot-toast";

interface UserVerificationModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (uid: string, memberId: string) => Promise<void>;
  onReject: (uid: string, reason: string) => Promise<void>;
  isVerifying?: boolean;
}

interface AadharVerificationResult {
  age_range: string;
  aadhaar_number: string;
  state: string;
  gender: string;
  last_digits: string;
  is_mobile: boolean;
  remarks: string;
  less_info: boolean;
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

  const [isVerifyingAadhar, setIsVerifyingAadhar] = useState(false);
  const [aadharResult, setAadharResult] = useState<AadharVerificationResult | null>(null);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [aadharError, setAadharError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchMemberCount();
      loadCommunities();
      setAadharResult(null);
      setIsAadharVerified(false);
      setAadharError(null);
      setSelectedCommunityId("");
      setCommunityAction("auto");
      setSearchTerm("");
    }
  }, [isOpen, user]);

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

  const handleVerify = async () => {
    // ✅ Validation: Check Aadhar verification
    if (!isAadharVerified) {
      toast.error("Please verify Aadhar number first");
      return;
    }

    // ✅ Validation: Check community selection
    if (communityAction === "existing" && !selectedCommunityId) {
      toast.error("Please select a community");
      return;
    }

    // ✅ Validation: Check Member ID
    if (!memberId || memberId.trim().length === 0) {
      toast.error("Please generate or enter a Member ID");
      return;
    }

    const finalMemberId = memberId || generateMemberId(user!, memberCount);
    
    // Determine which community to use
    let communityId = user!.nearbyCommunityId || undefined;
    let communityName = user!.nearbyCommunityName || undefined;
    
    if (communityAction === "existing" && selectedCommunityId) {
      const selected = communities.find(c => c.id === selectedCommunityId);
      communityId = selectedCommunityId;
      communityName = selected?.name;
    } else if (communityAction === "create") {
      communityId = undefined;
      communityName = undefined;
    }
    
    await log({
      action: ActivityActions.VERIFY,
      entityType: ActivityEntityTypes.USER,
      entityId: user!.uid,
      entityTitle: user!.displayName,
      details: `Verified user ${user!.displayName} with member ID ${finalMemberId}`,
    });
    
    await onVerify(user!.uid, finalMemberId);
    
    try {
      await emailService.sendVerificationEmail({
        name: user!.displayName || 'Member',
        email: user!.email || '',
        memberId: finalMemberId,
        memberSince: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        communityName: communityName || user!.currentCity || 'Prabasi Odia Community',
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

  const verifyAadhar = async () => {
    if (!user?.aadharNumber) {
      toast.error("No Aadhar number found for this user");
      return;
    }

    setIsVerifyingAadhar(true);
    setAadharError(null);
    try {
      const response = await fetch('/api/aadhar/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aadharno: user.aadharNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setAadharResult(data.data);
        setIsAadharVerified(true);
        toast.success("Aadhar verified successfully ✅");
      } else {
        // ✅ Show error message in UI
        setAadharError(data.message || "Verification Failed.");
        toast.error(data.message || "Aadhar verification failed");
      }
    } catch (error) {
      console.error("Aadhar verification error:", error);
      setAadharError("Network error. Please try again.");
      toast.error("Failed to verify Aadhar");
    } finally {
      setIsVerifyingAadhar(false);
    }
  };

  if (!user) return null;

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

  // ✅ Fix: Search by community name, city, OR state
  const filteredCommunities = communities.filter((c) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search) ||
      c.city.toLowerCase().includes(search) ||
      c.state.toLowerCase().includes(search)
    );
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

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
                  {/* ✅ Image with proper container */}
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

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 3 Column Grid - Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                        <span className="font-medium text-[#2A1636]">{user.phoneNumber || user.mobileNumber || "—"}</span>
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

                {/* Aadhar Box - Full Width */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                    <div className="flex items-center gap-3">
                      {isAadharVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                          ✅ Verified
                        </span>
                      )}
                      {aadharError && (
                        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
                          ❌ Failed
                        </span>
                      )}
                      <button
                        onClick={verifyAadhar}
                        disabled={isVerifyingAadhar || !user.aadharNumber}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          isAadharVerified
                            ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                            : 'bg-[#6B1E5B] text-white hover:bg-[#531547] shadow-sm hover:shadow-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isVerifyingAadhar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAadharVerified ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        {isVerifyingAadhar ? "Verifying..." : isAadharVerified ? "Verified" : "Verify Aadhar"}
                      </button>
                    </div>
                  </div>

                  {/* ✅ Aadhar Error Display */}
                  {aadharError && (
                    <div className="mt-3 p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700">{aadharError}</p>
                    </div>
                  )}

                  {/* Aadhar Result */}
                  {aadharResult && (
                    <div className="mt-4 p-4 bg-green-50/70 border border-green-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-[#6B5E5A] uppercase">Age Range</p>
                        <p className="text-sm font-semibold text-[#2A1636]">{aadharResult.age_range}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B5E5A] uppercase">State</p>
                        <p className="text-sm font-semibold text-[#2A1636]">{aadharResult.state}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B5E5A] uppercase">Gender</p>
                        <p className="text-sm font-semibold text-[#2A1636]">{aadharResult.gender}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#6B5E5A] uppercase">Mobile Linked</p>
                        <p className="text-sm font-semibold text-[#2A1636]">{aadharResult.is_mobile ? "✅ Yes" : "❌ No"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification & Community Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#6B1E5B]" />
                    Verification & Community
                  </h4>

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
                          onChange={() => setCommunityAction("auto")}
                          className="accent-[#6B1E5B]"
                        />
                        Auto
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={communityAction === "existing"}
                          onChange={() => setCommunityAction("existing")}
                          className="accent-[#6B1E5B]"
                        />
                        Assign Existing
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="radio"
                          checked={communityAction === "create"}
                          onChange={() => setCommunityAction("create")}
                          className="accent-[#6B1E5B]"
                        />
                        Create New
                      </label>
                    </div>

                    {communityAction === "existing" && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                        <input
                          type="text"
                          placeholder="Search by community, city, or state..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                        />
                        <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-[#D4C8C0]/30 bg-white/80 p-1">
                          {loadingCommunities ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="w-5 h-5 text-[#6B1E5B] animate-spin" />
                            </div>
                          ) : filteredCommunities.length === 0 ? (
                            <p className="text-sm text-[#6B5E5A] p-3 text-center">
                              {searchTerm ? "No communities found matching your search" : "No communities available"}
                            </p>
                          ) : (
                            filteredCommunities.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => setSelectedCommunityId(c.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  selectedCommunityId === c.id
                                    ? 'bg-[#6B1E5B]/10 text-[#6B1E5B] font-medium'
                                    : 'hover:bg-[#6B1E5B]/5 text-[#2A1636]'
                                }`}
                              >
                                <div className="font-medium">{c.name}</div>
                                <div className="text-xs text-[#6B5E5A]">
                                  {c.city}, {c.state} • {c.memberCount} members
                                </div>
                              </button>
                            ))
                          )}
                        </div>
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
                      disabled={isVerifying || isLoadingCount || !isAadharVerified || !memberId}
                      className={`flex-1 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        isVerifying || isLoadingCount || !isAadharVerified || !memberId
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
                      onClick={() => setShowRejectForm(!showRejectForm)}
                      className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Reject
                    </button>
                  </div>

                  {!isAadharVerified && !isVerifyingAadhar && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Please verify Aadhar before verification
                    </p>
                  )}

                  {!memberId && isAadharVerified && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Please generate or enter a Member ID
                    </p>
                  )}

                  {showRejectForm && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason for rejection..."
                        className="w-full px-3 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none text-sm resize-none h-20"
                      />
                      <button
                        onClick={handleReject}
                        disabled={isVerifying}
                        className="w-full py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}