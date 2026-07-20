"use client";

import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { CheckCircle, User, MapPin, Heart, Shield, Edit2, FileCheck, Loader2 } from "lucide-react";

interface Step5ReviewProps {
  onSubmit: () => void;
  onBack: () => void;
  onGoToStep: (step: number) => void;
  isSubmitting?: boolean;
}

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
}

function ReviewSection({ title, icon, children, onEdit }: ReviewSectionProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/50 border border-[#D4C8C0]/20 hover:border-[#6B1E5B]/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#6B1E5B]/10 flex items-center justify-center">{icon}</div>
          <h3 className="text-sm font-semibold text-[#2A1636]">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-1 text-xs text-[#6B1E5B] hover:text-[#531547] font-medium transition-colors cursor-pointer">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        )}
      </div>
      <div className="space-y-1.5 text-sm text-[#2A1636]/80">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string | React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1 border-b border-[#D4C8C0]/10 last:border-0">
      <span className="text-[#6B5E5A]">{label}</span>
      <span className="font-medium text-[#2A1636] text-right">{value}</span>
    </div>
  );
}

export default function Step5Review({ onSubmit, onBack, onGoToStep, isSubmitting = false }: Step5ReviewProps) {
  const { watch } = useFormContext();
  const formData = watch();

  // Debug: Log the pin code values
  console.log("🔍 Review Data:", {
    odishaPinCode: formData.odishaPinCode,
    currentPinCode: formData.currentPinCode,
    fullData: formData
  });

  const familyMembers = formData.familyMembers || [];
  const familyDisplay = familyMembers.length > 0
    ? familyMembers.map((m: any) => `${m.name} (${m.relation}, ${m.age}yrs)${m.occupation ? `, ${m.occupation}` : ''}`).join(', ')
    : 'Not added';

  const interestsMap: Record<string, string> = {
    volunteering: '🤝 Volunteering',
    bloodDonation: '🩸 Blood Donation',
    jobHelp: '💼 Job Help / Referrals',
    socialAwareness: '🌟 Social Awareness',
    cleanlinessDrives: '🧹 Cleanliness Drives',
    culturalEvents: '🎭 Cultural Events',
    mentorship: '📚 Mentorship',
    startupNetworking: '🚀 Startup Networking',
  };

  const interestsDisplay = (formData.interests || []).map((i: string) => interestsMap[i] || i).join(', ') || 'None selected';

  const hasAadharFront = formData.aadharFront instanceof File || formData.aadharFront;
  const hasAadharBack = formData.aadharBack instanceof File || formData.aadharBack;
  const hasVoterId = formData.voterId instanceof File || formData.voterId;

  // Check pin codes
  const isOdishaPinValid = formData.odishaPinCode && formData.odishaPinCode.length === 6;
  const isCurrentPinValid = formData.currentPinCode && formData.currentPinCode.length === 6;

  const sections = [
    {
      title: "👤 Personal Details",
      icon: <User className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 1,
      content: (
        <>
          <ReviewItem label="Full Name" value={formData.fullName || "—"} />
          <ReviewItem label="Age" value={formData.age || "—"} />
          <ReviewItem label="Gender" value={formData.gender || "—"} />
          <ReviewItem label="Blood Group" value={formData.bloodGroup || "—"} />
          <ReviewItem label="Family Members" value={familyDisplay} />
          {formData.photo && <ReviewItem label="Photo" value="✅ Uploaded" />}
        </>
      )
    },
    {
      title: "📍 Your Roots",
      icon: <MapPin className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 2,
      content: (
        <>
          <ReviewItem label="Odisha Home Address" value={formData.odishaHomeAddress || "—"} />
          <ReviewItem label="District" value={formData.odishaDistrict || "—"} />
          <ReviewItem label="City" value={formData.odishaCity || "—"} />
          <ReviewItem 
            label="PIN Code" 
            value={
              isOdishaPinValid 
                ? formData.odishaPinCode 
                : <span className="text-red-500 font-medium">⚠️ Incomplete</span>
            } 
          />
          <div className="border-t border-[#D4C8C0]/10 my-2" />
          <ReviewItem label="Current Address" value={formData.currentAddress || "—"} />
          <ReviewItem label="State" value={formData.currentState || "—"} />
          <ReviewItem label="City" value={formData.currentCity || "—"} />
          <ReviewItem 
            label="PIN Code" 
            value={
              isCurrentPinValid 
                ? formData.currentPinCode 
                : <span className="text-red-500 font-medium">⚠️ Incomplete</span>
            } 
          />
        </>
      )
    },
    {
      title: "💖 Your Passions",
      icon: <Heart className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 3,
      content: (
        <>
          <ReviewItem label="Interests" value={interestsDisplay} />
          <ReviewItem label="Occupation" value={formData.occupation || 'Not specified'} />
          <ReviewItem label="Organization" value={formData.organization || 'Not specified'} />
        </>
      )
    },
    {
      title: "🛡️ Documents",
      icon: <Shield className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 4,
      content: (
        <>
          <ReviewItem label="Aadhar Front" value={hasAadharFront ? '✅ Uploaded' : '❌ Missing'} />
          <ReviewItem label="Aadhar Back" value={hasAadharBack ? '✅ Uploaded' : '❌ Missing'} />
          <ReviewItem label="Voter ID" value={hasVoterId ? '✅ Uploaded' : '❌ Missing'} />
          <ReviewItem label="Consent" value={formData.consent ? '✅ Agreed' : '❌ Not agreed'} />
        </>
      )
    }
  ];

  const isValid = formData.photo instanceof File && formData.fullName && formData.age && formData.gender &&
    formData.bloodGroup && formData.odishaHomeAddress && formData.odishaDistrict &&
    formData.odishaCity && isOdishaPinValid &&
    formData.currentAddress && formData.currentState && formData.currentCity && isCurrentPinValid &&
    (formData.interests || []).length >= 2 &&
    formData.occupation && formData.organization &&
    hasAadharFront && hasAadharBack && hasVoterId && formData.consent;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">✅ Review & Submit</h2>
          <p className="text-sm text-[#6B5E5A]">Please verify all your details before submitting</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {sections.map((section, index) => (
          <ReviewSection
            key={index}
            title={section.title}
            icon={section.icon}
            onEdit={() => onGoToStep(section.step)}
          >
            {section.content}
          </ReviewSection>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-[#D4C8C0]/20">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-6 py-4 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileCheck className="w-5 h-5" />
              Submit for Verification
            </>
          )}
        </button>

        {!isValid && (
          <p className="text-center text-sm text-amber-600">
            ⚠️ Please complete all required fields before submitting
          </p>
        )}

        <div className="flex justify-between">
          <button 
            onClick={onBack} 
            className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer"
          >
            ← Back
          </button>
          <div className="text-xs text-[#6B5E5A] self-center">
            Admin will verify within 24-48 hours
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4C8C0;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B1E5B;
        }
      `}</style>
    </motion.div>
  );
}
