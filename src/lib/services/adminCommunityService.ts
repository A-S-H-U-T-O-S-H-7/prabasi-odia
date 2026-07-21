import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';

const COLLECTION = 'communities';

export interface Community {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  coverImage?: string;
  memberCount: number;
  status: 'active' | 'pending' | 'inactive';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members?: string[];
}

export const adminCommunityService = {
  // Get all communities
  async getAllCommunities() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const communities: Community[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        communities.push({
          id: doc.id,
          name: data.name || '',
          city: data.city || '',
          state: data.state || '',
          description: data.description || '',
          coverImage: data.coverImage || '',
          memberCount: data.memberCount || 0,
          status: data.status || 'pending',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          members: data.members || [],
        });
      });
      
      return { success: true, communities };
    } catch (error: any) {
      console.error('Error getting communities:', error);
      return { success: false, error: error.message, communities: [] };
    }
  },

  // Get community by ID
  async getCommunityById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        community: {
          id: docSnap.id,
          name: data.name || '',
          city: data.city || '',
          state: data.state || '',
          description: data.description || '',
          coverImage: data.coverImage || '',
          memberCount: data.memberCount || 0,
          status: data.status || 'pending',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          members: data.members || [],
        } as Community
      };
    } catch (error: any) {
      console.error('Error getting community:', error);
      return { success: false, error: error.message };
    }
  },

  // Create community
  async createCommunity(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      const communityData = {
        name: data.name,
        city: data.city,
        state: data.state,
        description: data.description,
        coverImage: data.coverImage || '',
        memberCount: 0,
        status: 'active',
        createdBy: data.createdBy || '',
        members: [],
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, communityData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating community:', error);
      return { success: false, error: error.message };
    }
  },

  // Update community
  async updateCommunity(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      const updateData: any = {
        name: data.name,
        city: data.city,
        state: data.state,
        description: data.description,
        coverImage: data.coverImage || '',
        status: data.status || 'active',
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating community:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete community
  async deleteCommunity(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting community:', error);
      return { success: false, error: error.message };
    }
  },

  // Get community stats
  async getCommunityStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let active = 0;
      let pending = 0;
      let inactive = 0;
      let totalMembers = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'active') active++;
        if (data.status === 'pending') pending++;
        if (data.status === 'inactive') inactive++;
        totalMembers += data.memberCount || 0;
      });
      
      return { total, active, pending, inactive, totalMembers };
    } catch (error) {
      console.error('Error getting community stats:', error);
      return { total: 0, active: 0, pending: 0, inactive: 0, totalMembers: 0 };
    }
  },

  // Search communities
  async searchCommunities(searchTerm: string) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      const results: Community[] = [];
      const term = searchTerm.toLowerCase();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.name?.toLowerCase().includes(term) ||
          data.city?.toLowerCase().includes(term) ||
          data.state?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            name: data.name || '',
            city: data.city || '',
            state: data.state || '',
            description: data.description || '',
            coverImage: data.coverImage || '',
            memberCount: data.memberCount || 0,
            status: data.status || 'pending',
            createdBy: data.createdBy || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            members: data.members || [],
          });
        }
      });
      
      return { success: true, communities: results };
    } catch (error: any) {
      console.error('Error searching communities:', error);
      return { success: false, error: error.message, communities: [] };
    }
  },

  // Get community members
  async getCommunityMembers(communityId: string) {
    try {
      const result = await this.getCommunityById(communityId);
      if (!result.success || !result.community) {
        return { success: false, error: 'Community not found', members: [] };
      }
      
      const memberIds = result.community.members || [];
      
      if (memberIds.length === 0) {
        return { success: true, members: [] };
      }
      
      // Fetch user details for each member
      const usersRef = collection(db, 'users');
      const memberPromises = memberIds.map(async (uid) => {
        const userDoc = await getDoc(doc(usersRef, uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            uid,
            displayName: data.displayName || 'Unknown',
            email: data.email || '',
            photoURL: data.photoURL || '',
            isVerified: data.isVerified || false,
          };
        }
        return null;
      });
      
      const members = (await Promise.all(memberPromises)).filter(m => m !== null);
      
      return { success: true, members };
    } catch (error: any) {
      console.error('Error getting community members:', error);
      return { success: false, error: error.message, members: [] };
    }
  },

  // Add member to community
  async addMemberToCommunity(communityId: string, userId: string) {
    try {
      const docRef = doc(db, COLLECTION, communityId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found' };
      }
      
      const data = docSnap.data();
      const members = data.members || [];
      
      if (!members.includes(userId)) {
        members.push(userId);
        await updateDoc(docRef, {
          members: members,
          memberCount: members.length,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding member:', error);
      return { success: false, error: error.message };
    }
  },
};