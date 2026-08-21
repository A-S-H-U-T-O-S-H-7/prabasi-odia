"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import JoinCommunityLayout from "@/components/web/join-community/JoinCommunityLayout";
import Step1Personal from "@/components/web/join-community/Step1Personal";
import Step2Address,{ CANT_FIND_COMMUNITY} from "@/components/web/join-community/Step2Address";
import Step3Interests from "@/components/web/join-community/Step3Interests";
import Step4Review from "@/components/web/join-community/Step4Review";
import SuccessPage from "@/components/web/join-community/SuccessPage";
import { userService, type UserProfileData } from "@/lib/services/userService";
import { publicCommunityService } from "@/lib/services/publicCommunityService";
import { geocodeLocation } from "@/lib/utils/locationGeocode";
import { isIndianCountryCode, normalizeIndianPhone } from "@/lib/mobileVerification";

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

// Define the schema
const schema = z.object({
  // Personal Info
  photo: z.any().refine((file) => file instanceof File, "Profile photo is required"),
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      if (!val) return false;
      const age = calculateAge(val);
      return age >= 18;
    }, "You must be at least 18 years old"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  mobileCountryCode: z.string().min(1, "Country code is required"),
  mobileNumber: z.string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9+\-\s()]+$/, "Invalid mobile number format")
    .refine((val) => {
      const cleanNumber = val.replace(/[\s\-()]/g, '');
      return cleanNumber.length >= 4 && cleanNumber.length <= 15;
    }, "Mobile number must be 4-15 digits"),
  occupation: z.string().min(2, "Occupation is required"),
  email: z.string().optional(),
  mobileVerified: z.boolean().optional(),
  verifiedMobileNumber: z.string().optional(),
  emailVerified: z.boolean().optional(),
  verifiedEmail: z.string().optional(),

  // Address Info
  odishaHomeAddress: z.string().min(5, "Odisha home address is required"),
  odishaDistrict: z.string().min(1, "District is required"),
  odishaCity: z.string().min(2, "City is required"),
  odishaPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),

  currentAddress: z.string().min(5, "Current address is required"),
  currentCountry: z.string().min(2, "Country is required"),
  currentState: z.string()
    .min(2, "State is required")
    .refine(
      (val) => !/^(odisha|orissa)$/i.test(val.trim()),
      "Odisha cannot be selected as current address state"
    ),
  currentCity: z.string().min(2, "Current city is required"),
  currentLatitude: z.number().optional(),
  currentLongitude: z.number().optional(),
  currentPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),

  nearbyCommunityId: z.string().optional(),
  nearbyCommunityName: z.string().optional(),
  requestedCommunityName: z.string().optional(),

  // Interests
  interests: z.array(z.string()).min(2, "Please select at least 2 interests"),
  
  // ID fields - using zod enum with proper type
  idType: z.enum(["aadhar", "passport"]).default("aadhar"),
  aadharNumber: z.string()
    .optional()
    .refine((val) => !val || (val.length === 12 && /^[0-9]+$/.test(val)), 
      "Aadhar must be 12 digits"),
  passportNumber: z.string()
    .optional()
    .refine((val) => !val || (val.length >= 6 && val.length <= 9 && /^[A-Z0-9]+$/.test(val)), 
      "Passport number must be 6-9 characters"),
  
  // ✅ Document uploads - optional
  aadharFront: z.any().optional(),
  aadharBack: z.any().optional(),
  passportFile: z.any().optional(),

  familyMembers: z.array(z.any()).optional(),
}).superRefine((data, ctx) => {
  // Validate Indian mobile numbers more strictly for SMS OTP
  if (isIndianCountryCode(data.mobileCountryCode)) {
    const phone = `${data.mobileCountryCode || ""}${data.mobileNumber || ""}`;
    if (!normalizeIndianPhone(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid 10-digit Indian mobile number",
        path: ["mobileNumber"],
      });
    }
  }
  if (data.idType === "aadhar") {
    if (!data.aadharNumber || data.aadharNumber.length !== 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid 12-digit Aadhar number is required",
        path: ["aadharNumber"],
      });
    }
  } else if (data.idType === "passport") {
    if (!data.passportNumber || data.passportNumber.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid passport number is required (6-9 characters)",
        path: ["passportNumber"],
      });
    }
  }

  // Validate community request
  if (data.nearbyCommunityId === CANT_FIND_COMMUNITY) {
    if (!data.requestedCommunityName || data.requestedCommunityName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your community name",
        path: ["requestedCommunityName"],
      });
    }
  }
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { title: "Personal & Family", subtitle: "Tell us about yourself and your family" },
  { title: "Your Roots", subtitle: "Where do you call home?" },
  { title: "Interests & Identity", subtitle: "What drives you? Share your ID" },
  { title: "Review & Submit", subtitle: "Almost there!" },
];

