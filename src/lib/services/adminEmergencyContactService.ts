import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';

const COLLECTION = 'emergencyContacts';

export type EmergencyCategory =
  | 'ambulance'
  | 'police'
  | 'fire'
  | 'hospital'
  | 'helpline'
  | 'other';

export interface EmergencyContact {
  id: string;
  title: string;
  phone: string;
  alternatePhone?: string;
  category: EmergencyCategory;
  description?: string;
  address?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapContact(id: string, data: Record<string, any>): EmergencyContact {
  return {
    id,
    title: data.title || '',
    phone: data.phone || '',
    alternatePhone: data.alternatePhone || '',
    category: data.category || 'other',
    description: data.description || '',
    address: data.address || '',
    order: typeof data.order === 'number' ? data.order : 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export const adminEmergencyContactService = {
  async getAllContacts() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const contacts: EmergencyContact[] = [];
      snapshot.forEach((d) => contacts.push(mapContact(d.id, d.data())));
      return { success: true, contacts };
    } catch (error: any) {
      console.error('Error getting emergency contacts:', error);
      return { success: false, error: error.message, contacts: [] as EmergencyContact[] };
    }
  },

  async getActiveContacts() {
    try {
      // Filter + sort client-side to avoid composite index requirement
      const q = query(collection(db, COLLECTION), where('isActive', '==', true));
      const snapshot = await getDocs(q);
      const contacts: EmergencyContact[] = [];
      snapshot.forEach((d) => contacts.push(mapContact(d.id, d.data())));
      contacts.sort((a, b) => a.order - b.order);
      return { success: true, contacts };
    } catch (error: any) {
      console.error('Error getting active emergency contacts:', error);
      return { success: false, error: error.message, contacts: [] as EmergencyContact[] };
    }
  },

  async createContact(data: Partial<EmergencyContact>) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      const contactData = {
        title: data.title || '',
        phone: data.phone || '',
        alternatePhone: data.alternatePhone || '',
        category: data.category || 'other',
        description: data.description || '',
        address: data.address || '',
        order: typeof data.order === 'number' ? data.order : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(docRef, contactData);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating emergency contact:', error);
      return { success: false, error: error.message };
    }
  },

  async updateContact(id: string, data: Partial<EmergencyContact>) {
    try {
      await updateDoc(doc(db, COLLECTION, id), {
        title: data.title || '',
        phone: data.phone || '',
        alternatePhone: data.alternatePhone || '',
        category: data.category || 'other',
        description: data.description || '',
        address: data.address || '',
        order: typeof data.order === 'number' ? data.order : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating emergency contact:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteContact(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting emergency contact:', error);
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
      console.error('Error toggling emergency contact:', error);
      return { success: false, error: error.message };
    }
  },

  async getContactStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      let total = 0;
      let active = 0;
      let inactive = 0;
      snapshot.forEach((d) => {
        total++;
        if (d.data().isActive) active++;
        else inactive++;
      });
      return { total, active, inactive };
    } catch (error) {
      console.error('Error getting emergency contact stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  },
};
