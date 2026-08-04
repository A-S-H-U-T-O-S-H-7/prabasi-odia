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
import Step2Address, { CANT_FIND_COMMUNITY } from "@/components/web/join-community/Step2Address";
import Step3Interests from "@/components/web/join-community/Step3Interests";
import Step4Review from "@/components/web/join-community/Step4Review";
import SuccessPage from "@/components/web/join-community/SuccessPage";
import { userService, type UserProfileData } from "@/lib/services/userService";
import { publicCommunityService } from "@/lib/services/publicCommunityService";
import { geocodeLocation } from "@/lib/utils/locationGeocode";

const schema = z.object({
  photo: z.any().refine((file) => file instanceof File, "Profile photo is required"),
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  mobileNumber: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9][0-9]{9}$/, "Mobile number must start with 6,7,8, or 9"),
  occupation: z.string().min(2, "Occupation is required"),

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

  interests: z.array(z.string()).min(2, "Please select at least 2 interests"),
  aadharNumber: z.string()
    .min(12, "Aadhar number must be 12 digits")
    .max(12, "Aadhar number must be 12 digits")
    .regex(/^[0-9]+$/, "Aadhar number must contain only numbers"),

  familyMembers: z.array(z.any()).optional(),
}).superRefine((data, ctx) => {
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
  { title: "Interests & Aadhar", subtitle: "What drives you? Share your Aadhar" },
  { title: "Review & Submit", subtitle: "Almost there!" },
];

export default function JoinCommunityPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      mobileNumber: "",
      occupation: "",
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
      aadharNumber: "",
      familyMembers: [{ name: "", dob: "", relation: "" }],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/join-community');
    }
  }, [user, loading, router]);

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

    setIsSubmitting(true);
    try {
      const data = methods.getValues();

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

      const age = calculateAge(data.dob);
      const isCommunityRequest = (data.nearbyCommunityId || "") === CANT_FIND_COMMUNITY;
      const selectedCommunityId = isCommunityRequest ? null : (data.nearbyCommunityId || null);
      const selectedCommunityName = isCommunityRequest ? null : (data.nearbyCommunityName || null);
      const requestedCommunityName = isCommunityRequest ? (data.requestedCommunityName || "").trim() : null;
      const communityRequestStatus: UserProfileData["communityRequestStatus"] = isCommunityRequest ? "pending" : "joined";

      // Get coordinates from form or geocode
      let currentLatitude = data.currentLatitude ?? null;
      let currentLongitude = data.currentLongitude ?? null;

      // Only geocode if we don't have valid coordinates
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

      // Build profile data correctly
      const profileData = {
        uid: user.uid,
        displayName: data.fullName,
        email: user.email || '',
        phoneNumber: data.mobileNumber,
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
        aadharNumber: data.aadharNumber,
        familyMembers: data.familyMembers || [],
        hasJoinedCommunity: true,
        isVerified: false,
      };

      await userService.createUserProfile(user.uid, profileData);

      if (data.photo instanceof File) {
        await userService.uploadDocument(user.uid, data.photo, 'profilePhoto');
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