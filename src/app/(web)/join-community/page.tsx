// app/join-community/page.tsx
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
import Step2Address from "@/components/web/join-community/Step2Address";
import Step3Interests from "@/components/web/join-community/Step3Interests";
import Step4Review from "@/components/web/join-community/Step4Review";
import SuccessPage from "@/components/web/join-community/SuccessPage";
import { userService } from "@/lib/services/userService";

// ============================================
// UPDATED SCHEMA - 4 Steps Only
// ============================================
const schema = z.object({
  // Step 1: Personal & Family
  photo: z.any()
    .refine((file) => file instanceof File, "Profile photo is required"),
  fullName: z.string().min(2, "Full name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  mobileNumber: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9][0-9]{9}$/, "Mobile number must start with 6,7,8, or 9"),
  occupation: z.string().min(2, "Occupation is required"),
  
  // Step 2: Address
  odishaHomeAddress: z.string().min(5, "Odisha home address is required"),
  odishaDistrict: z.string().min(1, "District is required"),
  odishaCity: z.string().min(2, "City is required"),
  odishaPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),
  
  currentAddress: z.string().min(5, "Current address is required"),
  currentCountry: z.string().min(2, "Country is required"),
  currentState: z.string().min(2, "State is required"),
  currentCity: z.string().min(2, "Current city is required"),
  currentPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),

  // Step 3: Interests & Aadhar
  interests: z.array(z.string()).min(2, "Please select at least 2 interests"),
  aadharNumber: z.string()
    .min(12, "Aadhar number must be 12 digits")
    .max(12, "Aadhar number must be 12 digits")
    .regex(/^[0-9]+$/, "Aadhar number must contain only numbers"),

  // Family Members (optional - handled separately)
  familyMembers: z.array(z.any()).optional(),
});

type FormData = z.infer<typeof schema>;

// ============================================
// UPDATED STEPS - 4 Steps Only
// ============================================
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
      currentPinCode: "",
      interests: [],
      aadharNumber: "",
      familyMembers: [{ name: "", dob: "", relation: "" }],
    },
    mode: "onChange",
  });

  // Redirect to login if not authenticated
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
    // Validate the complete form
    const isValid = await methods.trigger();
    if (!isValid) {
      toast.error("Please correct the highlighted required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = methods.getValues();
      
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

      const age = calculateAge(data.dob);

      // Prepare profile data
      const profileData = {
        uid: user.uid,
        displayName: data.fullName,
        email: user.email || '',
        phoneNumber: data.mobileNumber,
        age: age,
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
        currentPinCode: data.currentPinCode,
        interests: data.interests,
        aadharNumber: data.aadharNumber,
        familyMembers: data.familyMembers || [],
        hasJoinedCommunity: true,
        isVerified: false,
      };

      // Create user profile
      await userService.createUserProfile(user.uid, profileData);

      // Upload profile photo
      if (data.photo instanceof File) {
        await userService.uploadDocument(user.uid, data.photo, 'profilePhoto');
      }

      setIsSuccess(true);
      toast.success("Profile submitted successfully! Our team will verify your details.");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Submit error:", error);
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
        title={STEPS[currentStep - 1]?.title || "Join Community"}
        subtitle={STEPS[currentStep - 1]?.subtitle || ""}
      >
        {renderStep()}
      </JoinCommunityLayout>
    </FormProvider>
  );
}