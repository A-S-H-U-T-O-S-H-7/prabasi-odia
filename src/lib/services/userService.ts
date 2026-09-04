// lib/services/userService.ts
import { doc, setDoc, updateDoc, getDoc, collection, limit, query, where, getDocs } from 'firebase/firestore';
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
  phoneNumber?: string;
  mobileCountryCode?: string;
  phoneKey?: string;
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
  identityConsent?: boolean;
  documents?: {
    aadharFront?: string;
    aadharBack?: string;
    passportFile?: string;
    profilePhoto?: string;
  };
  familyMembers: FamilyMember[];
  hasJoinedCommunity: boolean;
  isVerified: boolean;
  /** Lifecycle: draft account -> submitted application -> approved membership. */
  applicationStatus?: 'draft' | 'pending_review' | 'approved';
  memberId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  async findDuplicateIdentity({
    uid,
    phoneNumber,
    mobileCountryCode,
    aadharNumber,
    passportNumber,
  }: {
    uid: string;
    phoneNumber: string;
    mobileCountryCode: string;
    aadharNumber?: string | null;
    passportNumber?: string | null;
  }): Promise<{ field?: 'phone' | 'aadhar' | 'passport' }> {
    const users = collection(db, 'users');
    const phoneKey = `${mobileCountryCode}${phoneNumber}`.replace(/[^0-9+]/g, '');

    const phoneMatches = await getDocs(query(users, where('phoneKey', '==', phoneKey), limit(2)));
    if (phoneMatches.docs.some((userDoc) => userDoc.id !== uid)) return { field: 'phone' };

    // Covers profiles created before phoneKey was introduced.
    const legacyPhoneMatches = await getDocs(query(users, where('phoneNumber', '==', phoneNumber), limit(10)));
    if (legacyPhoneMatches.docs.some((userDoc) =>
      userDoc.id !== uid && String(userDoc.data().mobileCountryCode || '') === mobileCountryCode
    )) return { field: 'phone' };

    if (aadharNumber) {
      const aadharMatches = await getDocs(query(users, where('aadharNumber', '==', aadharNumber), limit(2)));
      if (aadharMatches.docs.some((userDoc) => userDoc.id !== uid)) return { field: 'aadhar' };
    }

    if (passportNumber) {
      const passportMatches = await getDocs(query(users, where('passportNumber', '==', passportNumber), limit(2)));
      if (passportMatches.docs.some((userDoc) => userDoc.id !== uid)) return { field: 'passport' };
    }

    return {};
  },

  async createUserProfile(uid: string, data: Partial<UserProfileData>) {
    const userRef = doc(db, 'users', uid);
    const now = new Date().toISOString();
    const existing = await getDoc(userRef);
    
    await setDoc(userRef, {
      ...data,
      // An account is created in step one; submitting the application must
      // never overwrite its original audit timestamp.
      createdAt: existing.exists() ? existing.data().createdAt || now : now,
      updatedAt: now,
    }, { merge: true });
    
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
