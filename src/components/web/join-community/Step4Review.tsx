"use client";

import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { CheckCircle, User, MapPin, Heart, Edit2, FileCheck, Loader2, Shield, AlertCircle, FileText, Image } from "lucide-react";

interface Step4ReviewProps {
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
    <div className="p-3 md:p-4 rounded-2xl bg-white/50 border border-[#D4C8C0]/20 hover:border-[#6B1E5B]/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-[#6B1E5B]/10 flex items-center justify-center">{icon}</div>
          <h3 className="text-xs md:text-sm font-semibold text-[#2A1636]">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-[#6B1E5B] hover:text-[#531547] font-medium transition-colors cursor-pointer">
            <Edit2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> Edit
          </button>
        )}
      </div>
      <div className="space-y-1 text-xs md:text-sm text-[#2A1636]/80">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string | React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-0.5 md:py-1 border-b border-[#D4C8C0]/10 last:border-0">
      <span className="text-[10px] md:text-sm text-[#6B5E5A]">{label}</span>
      <span className="font-medium text-[10px] md:text-sm text-[#2A1636] text-right">{value}</span>
    </div>
  );
}

function DocumentStatus({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <ReviewItem 
      label={label} 
      value={
        uploaded 
          ? <span className="text-green-600 flex items-center gap-1">✅ Uploaded</span>
          : <span className="text-[#6B5E5A]/60 flex items-center gap-1">⏳ Not uploaded</span>
      } 
    />
  );
}

