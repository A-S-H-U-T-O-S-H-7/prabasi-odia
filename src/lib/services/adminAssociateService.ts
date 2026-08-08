// src/lib/services/adminAssociateService.ts
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

const COLLECTION = 'associates';

export interface Associate {
  id: string;
  name: string;
  logo: string;
  website?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const adminAssociateService = {
  // Upload associate logo
  async uploadLogo(file: File, associateId: string): Promise<string> {
    const path = `associates/${associateId}/logo`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  // Delete associate logo
  async deleteLogo(associateId: string) {
    try {
      const storageRef = ref(storage, `associates/${associateId}/logo`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting logo:', error);
      return { success: false };
    }
  },

  // Get all associates
  async getAllAssociates() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      
      const associates: Associate[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        associates.push({
          id: doc.id,
          name: data.name || '',
          logo: data.logo || '',
          website: data.website || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          displayOrder: data.displayOrder || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, associates };
    } catch (error: any) {
      console.error('Error getting associates:', error);
      return { success: false, error: error.message, associates: [] };
    }
  },

  // Get active associates (for homepage)
  async getActiveAssociates() {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const associates: Associate[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        associates.push({
          id: doc.id,
          name: data.name || '',
          logo: data.logo || '',
          website: data.website || '',
          isActive: true,
          displayOrder: data.displayOrder || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, associates };
    } catch (error: any) {
      console.error('Error getting active associates:', error);
      return { success: false, error: error.message, associates: [] };
    }
  },

  // Get associate by ID
  async getAssociateById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Associate not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        associate: {
          id: docSnap.id,
          name: data.name || '',
          logo: data.logo || '',
          website: data.website || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          displayOrder: data.displayOrder || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Associate
      };
    } catch (error: any) {
      console.error('Error getting associate:', error);
      return { success: false, error: error.message };
    }
  },

  // Create associate with logo upload
  async createAssociate(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      let logoUrl = '';
      if (data.logoFile && data.logoFile instanceof File) {
        logoUrl = await this.uploadLogo(data.logoFile, docRef.id);
      } else if (data.logo && typeof data.logo === 'string') {
        logoUrl = data.logo;
      }
      
      const associateData = {
        name: data.name,
        logo: logoUrl,
        website: data.website || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, associateData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating associate:', error);
      return { success: false, error: error.message };
    }
  },

  // Update associate with logo upload
  async updateAssociate(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      let logoUrl = data.logo || '';
      if (data.logoFile && data.logoFile instanceof File) {
        await this.deleteLogo(id);
        logoUrl = await this.uploadLogo(data.logoFile, id);
      } else if (data.logo && typeof data.logo === 'string') {
        logoUrl = data.logo;
      }
      
      const updateData: any = {
        name: data.name,
        logo: logoUrl,
        website: data.website || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || 0,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating associate:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete associate (with logo)
  async deleteAssociate(id: string) {
    try {
      await this.deleteLogo(id);
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting associate:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle active status
  async toggleActive(id: string, isActive: boolean) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        isActive: isActive,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling active:', error);
      return { success: false, error: error.message };
    }
  },

  // Get associate stats
  async getAssociateStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let active = 0;
      let inactive = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.isActive) active++;
        else inactive++;
      });
      
      return { total, active, inactive };
    } catch (error) {
      console.error('Error getting associate stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  },
};