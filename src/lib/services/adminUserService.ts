import { db } from '@/lib/firebase/config';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  mobileNumber?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  odishaHomeAddress?: string;
  odishaDistrict?: string;
  odishaCity?: string;
  odishaPinCode?: string;
  currentAddress?: string;
  currentCity?: string;
  currentState?: string;
  currentPinCode?: string;
  occupation?: string;
  organization?: string;
  interests?: string[];
  familyMembers?: any[];
  documents?: {
    aadharFront?: string;
    aadharBack?: string;
    voterId?: string;
    profilePhoto?: string;
  };
  hasJoinedCommunity: boolean;
  isVerified: boolean;
  memberId?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
}

export const adminUserService = {
  // Get all users with pagination
  async getUsers(
    limitCount: number = 10,
    lastDoc?: any,
    filters?: {
      search?: string;
      status?: 'all' | 'pending' | 'verified';
      city?: string;
    }
  ) {
    try {
      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      // Apply status filter
      if (filters?.status === 'pending') {
        q = query(
          collection(db, 'users'),
          where('hasJoinedCommunity', '==', true),
          where('isVerified', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else if (filters?.status === 'verified') {
        q = query(
          collection(db, 'users'),
          where('isVerified', '==', true),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          uid: doc.id,
          // Ensure documents is always an object
          documents: data.documents || {},
        } as UserData;
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        users,
        lastVisible,
        hasMore: snapshot.docs.length === limitCount,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], lastVisible: null, hasMore: false };
    }
  },

  // Get user by ID
  async getUserById(uid: string) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          user: { 
            ...data, 
            uid: docSnap.id,
            documents: data.documents || {},
          } as UserData 
        };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: 'Error fetching user' };
    }
  },

  // Verify user
  async verifyUser(uid: string, memberId: string) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        isVerified: true,
        memberId: memberId,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: 'Error verifying user' };
    }
  },

  // Reject user
  async rejectUser(uid: string, reason: string) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        isVerified: false,
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: 'Error rejecting user' };
    }
  },

  // Get user stats
  async getUserStats() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let total = 0;
      let pending = 0;
      let verified = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.hasJoinedCommunity && !data.isVerified) pending++;
        if (data.isVerified) verified++;
      });

      return { total, pending, verified };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { total: 0, pending: 0, verified: 0 };
    }
  },

  // Delete user
  async deleteUser(uid: string) {
    try {
      await deleteDoc(doc(db, 'users', uid));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error deleting user' };
    }
  },

  // Search users
  async searchUsers(searchTerm: string) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const results: UserData[] = [];
      const term = searchTerm.toLowerCase();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (
          data.displayName?.toLowerCase().includes(term) ||
          data.email?.toLowerCase().includes(term) ||
          data.memberId?.toLowerCase().includes(term) ||
          data.currentCity?.toLowerCase().includes(term)
        ) {
          results.push({ 
            ...data, 
            uid: doc.id,
            documents: data.documents || {},
          } as UserData);
        }
      });
      
      return { success: true, users: results };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: 'Error searching users' };
    }
  },
};