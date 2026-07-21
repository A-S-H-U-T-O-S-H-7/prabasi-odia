import { db } from '@/lib/firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

export interface PublicCommunity {
  id: string;
  name: string;
  city: string;
  state: string;
  description: string;
  coverImage?: string;
  memberCount: number;
  status: 'active' | 'pending' | 'inactive';
  members?: string[];
  createdAt: string;
}

export const publicCommunityService = {
  // Get all active communities
  async getActiveCommunities() {
    try {
      const q = query(
        collection(db, 'communities'),
        where('status', '==', 'active'),
        orderBy('memberCount', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const communities: PublicCommunity[] = [];
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
          status: data.status || 'active',
          members: data.members || [],
          createdAt: data.createdAt || new Date().toISOString(),
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
      const docRef = doc(db, 'communities', id);
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
          status: data.status || 'active',
          members: data.members || [],
          createdAt: data.createdAt || new Date().toISOString(),
        } as PublicCommunity
      };
    } catch (error: any) {
      console.error('Error getting community:', error);
      return { success: false, error: error.message };
    }
  },

  // Join community
  async joinCommunity(communityId: string, userId: string) {
    try {
      const docRef = doc(db, 'communities', communityId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found' };
      }
      
      const data = docSnap.data();
      const members = data.members || [];
      
      if (members.includes(userId)) {
        return { success: false, error: 'Already a member' };
      }
      
      await updateDoc(docRef, {
        members: arrayUnion(userId),
        memberCount: members.length + 1,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error joining community:', error);
      return { success: false, error: error.message };
    }
  },

  // Leave community
  async leaveCommunity(communityId: string, userId: string) {
    try {
      const docRef = doc(db, 'communities', communityId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found' };
      }
      
      const data = docSnap.data();
      const members = data.members || [];
      
      if (!members.includes(userId)) {
        return { success: false, error: 'Not a member' };
      }
      
      await updateDoc(docRef, {
        members: arrayRemove(userId),
        memberCount: members.length - 1,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error leaving community:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user is member
  async isUserMember(communityId: string, userId: string) {
    try {
      const docRef = doc(db, 'communities', communityId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found', isMember: false };
      }
      
      const data = docSnap.data();
      const members = data.members || [];
      
      return { success: true, isMember: members.includes(userId) };
    } catch (error: any) {
      console.error('Error checking membership:', error);
      return { success: false, error: error.message, isMember: false };
    }
  },

  // Get communities by city
  async getCommunitiesByCity(city: string) {
    try {
      const q = query(
        collection(db, 'communities'),
        where('city', '==', city),
        where('status', '==', 'active'),
        orderBy('memberCount', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const communities: PublicCommunity[] = [];
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
          status: data.status || 'active',
          members: data.members || [],
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      
      return { success: true, communities };
    } catch (error: any) {
      console.error('Error getting communities by city:', error);
      return { success: false, error: error.message, communities: [] };
    }
  },
};