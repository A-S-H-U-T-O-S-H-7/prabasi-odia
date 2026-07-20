import { doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relation: string;
  occupation?: string;
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  age: number;
  gender: string;
  bloodGroup: string;
  odishaHomeAddress: string;
  odishaDistrict: string;
  odishaCity: string;
  odishaPinCode: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPinCode: string;
  occupation?: string;
  organization?: string;
  interests: string[];
  familyMembers: FamilyMember[];
  hasJoinedCommunity: boolean;
  isVerified: boolean;
  memberId?: string;
  documents?: {
    aadharFront?: string;
    aadharBack?: string;
    voterId?: string;
    profilePhoto?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  async createUserProfile(uid: string, data: Partial<UserProfileData>) {
    const userRef = doc(db, 'users', uid);
    const now = new Date().toISOString();
    
    await setDoc(userRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    
    return { success: true };
  },

  async updateUserProfile(uid: string, data: Partial<UserProfileData>) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  },

  async getUserProfile(uid: string) {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, data: null };
  },

  async uploadDocument(uid: string, file: File, type: 'aadharFront' | 'aadharBack' | 'voterId' | 'profilePhoto') {
    const path = `users/${uid}/documents/${type}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      [`documents.${type}`]: downloadURL,
      ...(type === 'profilePhoto' ? { photoURL: downloadURL } : {}),
      updatedAt: new Date().toISOString(),
    });
    
    return { success: true, url: downloadURL };
  },

  generateMemberId(count: number) {
    const prefix = 'OD';
    const year = new Date().getFullYear().toString().slice(-2);
    const padded = String(count + 1).padStart(5, '0');
    return `${prefix}${year}${padded}`;
  },
};
