// lib/services/userService.ts
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
  currentCountry?: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  currentPinCode: string;
  nearbyCommunityId?: string | null;
  nearbyCommunityName?: string | null;
  requestedCommunityName?: string | null;
  communityRequestStatus?: 'pending' | 'joined' | 'created' | null;
  occupation?: string;
  organization?: string;
  interests: string[];
  idType?: 'aadhar' | 'passport';
  aadharNumber?: string | null;
  passportNumber?: string | null;
  documents?: {
    aadharFront?: string;
    aadharBack?: string;
    passportFile?: string;
    profilePhoto?: string;
  };
  familyMembers: FamilyMember[];
  hasJoinedCommunity: boolean;
  isVerified: boolean;
  memberId?: string;
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

  /** Public member lookup by memberId or uid (for QR verification). */
  async getPublicMemberById(id: string) {
    const toPublic = (docId: string, data: any) => {
      const createdAt =
        data.createdAt?.toDate?.()?.toISOString?.() ||
        (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt || '');
      return {
        uid: docId,
        displayName: data.displayName || '',
        photoURL: data.photoURL || data.documents?.profilePhoto || '',
        memberId: data.memberId || '',
        bloodGroup: data.bloodGroup || '',
        currentCity: data.currentCity || '',
        currentState: data.currentState || '',
        currentCountry: data.currentCountry || '',
        isVerified: data.isVerified === true,
        createdAt,
      };
    };

    try {
      const byUid = await getDoc(doc(db, 'users', id));
      if (byUid.exists()) {
        return { success: true, data: toPublic(byUid.id, byUid.data()) };
      }

      const q = query(collection(db, 'users'), where('memberId', '==', id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { success: true, data: toPublic(docSnap.id, docSnap.data()) };
      }

      return { success: false, data: null, error: 'Member not found' };
    } catch (error: any) {
      console.error('Error looking up public member:', error);
      return { success: false, data: null, error: error.message || 'Lookup failed' };
    }
  },

  async uploadDocument(uid: string, file: File, type: 'aadharFront' | 'aadharBack' | 'passportFile' | 'profilePhoto') {
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