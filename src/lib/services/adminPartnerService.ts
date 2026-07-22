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

const COLLECTION = 'partners';

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const adminPartnerService = {
  // Upload partner logo
  async uploadLogo(file: File, partnerId: string): Promise<string> {
    const path = `partners/${partnerId}/logo`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  },

  // Delete partner logo
  async deleteLogo(partnerId: string) {
    try {
      const storageRef = ref(storage, `partners/${partnerId}/logo`);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting logo:', error);
      return { success: false };
    }
  },

  // Get all partners
  async getAllPartners() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      
      const partners: Partner[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        partners.push({
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
      
      return { success: true, partners };
    } catch (error: any) {
      console.error('Error getting partners:', error);
      return { success: false, error: error.message, partners: [] };
    }
  },

  // Get active partners (for homepage)
  async getActivePartners() {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('isActive', '==', true),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const partners: Partner[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        partners.push({
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
      
      return { success: true, partners };
    } catch (error: any) {
      console.error('Error getting active partners:', error);
      return { success: false, error: error.message, partners: [] };
    }
  },

  // Get partner by ID
  async getPartnerById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Partner not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        partner: {
          id: docSnap.id,
          name: data.name || '',
          logo: data.logo || '',
          website: data.website || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          displayOrder: data.displayOrder || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Partner
      };
    } catch (error: any) {
      console.error('Error getting partner:', error);
      return { success: false, error: error.message };
    }
  },

  // Create partner
  async createPartner(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      const partnerData = {
        name: data.name,
        logo: data.logo || '',
        website: data.website || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, partnerData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating partner:', error);
      return { success: false, error: error.message };
    }
  },

  // Update partner
  async updatePartner(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      const updateData: any = {
        name: data.name,
        logo: data.logo || '',
        website: data.website || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        displayOrder: data.displayOrder || 0,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating partner:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete partner (with logo)
  async deletePartner(id: string) {
    try {
      // Delete logo from storage
      await this.deleteLogo(id);
      // Delete document from Firestore
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting partner:', error);
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

  // Get partner stats
  async getPartnerStats() {
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
      console.error('Error getting partner stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  },
};