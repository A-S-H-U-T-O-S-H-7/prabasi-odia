import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface FamilyMember {
  id?: string;
  name: string;
  age: number | string;
  relation: string;
  occupation?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  
  // Community Status
  hasJoinedCommunity: boolean;
  memberId?: string;
  isVerified: boolean;
  
  // Personal Details
  age?: number;
  gender?: string;
  bloodGroup?: string;
  
  // Address
  odishaHomeAddress?: string;
  odishaDistrict?: string;
  odishaCity?: string;
  odishaPinCode?: string;
  currentCity?: string;
  currentAddress?: string;
  currentState?: string;
  currentPinCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Professional
  occupation?: string;
  organization?: string;
  
  // Interests
  interests?: string[];
  
  // Family
  familyMembers?: FamilyMember[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserState {
  // State
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasJoinedCommunity: boolean;
  
  // Actions
  fetchUserProfile: (uid: string) => Promise<void>;
  createUserProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  setHasJoinedCommunity: (uid: string, hasJoined: boolean) => Promise<void>;
  clearProfile: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial State
      profile: null,
      loading: false,
      error: null,
      hasJoinedCommunity: false,

      // Actions
      fetchUserProfile: async (uid: string) => {
        try {
          set({ loading: true, error: null });
          const userDoc = await getDoc(doc(db, 'users', uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: UserProfile = {
              uid,
              displayName: data.displayName || '',
              email: data.email || '',
              photoURL: data.photoURL || data.documents?.profilePhoto || '',
              phoneNumber: data.phoneNumber || '',
              hasJoinedCommunity: data.hasJoinedCommunity || false,
              memberId: data.memberId || '',
              isVerified: data.isVerified || false,
              age: data.age || undefined,
              gender: data.gender || '',
              bloodGroup: data.bloodGroup || '',
              odishaHomeAddress: data.odishaHomeAddress || '',
              odishaDistrict: data.odishaDistrict || '',
              odishaCity: data.odishaCity || '',
              odishaPinCode: data.odishaPinCode || '',
              currentCity: data.currentCity || '',
              currentAddress: data.currentAddress || '',
              currentState: data.currentState || '',
              currentPinCode: data.currentPinCode || '',
              latitude: data.latitude || undefined,
              longitude: data.longitude || undefined,
              occupation: data.occupation || '',
              organization: data.organization || '',
              interests: data.interests || [],
              familyMembers: data.familyMembers || [],
              createdAt: data.createdAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
            };
            
            set({ 
              profile, 
              hasJoinedCommunity: profile.hasJoinedCommunity,
              loading: false 
            });
          } else {
            set({ loading: false, profile: null });
          }
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message 
          });
        }
      },

      createUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        try {
          set({ loading: true, error: null });
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          const profile: UserProfile = {
            uid,
            displayName: data.displayName || '',
            email: data.email || '',
            hasJoinedCommunity: false,
            isVerified: false,
            ...data,
          };
          
          set({ 
            profile, 
            hasJoinedCommunity: false,
            loading: false 
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        try {
          set({ loading: true, error: null });
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, {
            ...data,
            updatedAt: new Date(),
          });
          
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, ...data },
              loading: false 
            });
          }
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      setHasJoinedCommunity: async (uid: string, hasJoined: boolean) => {
        try {
          set({ loading: true, error: null });
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, {
            hasJoinedCommunity: hasJoined,
            updatedAt: new Date(),
          });
          
          const { profile } = get();
          if (profile) {
            set({ 
              profile: { ...profile, hasJoinedCommunity: hasJoined },
              hasJoinedCommunity: hasJoined,
              loading: false 
            });
          }
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message 
          });
          throw error;
        }
      },

      clearProfile: () => {
        set({ 
          profile: null,
          hasJoinedCommunity: false,
          loading: false,
          error: null 
        });
      },

      setProfile: (profile: UserProfile | null) => {
        set({ 
          profile, 
          hasJoinedCommunity: profile?.hasJoinedCommunity || false 
        });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
        hasJoinedCommunity: state.hasJoinedCommunity,
      }),
    }
  )
);
