"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import JoinCommunityLayout from "@/components/web/join-community/JoinCommunityLayout";
import Step1Personal from "@/components/web/join-community/Step1Personal";
import Step2Address,{ CANT_FIND_COMMUNITY} from "@/components/web/join-community/Step2Address";
import Step0Account from "@/components/web/join-community/Step0Account";
import SuccessPage from "@/components/web/join-community/SuccessPage";
import { userService, type UserProfileData } from "@/lib/services/userService";
import { emailService } from "@/lib/services/emailService";
import { geocodeLocation } from "@/lib/utils/locationGeocode";
import { isIndianCountryCode, normalizeIndianPhone } from "@/lib/mobileVerification";
import { useJoinFormDraft } from "@/hooks/useJoinFormDraft";
import JoinFormSupport from "@/components/web/join-community/JoinFormSupport";

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
  dobDay: z.string().optional(),
  dobMonth: z.string().optional(),
  dobYear: z.string().optional(),
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

  nearbyCommunityId: z.string().min(1, "Please select your nearby community"),
  nearbyCommunityName: z.string().optional(),
  requestedCommunityName: z.string().optional(),

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
  identityConsent: z.boolean(),
  identityDocumentSelected: z.boolean().optional(),
  
  // ✅ Document uploads - optional
  aadharFront: z.any().optional(),
  aadharBack: z.any().optional(),
  passportFile: z.any().optional(),

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
  { title: "Personal Details", subtitle: "Tell us about yourself" },
  { title: "Your Roots", subtitle: "Where do you call home?" },
  { title: "Create Account", subtitle: "Create your account and submit your application" },
];