export default function JoinCommunityPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      mobileCountryCode: "+91",
      mobileNumber: "",
      occupation: "",
      email: "",
      mobileVerified: false,
      verifiedMobileNumber: "",
      emailVerified: false,
      verifiedEmail: "",
      odishaHomeAddress: "",
      odishaDistrict: "",
      odishaCity: "",
      odishaPinCode: "",
      currentAddress: "",
      currentCountry: "",
      currentState: "",
      currentCity: "",
      currentLatitude: undefined,
      currentLongitude: undefined,
      currentPinCode: "",
      nearbyCommunityId: "",
      nearbyCommunityName: "",
      requestedCommunityName: "",
      interests: [],
      idType: "aadhar" as "aadhar" | "passport",
      aadharNumber: "",
      passportNumber: "",
      aadharFront: undefined,
      aadharBack: undefined,
      passportFile: undefined,
      familyMembers: [{ name: "", dob: "", relation: "" }],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/join-community');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.email) {
      methods.setValue("email", user.email);
    }
  }, [user, methods]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B1E5B] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleGoToStep = (step: number) => setCurrentStep(step);

  const handleSubmit = async () => {
    const isValid = await methods.trigger();
    if (!isValid) {
      toast.error("Please correct the highlighted required fields");
      return;
    }

    const data = methods.getValues();
    if (isIndianCountryCode(data.mobileCountryCode) && !data.mobileVerified) {
      toast.error("Please verify your mobile number first");
      setCurrentStep(1);
      return;
    }
    if (!isIndianCountryCode(data.mobileCountryCode) && !data.emailVerified) {
      toast.error("Please verify the OTP sent to your email first");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {

      const age = calculateAge(data.dob);
      const isCommunityRequest = (data.nearbyCommunityId || "") === CANT_FIND_COMMUNITY;
      const selectedCommunityId = isCommunityRequest ? null : (data.nearbyCommunityId || null);
      const selectedCommunityName = isCommunityRequest ? null : (data.nearbyCommunityName || null);
      const requestedCommunityName = isCommunityRequest ? (data.requestedCommunityName || "").trim() : null;
      const communityRequestStatus: UserProfileData["communityRequestStatus"] = isCommunityRequest ? "pending" : "joined";

      let currentLatitude = data.currentLatitude ?? null;
      let currentLongitude = data.currentLongitude ?? null;

      if (!currentLatitude || !currentLongitude || currentLatitude === 0 || currentLongitude === 0) {
        const geocoded = await geocodeLocation({
          city: data.currentCity,
          state: data.currentState,
          country: data.currentCountry,
        });

        if (geocoded) {
          currentLatitude = geocoded.lat;
          currentLongitude = geocoded.lng;
        } else {
          toast.error("Could not fetch coordinates. Admin may need to add them manually.");
        }
      }

      const profileData = {
        uid: user.uid,
        displayName: data.fullName,
        email: user.email || '',
        phoneNumber: data.mobileNumber,
        mobileCountryCode: data.mobileCountryCode,
        age,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        occupation: data.occupation,
        odishaHomeAddress: data.odishaHomeAddress,
        odishaDistrict: data.odishaDistrict,
        odishaCity: data.odishaCity,
        odishaPinCode: data.odishaPinCode,
        currentAddress: data.currentAddress,
        currentCountry: data.currentCountry,
        currentState: data.currentState,
        currentCity: data.currentCity,
        currentLatitude,
        currentLongitude,
        currentPinCode: data.currentPinCode,
        nearbyCommunityId: selectedCommunityId,
        nearbyCommunityName: isCommunityRequest ? null : selectedCommunityName,
        requestedCommunityName: isCommunityRequest ? requestedCommunityName : null,
        communityRequestStatus,
        interests: data.interests,
        idType: data.idType,
        aadharNumber: data.idType === "aadhar" ? data.aadharNumber : null,
        passportNumber: data.idType === "passport" ? data.passportNumber : null,
        familyMembers: data.familyMembers || [],
        hasJoinedCommunity: true,
        isVerified: false,
      };

      await userService.createUserProfile(user.uid, profileData);

      // ✅ Upload profile photo
      if (data.photo instanceof File) {
        await userService.uploadDocument(user.uid, data.photo, 'profilePhoto');
      }

      // ✅ Upload Aadhar documents (if provided)
      if (data.idType === "aadhar") {
        if (data.aadharFront instanceof File) {
          await userService.uploadDocument(user.uid, data.aadharFront, 'aadharFront');
        }
        if (data.aadharBack instanceof File) {
          await userService.uploadDocument(user.uid, data.aadharBack, 'aadharBack');
        }
      } else if (data.idType === "passport") {
        if (data.passportFile instanceof File) {
          await userService.uploadDocument(user.uid, data.passportFile, 'passportFile');
        }
      }

      if (selectedCommunityId) {
        const joinResult = await publicCommunityService.joinCommunity(selectedCommunityId, user.uid);
        if (!joinResult.success && joinResult.error !== 'Already a member') {
          console.error('Failed to join community:', joinResult.error);
          toast.error(joinResult.error || 'Community join failed. Admin can add you later.');
        }
      }

      setIsSuccess(true);
      toast.success(
        isCommunityRequest
          ? 'Profile submitted! Your community request will be reviewed by admin.'
          : 'Profile submitted successfully! Our team will verify your details.'
      );
    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoProfile = () => {
    router.push('/profile');
  };

  const renderStep = () => {
    if (isSuccess) {
      return <SuccessPage onGoHome={handleGoHome} onGoProfile={handleGoProfile} />;
    }

    switch (currentStep) {
      case 1:
        return <Step1Personal onNext={handleNext} isFirstStep />;
      case 2:
        return <Step2Address onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3Interests onNext={handleNext} onBack={handleBack} />;
      case 4:
        return (
          <Step4Review
            onSubmit={handleSubmit}
            onBack={handleBack}
            onGoToStep={handleGoToStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <JoinCommunityLayout
        currentStep={currentStep}
        totalSteps={STEPS.length}
        title={STEPS[currentStep - 1]?.title || 'Join Community'}
        subtitle={STEPS[currentStep - 1]?.subtitle || ''}
      >
        {renderStep()}
      </JoinCommunityLayout>
    </FormProvider>
  );
}