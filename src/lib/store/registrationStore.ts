import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FamilyMember {
  name: string;
  age: number;
  relation: string;
}

export interface RegistrationData {
  // Step 1: Personal
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  photo?: File | string;
  
  // Step 2: Family
  familyMembers: FamilyMember[];
  
  // Step 3: Address
  odishaHomeAddress: string;
  odishaDistrict: string;
  currentCity: string;
  currentAddress: string;
  
  // Step 4: Professional
  occupation: string;
  organization: string;
  
  // Step 5: Interests
  interests: string[];
  
  // Step 6: Documents
  aadharFront?: File | string;
  aadharBack?: File | string;
  voterId?: File | string;
  
  // Consent
  consent: boolean;
}

interface RegistrationState {
  // State
  currentStep: number;
  totalSteps: number;
  formData: RegistrationData;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
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
  age: '',
  gender: '',
  bloodGroup: '',
  photo: undefined,
  familyMembers: [{ name: '', age: 0, relation: '' }],
  odishaHomeAddress: '',
  odishaDistrict: '',
  currentCity: '',
  currentAddress: '',
  occupation: '',
  organization: '',
  interests: [],
  aadharFront: undefined,
  aadharBack: undefined,
  voterId: undefined,
  consent: false,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      totalSteps: 6,
      formData: initialRegistrationData,
      isSubmitting: false,
      error: null,

      // Actions
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