export default function JoinCommunityPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'failed'>('pending');
  const submissionInFlight = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, isSuccess]);

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
      idType: "aadhar" as "aadhar" | "passport",
      aadharNumber: "",
      passportNumber: "",
      identityConsent: true,
      identityDocumentSelected: false,
      aadharFront: undefined,
      aadharBack: undefined,
      passportFile: undefined,
    },
    mode: "onChange",
  });

  const draft = useJoinFormDraft(methods, currentStep, setCurrentStep);
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleSubmit = async (accountUser = user) => {
    if (submissionInFlight.current || isSuccess) return;
    submissionInFlight.current = true;
    setIsSubmitting(true);
    setSubmissionError('');
    setSubmissionStatus('Checking your application...');

    const showFailure = (message: string, step?: number) => {
      setSubmissionError(message);
      toast.error(message);
      if (step) setCurrentStep(step);
    };

    try {
      if (!accountUser?.uid) {
        showFailure('Please create your account to submit the application.', 3);
        return;
      }

      const validation = schema.safeParse(methods.getValues());
      if (!validation.success) {
        await methods.trigger();
        const issue = validation.error.issues[0];
        const field = String(issue.path[0] || '');
        const addressFields = ['odishaHomeAddress', 'odishaDistrict', 'odishaCity', 'odishaPinCode', 'currentAddress', 'currentCountry', 'currentState', 'currentCity', 'currentPinCode', 'currentLatitude', 'currentLongitude', 'nearbyCommunityId', 'nearbyCommunityName', 'requestedCommunityName'];
        showFailure(issue.message, addressFields.includes(field) ? 2 : 1);
        return;
      }
      const data = validation.data;
      if (isIndianCountryCode(data.mobileCountryCode) && !data.mobileVerified) {
        showFailure('Please verify your mobile number again before submitting your restored application.', 1);
        return;
      }
      if (!isIndianCountryCode(data.mobileCountryCode) && (!data.emailVerified || data.verifiedEmail?.toLowerCase() !== data.email?.toLowerCase())) {
        showFailure('Please verify your email address before submitting your application.', 1);
        return;
      }

      const duplicate = await userService.findDuplicateIdentity({
        uid: accountUser.uid,
        phoneNumber: data.mobileNumber,
        mobileCountryCode: data.mobileCountryCode,
        aadharNumber: data.idType === "aadhar" ? data.aadharNumber : null,
        passportNumber: data.idType === "passport" ? data.passportNumber : null,
      });
      if (duplicate.field) {
        const labels = {
          phone: "phone number",
          aadhar: "Aadhar number",
          passport: "passport number",
        };
        showFailure(`This ${labels[duplicate.field]} is already linked to another account.`, 1);
        return;
      }

      const age = calculateAge(data.dob);
      const isCommunityRequest = (data.nearbyCommunityId || "") === CANT_FIND_COMMUNITY;
      const selectedCommunityId = isCommunityRequest ? null : (data.nearbyCommunityId || null);
      const selectedCommunityName = isCommunityRequest ? null : (data.nearbyCommunityName || null);
      const requestedCommunityName = isCommunityRequest ? (data.requestedCommunityName || "").trim() : null;
      const communityRequestStatus: UserProfileData["communityRequestStatus"] = "pending";

      let currentLatitude = data.currentLatitude ?? null;
      let currentLongitude = data.currentLongitude ?? null;

      if (currentLatitude == null || currentLongitude == null) {
        setSubmissionStatus('Checking your location...');
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
        uid: accountUser.uid,
        displayName: data.fullName,
        email: accountUser.email || data.email || '',
        phoneNumber: data.mobileNumber,
        mobileCountryCode: data.mobileCountryCode,
        phoneKey: `${data.mobileCountryCode}${data.mobileNumber}`.replace(/[^0-9+]/g, ""),
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
        interests: [],
        idType: data.idType,
        aadharNumber: data.idType === "aadhar" ? data.aadharNumber : null,
        passportNumber: data.idType === "passport" ? data.passportNumber : null,
        identityConsent: data.identityConsent,
        familyMembers: [],
        hasJoinedCommunity: true,
        isVerified: false,
        applicationStatus: 'pending_review' as const,
      };

      // Upload first; only mark the application submitted when every upload is ready.
      const documents: NonNullable<UserProfileData['documents']> = {};
      const upload = async (file: File, type: keyof typeof documents) => {
        const result = await userService.uploadDocument(accountUser.uid, file, type, false);
        documents[type] = result.url;
      };
      setSubmissionStatus('Uploading your profile photo...');
      await upload(data.photo, 'profilePhoto');
      setSubmissionStatus('Uploading your documents...');
      if (data.idType === 'aadhar') {
        if (data.aadharFront instanceof File) await upload(data.aadharFront, 'aadharFront');
        if (data.aadharBack instanceof File) await upload(data.aadharBack, 'aadharBack');
      } else if (data.passportFile instanceof File) {
        await upload(data.passportFile, 'passportFile');
      }

      setSubmissionStatus('Saving your application...');
      await userService.createUserProfile(accountUser.uid, {
        ...profileData, documents, photoURL: documents.profilePhoto,
      });

      // Email delivery and local draft cleanup must not hold up confirmation.
      setIsSuccess(true);
      void draft.clearDraft();
      toast.success('Application submitted! Our team will verify your details.');
      void emailService.sendWelcomeEmail({ name: data.fullName, email: accountUser.email || data.email || '' })
        .then((result) => setEmailStatus(result.success ? 'sent' : 'failed'))
        .catch(() => setEmailStatus('failed'));
    } catch (error: any) {
      showFailure(error?.message || 'Your application could not be submitted. Your entries are saved; please try again.');
      console.error('Submit error:', error);
    } finally {
      submissionInFlight.current = false;
      setSubmissionStatus('');
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
      return <SuccessPage emailStatus={emailStatus} onGoHome={handleGoHome} onGoProfile={handleGoProfile} />;
    }

    switch (currentStep) {
      case 1:
        return <Step1Personal onNext={handleNext} />;
      case 2:
        return <Step2Address onNext={handleNext} onBack={handleBack} buttonLabel="Next" />;
      case 3:
        return <Step0Account isSubmitting={isSubmitting} onBack={handleBack} initialName={methods.getValues("fullName")} initialEmail={methods.getValues("email")} onComplete={async ({ name, email, uid }) => {
          methods.setValue("fullName", methods.getValues("fullName") || name);
          methods.setValue("email", email);
          await handleSubmit({ uid, email });
        }} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <JoinFormSupport step={currentStep}>
      <JoinCommunityLayout
        currentStep={currentStep}
        totalSteps={STEPS.length}
        title={isSuccess ? 'Application submitted' : STEPS[currentStep - 1]?.title || 'Join Community'}
        subtitle={isSuccess ? 'Thank you for joining Prabasi Odia' : STEPS[currentStep - 1]?.subtitle || ''}
      >
        {!isSuccess && <p role="status" className="mb-3 text-xs text-[#6B5E5A]">{draft.ready ? draft.status : 'Restoring your progress…'}</p>}
        {!isSuccess && submissionError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submissionError}</p>}
        {!isSuccess && isSubmitting && <p role="status" className="mb-4 text-sm font-medium text-[#6B1E5B]">{submissionStatus}</p>}
        {draft.ready && renderStep()}
      </JoinCommunityLayout>
      </JoinFormSupport>
    </FormProvider>
  );
}
