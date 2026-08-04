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

const COLLECTION = 'advisoryBoard';

export interface AdvisoryBoardMember {
  id: string;
  name: string;
  position: string;
  photoURL: string;
  organization?: string;
  designation?: string;
  bio?: string;
  achievements?: string[];
  experience?: string;
  order: number;
  isActive: boolean;
  featured?: boolean;
  linkedin?: string;
  twitter?: string;
  website?: string;
  joinedDate?: string;
  createdAt: string;
  updatedAt: string;
}

function mapMember(id: string, data: Record<string, any>): AdvisoryBoardMember {
  return {
    id,
    name: data.name || '',
    position: data.position || '',
    photoURL: data.photoURL || '',
    organization: data.organization || '',
    designation: data.designation || '',
    bio: data.bio || '',
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    experience: data.experience || '',
    order: typeof data.order === 'number' ? data.order : 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    featured: data.featured || false,
    linkedin: data.linkedin || '',
    twitter: data.twitter || '',
    website: data.website || '',
    joinedDate: data.joinedDate || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export const adminAdvisoryBoardService = {
  async uploadPhoto(file: File, memberId: string): Promise<string> {
    const path = `advisoryBoard/${memberId}/photo`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async deletePhoto(memberId: string) {
    try {
      const storageRef = ref(storage, `advisoryBoard/${memberId}/photo`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return { success: false };
    }
  },

  async getAllMembers() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const members: AdvisoryBoardMember[] = [];
      snapshot.forEach((d) => {
        members.push(mapMember(d.id, d.data()));
      });
      return { success: true, members };
    } catch (error: any) {
      console.error('Error getting advisory board members:', error);
      return { success: false, error: error.message, members: [] as AdvisoryBoardMember[] };
    }
  },

  async getActiveMembers() {
    try {
      // Filter + sort client-side to avoid composite index requirement
      const q = query(collection(db, COLLECTION), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const members: AdvisoryBoardMember[] = [];
      snapshot.forEach((d) => {
        members.push(mapMember(d.id, d.data()));
      });
      members.sort((a, b) => a.order - b.order);
      return { success: true, members };
    } catch (error: any) {
      console.error('Error getting active advisory board members:', error);
      return { success: false, error: error.message, members: [] as AdvisoryBoardMember[] };
    }
  },

  async getMemberById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { success: false, error: 'Member not found' };
      }
      return { success: true, member: mapMember(docSnap.id, docSnap.data()) };
    } catch (error: any) {
      console.error('Error getting advisory board member:', error);
      return { success: false, error: error.message };
    }
  },

  async createMember(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();

      let photoURL = '';
      if (data.photoFile && data.photoFile instanceof File) {
        photoURL = await this.uploadPhoto(data.photoFile, docRef.id);
      } else if (data.photoURL && typeof data.photoURL === 'string') {
        photoURL = data.photoURL;
      }

      const achievements = Array.isArray(data.achievements)
        ? data.achievements.filter((a: string) => a?.trim())
        : typeof data.achievementsText === 'string'
          ? data.achievementsText.split('\n').map((a: string) => a.trim()).filter(Boolean)
          : [];

      const memberData = {
        name: data.name,
        position: data.position,
        photoURL,
        organization: data.organization || '',
        designation: data.designation || '',
        bio: data.bio || '',
        achievements,
        experience: data.experience || '',
        order: typeof data.order === 'number' ? data.order : parseInt(data.order) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        featured: data.featured || false,
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        website: data.website || '',
        joinedDate: data.joinedDate || '',
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(docRef, memberData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating advisory board member:', error);
      return { success: false, error: error.message };
    }
  },

  async updateMember(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);

      let photoURL = data.photoURL || '';
      if (data.photoFile && data.photoFile instanceof File) {
        await this.deletePhoto(id);
        photoURL = await this.uploadPhoto(data.photoFile, id);
      } else if (data.photoURL && typeof data.photoURL === 'string') {
        photoURL = data.photoURL;
      }

      const achievements = Array.isArray(data.achievements)
        ? data.achievements.filter((a: string) => a?.trim())
        : typeof data.achievementsText === 'string'
          ? data.achievementsText.split('\n').map((a: string) => a.trim()).filter(Boolean)
          : [];

      const updateData = {
        name: data.name,
        position: data.position,
        photoURL,
        organization: data.organization || '',
        designation: data.designation || '',
        bio: data.bio || '',
        achievements,
        experience: data.experience || '',
        order: typeof data.order === 'number' ? data.order : parseInt(data.order) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        featured: data.featured || false,
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        website: data.website || '',
        joinedDate: data.joinedDate || '',
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating advisory board member:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteMember(id: string) {
    try {
      await this.deletePhoto(id);
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting advisory board member:', error);
      return { success: false, error: error.message };
    }
  },

  async toggleActive(id: string, isActive: boolean) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling active:', error);
      return { success: false, error: error.message };
    }
  },

  async getMemberStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      let total = 0;
      let active = 0;
      let inactive = 0;
      let featured = 0;

      snapshot.forEach((d) => {
        const data = d.data();
        total++;
        if (data.isActive) active++;
        else inactive++;
        if (data.featured) featured++;
      });

      return { total, active, inactive, featured };
    } catch (error) {
      console.error('Error getting advisory board stats:', error);
      return { total: 0, active: 0, inactive: 0, featured: 0 };
    }
  },
};
