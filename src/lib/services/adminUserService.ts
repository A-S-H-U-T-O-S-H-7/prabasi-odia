import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { adminCommunityService } from './adminCommunityService';

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
  nearbyCommunityId?: string | null;
  nearbyCommunityName?: string | null;
  requestedCommunityName?: string | null;
  communityRequestStatus?: 'pending' | 'joined' | 'created' | null;
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
  // Map Firestore docs → UserData (avoids composite index issues via client filter)
  _mapUserDoc(docSnap: { id: string; data: () => Record<string, any> }): UserData {
    const data = docSnap.data();
    return {
      ...data,
      uid: docSnap.id,
      documents: data.documents || {},
    } as UserData;
  },

  _sortByCreatedAtDesc(users: UserData[]) {
    return users.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  },

  // Get joining-form community members (hasJoinedCommunity === true)
  async getUsers(
    limitCount: number = 10,
    _lastDoc?: any,
    filters?: {
      search?: string;
      status?: 'all' | 'pending' | 'verified';
      city?: string;
    }
  ) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      let users = snapshot.docs
        .map((d) => this._mapUserDoc(d))
        .filter((u) => u.hasJoinedCommunity);

      if (filters?.status === 'pending') {
        users = users.filter((u) => !u.isVerified);
      } else if (filters?.status === 'verified') {
        users = users.filter((u) => u.isVerified);
      }

      users = this._sortByCreatedAtDesc(users).slice(0, limitCount);

      return {
        users,
        lastVisible: null,
        hasMore: false,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], lastVisible: null, hasMore: false };
    }
  },

  // Get all registered/signup users (regardless of joining form)
  async getRegisteredUsers(
    limitCount: number = 20,
    _lastDoc?: any,
    filters?: {
      status?: 'all' | 'joined' | 'signup_only';
    }
  ) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      let users = snapshot.docs.map((d) => this._mapUserDoc(d));

      if (filters?.status === 'joined') {
        users = users.filter((u) => u.hasJoinedCommunity);
      } else if (filters?.status === 'signup_only') {
        users = users.filter((u) => !u.hasJoinedCommunity);
      }

      users = this._sortByCreatedAtDesc(users).slice(0, limitCount);

      return {
        users,
        lastVisible: null,
        hasMore: false,
      };
    } catch (error) {
      console.error('Error fetching registered users:', error);
      return { users: [], lastVisible: null, hasMore: false };
    }
  },

  async getRegisteredUserStats() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      let total = 0;
      let joined = 0;
      let signupOnly = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.hasJoinedCommunity) {
          joined++;
        } else {
          signupOnly++;
        }
      });

      return { total, joined, signupOnly };
    } catch (error) {
      console.error('Error fetching registered user stats:', error);
      return { total: 0, joined: 0, signupOnly: 0 };
    }
  },

  async searchRegisteredUsers(searchTerm: string) {
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
          data.memberId?.toLowerCase().includes(term)
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
      console.error('Error searching registered users:', error);
      return { success: false, error: 'Error searching registered users', users: [] as UserData[] };
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
      const userDoc = await getDoc(docRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      const updates: Record<string, any> = {
        isVerified: true,
        hasJoinedCommunity: true,
        memberId,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (userData.communityRequestStatus === 'pending' && userData.requestedCommunityName) {
        const requestedName = String(userData.requestedCommunityName).trim();
        const createdCommunityResult = await adminCommunityService.createCommunity({
          name: requestedName,
          city: userData.currentCity || userData.odishaCity || '',
          state: userData.currentState || '',
          description: `Community requested by ${userData.displayName || 'a member'}`,
          createdBy: 'admin',
        });

        if (createdCommunityResult.success && createdCommunityResult.id) {
          await adminCommunityService.addMemberToCommunity(createdCommunityResult.id, uid);
          updates.communityRequestStatus = 'created';
          updates.nearbyCommunityId = createdCommunityResult.id;
          updates.nearbyCommunityName = requestedName;
          updates.requestedCommunityName = null;
        } else {
          updates.communityRequestStatus = 'pending';
        }
      } else if (userData.nearbyCommunityId) {
        await adminCommunityService.addMemberToCommunity(userData.nearbyCommunityId, uid);
        updates.communityRequestStatus = userData.communityRequestStatus || 'joined';
        updates.nearbyCommunityName = userData.nearbyCommunityName || updates.nearbyCommunityName;
      } else if (userData.communityRequestStatus === 'joined') {
        updates.communityRequestStatus = 'joined';
      }

      await updateDoc(docRef, updates);
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
      const userDoc = await getDoc(docRef);
      const updates: Record<string, any> = {
        isVerified: false,
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (userDoc.exists() && userDoc.data().communityRequestStatus === 'pending') {
        updates.communityRequestStatus = null;
      }

      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: 'Error rejecting user' };
    }
  },

  // Get joining-form member stats
  async getUserStats() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let total = 0;
      let pending = 0;
      let verified = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.hasJoinedCommunity) return;
        total++;
        if (!data.isVerified) pending++;
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

  // Search joining-form members
  async searchUsers(searchTerm: string) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const results: UserData[] = [];
      const term = searchTerm.toLowerCase();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.hasJoinedCommunity) return;
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