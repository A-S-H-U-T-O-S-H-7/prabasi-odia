import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FamilyMember {
  name: string;
  dob: string; // Date of Birth instead of age
  relation: string;
}

export interface RegistrationData {
  // Step 1: Personal
  fullName: string;
  dob: string; // Date of Birth
  gender: string;
  bloodGroup: string;
  photo?: File | string;
  mobileNumber: string;
  occupation: string;
  
  // Step 2: Family
  familyMembers: FamilyMember[];
  
  // Step 3: Address
  odishaHomeAddress: string;
  odishaDistrict: string;
  odishaCity: string;
  odishaPinCode: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  currentPinCode: string;
  
  // Step 4: Interests & Aadhar
  interests: string[];
  aadharNumber: string;
}

interface RegistrationState {
  currentStep: number;
  totalSteps: number;
  formData: RegistrationData;
  isSubmitting: boolean;
  error: string | null;
  
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<RegistrationData>) => void;
  resetRegistration: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
}

const initialRegistrationData: RegistrationData = {
  fullName: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  photo: undefined,
  mobileNumber: '',
  occupation: '',
  familyMembers: [{ name: '', dob: '', relation: '' }],
  odishaHomeAddress: '',
  odishaDistrict: '',
  odishaCity: '',
  odishaPinCode: '',
  currentAddress: '',
  currentCity: '',
  currentState: '',
  currentCountry: '',
  currentPinCode: '',
  interests: [],
  aadharNumber: '',
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      totalSteps: 4,
      formData: initialRegistrationData,
      isSubmitting: false,
      error: null,

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step: number) => {
        const { totalSteps } = get();
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step });
        }
      },

      updateFormData: (data: Partial<RegistrationData>) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      resetRegistration: () => {
        set({
          currentStep: 1,
          formData: initialRegistrationData,
          isSubmitting: false,
          error: null,
        });
      },

      setIsSubmitting: (isSubmitting: boolean) => {
        set({ isSubmitting });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'registration-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
      }),
    }
  )
);