export default function Step4Review({ onSubmit, onBack, onGoToStep, isSubmitting = false }: Step4ReviewProps) {
  const { watch } = useFormContext();
  const formData = watch();

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = formData.dob ? calculateAge(formData.dob) : null;

  const familyMembers = formData.familyMembers || [];
  const familyDisplay = familyMembers.length > 0
    ? familyMembers
        .filter((m: any) => m.name)
        .map((m: any) => {
          const age = m.dob ? calculateAge(m.dob) : '—';
          return `${m.name} (${m.relation}, ${age}yrs)`;
        })
        .join(', ')
    : 'None added';

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

  const isOdishaPinValid = formData.odishaPinCode && formData.odishaPinCode.length === 6;
  const isCurrentPinValid = formData.currentPinCode && formData.currentPinCode.length === 6;
  const isAadharValid = formData.aadharNumber && formData.aadharNumber.length === 12;
  const isPassportValid = formData.passportNumber && formData.passportNumber.length >= 6;
  
  // ✅ Determine ID Type from form data
  const idType = formData.idType || (formData.aadharNumber ? "aadhar" : formData.passportNumber ? "passport" : null);

  // ✅ Check document uploads
  const hasAadharFront = !!(formData.aadharFront instanceof File || formData.aadharFront);
  const hasAadharBack = !!(formData.aadharBack instanceof File || formData.aadharBack);
  const hasPassportFile = !!(formData.passportFile instanceof File || formData.passportFile);

  const sections = [
    {
      title: "👤 Personal & Family",
      icon: <User className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 1,
      content: (
        <>
          <ReviewItem label="Full Name" value={formData.fullName || "—"} />
          <ReviewItem label="Date of Birth" value={formData.dob ? new Date(formData.dob).toLocaleDateString() : "—"} />
          <ReviewItem label="Age" value={userAge !== null ? `${userAge} years` : "—"} />
          <ReviewItem label="Gender" value={formData.gender || "—"} />
          <ReviewItem label="Blood Group" value={formData.bloodGroup || "—"} />
          <ReviewItem label="Mobile" value={formData.mobileCountryCode && formData.mobileNumber ? `${formData.mobileCountryCode} ${formData.mobileNumber}` : "—"} />
          <ReviewItem label="Occupation" value={formData.occupation || "—"} />
          {formData.photo && <ReviewItem label="Photo" value="✅ Uploaded" />}
          <ReviewItem label="Family Members" value={familyDisplay} />
        </>
      )
    },
    {
      title: "📍 Address",
      icon: <MapPin className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 2,
      content: (
        <>
          <div className="font-semibold text-[#6B1E5B] text-[10px] md:text-xs mt-1">Odisha Address</div>
          <ReviewItem label="Home Address" value={formData.odishaHomeAddress || "—"} />
          <ReviewItem label="District" value={formData.odishaDistrict || "—"} />
          <ReviewItem label="City" value={formData.odishaCity || "—"} />
          <ReviewItem label="PIN Code" value={isOdishaPinValid ? formData.odishaPinCode : <span className="text-red-500 font-medium">⚠️ Incomplete</span>} />
          
          <div className="font-semibold text-[#D9772B] text-[10px] md:text-xs mt-2">Current Address</div>
          <ReviewItem label="Address" value={formData.currentAddress || "—"} />
          <ReviewItem label="Country" value={formData.currentCountry || "—"} />
          <ReviewItem label="State" value={formData.currentState || "—"} />
          <ReviewItem label="City" value={formData.currentCity || "—"} />
          <ReviewItem label="PIN Code" value={isCurrentPinValid ? formData.currentPinCode : <span className="text-red-500 font-medium">⚠️ Incomplete</span>} />

          <div className="font-semibold text-[#6B1E5B] text-[10px] md:text-xs mt-2">Nearby Community</div>
          <ReviewItem
            label="Community"
            value={
              formData.nearbyCommunityId === "__cant_find__"
                ? "Can't find nearby community"
                : (formData.nearbyCommunityName || "—")
            }
          />
          {formData.nearbyCommunityId === "__cant_find__" && (
            <ReviewItem label="Suggested Name" value={formData.requestedCommunityName || "—"} />
          )}
        </>
      )
    },
    {
      title: "💖 Interests & Identity",
      icon: <Heart className="w-3.5 h-3.5 text-[#6B1E5B]" />,
      step: 3,
      content: (
        <>
          <ReviewItem label="Interests" value={interestsDisplay} />
          
          {/* ✅ ID Type */}
          <ReviewItem 
            label="ID Type" 
            value={idType === "aadhar" ? "Aadhar" : idType === "passport" ? "Passport" : "Not selected"} 
          />
          
          {/* ✅ ID Number */}
          {idType === "aadhar" ? (
            <ReviewItem 
              label="Aadhar Number" 
              value={
                isAadharValid 
                  ? `✅ ${formData.aadharNumber}` 
                  : <span className="text-red-500 font-medium">⚠️ Invalid</span>
              } 
            />
          ) : idType === "passport" ? (
            <ReviewItem 
              label="Passport Number" 
              value={
                isPassportValid 
                  ? `✅ ${formData.passportNumber}` 
                  : <span className="text-red-500 font-medium">⚠️ Invalid</span>
              } 
            />
          ) : null}

          {/* ✅ Document Upload Status */}
          {idType === "aadhar" ? (
            <>
              <DocumentStatus label="Aadhar Front" uploaded={hasAadharFront} />
              <DocumentStatus label="Aadhar Back" uploaded={hasAadharBack} />
            </>
          ) : idType === "passport" ? (
            <DocumentStatus label="Passport Document" uploaded={hasPassportFile} />
          ) : null}

          {(isAadharValid || isPassportValid) && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-amber-600">
              <Shield className="w-3 h-3" /> Will be verified by admin
            </div>
          )}
        </>
      )
    }
  ];

  // ✅ Updated validation with document uploads (optional)
  const isValid = formData.photo instanceof File && 
    formData.fullName && 
    formData.dob && 
    formData.gender && 
    formData.bloodGroup && 
    formData.mobileNumber && 
    formData.mobileCountryCode &&
    formData.occupation &&
    formData.odishaHomeAddress && 
    formData.odishaDistrict &&
    formData.odishaCity && 
    isOdishaPinValid &&
    formData.currentAddress && 
    formData.currentCountry && 
    formData.currentState && 
    formData.currentCity && 
    isCurrentPinValid &&
    formData.nearbyCommunityId &&
    (formData.nearbyCommunityId !== "__cant_find__" || (formData.requestedCommunityName || "").trim().length >= 2) &&
    (formData.interests || []).length >= 2 &&
    (formData.aadharNumber || formData.passportNumber) &&
    (formData.aadharNumber ? isAadharValid : isPassportValid);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 md:space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">✅ Review & Submit</h2>
          <p className="text-xs md:text-sm text-[#6B5E5A]">Please verify all your details before submitting</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2 md:space-y-3 max-h-[350px] md:max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
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

      {/* Submit Button */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#D4C8C0]/20">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-2xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base ${
            !isValid && !isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B]'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4 md:w-5 md:h-5" />
              Submit for Verification
            </>
          )}
        </button>

        {!isValid && (
          <p className="text-center text-xs md:text-sm text-amber-600">
            ⚠️ Please complete all required fields before submitting
          </p>
        )}

        <div className="flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer text-xs md:text-sm"
          >
            ← Back
          </button>
          <div className="text-[10px] md:text-xs text-[#6B5E5A]">
            Admin will verify within 24-48 hours
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
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