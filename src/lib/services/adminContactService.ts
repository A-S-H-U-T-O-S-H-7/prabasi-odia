import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
} from 'firebase/firestore';

const COLLECTION = 'contactRequests';

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  helpType: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminContactService = {
  // Get all contact requests
  async getAllRequests() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const requests: ContactRequest[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          helpType: data.helpType || 'general',
          subject: data.subject || '',
          message: data.message || '',
          isRead: data.isRead || false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, requests };
    } catch (error: any) {
      console.error('Error getting contact requests:', error);
      return { success: false, error: error.message, requests: [] };
    }
  },

  // Get unread requests
  async getUnreadRequests() {
    try {
      const q = query(
        collection(db, COLLECTION),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const requests: ContactRequest[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          helpType: data.helpType || 'general',
          subject: data.subject || '',
          message: data.message || '',
          isRead: data.isRead || false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, requests };
    } catch (error: any) {
      console.error('Error getting unread requests:', error);
      return { success: false, error: error.message, requests: [] };
    }
  },

  // Get request by ID
  async getRequestById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Request not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        request: {
          id: docSnap.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          helpType: data.helpType || 'general',
          subject: data.subject || '',
          message: data.message || '',
          isRead: data.isRead || false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as ContactRequest
      };
    } catch (error: any) {
      console.error('Error getting contact request:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark as read
  async markAsRead(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        isRead: true,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error marking as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark as unread
  async markAsUnread(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        isRead: false,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error marking as unread:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete request
  async deleteRequest(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting contact request:', error);
      return { success: false, error: error.message };
    }
  },

  // Get contact stats
  async getContactStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let unread = 0;
      let read = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.isRead) read++;
        else unread++;
      });
      
      return { total, unread, read };
    } catch (error) {
      console.error('Error getting contact stats:', error);
      return { total: 0, unread: 0, read: 0 };
    }
  },
};