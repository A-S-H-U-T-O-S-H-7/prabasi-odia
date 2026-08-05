import { db, storage } from '@/lib/firebase/config';
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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const COLLECTION = 'communities';

export interface Community {
  id: string;
  name: string;
  country: string;
  state: string;
  city: string;
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
  // ✅ Upload cover image to Firebase Storage
  async uploadCoverImage(file: File, communityId: string): Promise<string> {
    try {
      // Compress image if needed (optional)
      const compressedFile = await compressImage(file);
      
      const path = `communities/${communityId}/cover`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading cover image:', error);
      throw new Error('Failed to upload image');
    }
  },

  // ✅ Delete cover image from storage
  async deleteCoverImage(communityId: string) {
    try {
      const storageRef = ref(storage, `communities/${communityId}/cover`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting cover image:', error);
      // Don't throw error if image doesn't exist
      return { success: true };
    }
  },

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
          country: data.country || 'India',
          state: data.state || '',
          city: data.city || '',
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
          country: data.country || 'India',
          state: data.state || '',
          city: data.city || '',
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

  // ✅ Create community with image upload
  async createCommunity(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      // If there's a file to upload, upload it first
      let coverImageUrl = '';
      if (data.coverImageFile && data.coverImageFile instanceof File) {
        coverImageUrl = await this.uploadCoverImage(data.coverImageFile, docRef.id);
      } else if (data.coverImage && typeof data.coverImage === 'string') {
        // If it's already a URL (existing image)
        coverImageUrl = data.coverImage;
      }
      
      const communityData = {
        name: data.name,
        country: data.country || 'India',
        state: data.state,
        city: data.city,
        description: data.description,
        coverImage: coverImageUrl,
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

  // ✅ Update community with image upload
  async updateCommunity(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      // Check if we need to upload a new image
      let coverImageUrl = data.coverImage || '';
      if (data.coverImageFile && data.coverImageFile instanceof File) {
        // Delete old image if exists
        await this.deleteCoverImage(id);
        // Upload new image
        coverImageUrl = await this.uploadCoverImage(data.coverImageFile, id);
      } else if (data.coverImage && typeof data.coverImage === 'string') {
        coverImageUrl = data.coverImage;
      }
      
      const updateData: any = {
        name: data.name,
        country: data.country || 'India',
        state: data.state,
        city: data.city,
        description: data.description,
        coverImage: coverImageUrl,
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

  // ✅ Delete community (with image)
  async deleteCommunity(id: string) {
    try {
      // Delete cover image from storage
      await this.deleteCoverImage(id);
      // Delete document from Firestore
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
          data.country?.toLowerCase().includes(term) ||
          data.state?.toLowerCase().includes(term) ||
          data.city?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            name: data.name || '',
            country: data.country || 'India',
            state: data.state || '',
            city: data.city || '',
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

  // Remove member from community
  async removeMemberFromCommunity(communityId: string, userId: string) {
    try {
      const docRef = doc(db, COLLECTION, communityId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Community not found' };
      }
      
      const data = docSnap.data();
      const members = data.members || [];
      
      if (members.includes(userId)) {
        const updatedMembers = members.filter((id: string) => id !== userId);
        await updateDoc(docRef, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  },
};

// ✅ Helper function to compress image
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions (reduce if too large)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.7 
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}