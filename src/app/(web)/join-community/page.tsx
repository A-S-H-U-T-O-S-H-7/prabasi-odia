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
import Step4Documents from "@/components/web/join-community/Step4Documents";
import Step5Review from "@/components/web/join-community/Step5Review";
import SuccessPage from "@/components/web/join-community/SuccessPage";
import { userService } from "@/lib/services/userService";

// FIXED SCHEMA - consistent field names
const schema = z.object({
  // Step 1: Personal
  photo: z.any()
    .refine((file) => file instanceof File, "Profile photo is required"),
  fullName: z.string().min(2, "Full name is required"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  mobileNumber: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9][0-9]{9}$/, "Mobile number must start with 6,7,8, or 9"),

  // Step 2: Address - FIXED: Use odishaPinCode and currentPinCode consistently
  odishaHomeAddress: z.string().min(5, "Odisha home address is required"),
  odishaDistrict: z.string().min(1, "District is required"),
  odishaCity: z.string().min(2, "City is required"),
  odishaPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),
  
  currentAddress: z.string().min(5, "Current address is required"),
  currentState: z.string().min(2, "State is required"),
  currentCity: z.string().min(2, "Current city is required"),
  currentPinCode: z.string()
    .min(6, "Pin code must be 6 digits")
    .max(6, "Pin code must be 6 digits")
    .regex(/^[0-9]+$/, "Pin code must contain only numbers"),

  // Step 3: Interests
  interests: z.array(z.string()).min(2, "Please select at least 2 interests"),
  occupation: z.string().min(2, "Occupation is required"),
  organization: z.string().min(2, "Organization is required"),

  // Step 4: Documents
  aadharFront: z.any().refine((file) => file instanceof File, "Aadhar Front is required"),
  aadharBack: z.any().refine((file) => file instanceof File, "Aadhar Back is required"),
  voterId: z.any().refine((file) => file instanceof File, "Voter ID is required"),
  consent: z.boolean().refine((val) => val === true, "You must consent to document verification"),

  // Family Members (handled separately)
  familyMembers: z.array(z.any()).optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { title: "Personal & Family", subtitle: "Tell us about yourself" },
  { title: "Your Roots", subtitle: "Where do you call home?" },
  { title: "Your Passions", subtitle: "What drives you?" },
  { title: "Verify Identity", subtitle: "Upload your documents" },
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
      age: "",
      gender: "",
      bloodGroup: "",
      mobileNumber: "",
      odishaHomeAddress: "",
      odishaDistrict: "",
      odishaCity: "",
      odishaPinCode: "",  // FIXED: consistent naming
      currentAddress: "",
      currentCity: "",
      currentState: "",
      currentPinCode: "", // FIXED: consistent naming
      interests: [],
      occupation: "",
      organization: "",
      consent: false,
      familyMembers: [],
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
    // A user can return to an earlier step and change a value, so validate the
    // complete form again before writing anything to the backend.
    const isValid = await methods.trigger();
    if (!isValid) {
      toast.error("Please correct the highlighted required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = methods.getValues();
      
      // Prepare profile data
      const profileData = {
        uid: user.uid,
        displayName: data.fullName,
        email: user.email || '',
        mobileNumber: data.mobileNumber,
        age: parseInt(data.age),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        odishaHomeAddress: data.odishaHomeAddress,
        odishaDistrict: data.odishaDistrict,
        odishaCity: data.odishaCity,
        odishaPinCode: data.odishaPinCode, // FIXED
        currentAddress: data.currentAddress,
        currentCity: data.currentCity,
        currentState: data.currentState,
        currentPinCode: data.currentPinCode, // FIXED
        occupation: data.occupation,
        organization: data.organization,
        interests: data.interests,
        familyMembers: data.familyMembers || [],
        hasJoinedCommunity: true,
        isVerified: false,
      };

      // Create user profile
      await userService.createUserProfile(user.uid, profileData);
      
      // Upload documents
      if (data.aadharFront instanceof File) {
        await userService.uploadDocument(user.uid, data.aadharFront, 'aadharFront');
      }
      if (data.aadharBack instanceof File) {
        await userService.uploadDocument(user.uid, data.aadharBack, 'aadharBack');
      }
      if (data.voterId instanceof File) {
        await userService.uploadDocument(user.uid, data.voterId, 'voterId');
      }

      // Upload profile photo
      if (data.photo instanceof File) {
        await userService.uploadDocument(user.uid, data.photo, 'profilePhoto');
      }

      setIsSuccess(true);
      toast.success("Profile submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoHome = () => router.push('/');
  const handleGoProfile = () => router.push('/profile');

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
        return <Step4Documents onNext={handleNext} onBack={handleBack} />;
      case 5: 
        return (
          <Step5Review 
            onSubmit={handleSubmit} 
            onBack={handleBack} 
            onGoToStep={handleGoToStep} // FIXED: prop name matches component
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
