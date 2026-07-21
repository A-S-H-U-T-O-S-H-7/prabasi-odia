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
} from 'firebase/firestore';

const COLLECTION = 'notices';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  communityId: string;
  communityName: string;
  isPublished: boolean;
  publishedAt?: string | null;
  expiresAt?: string | null;
  isExpired?: boolean;
  createdBy: string;
  createdByAdminName: string;
  createdAt: string;
  updatedAt: string;
}

export const adminNoticeService = {
  // ============ GET ALL NOTICES ============
  async getAllNotices() {
    try {
      const now = new Date().toISOString();
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const notices: Notice[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const expiresAt = data.expiresAt || null;
        const isExpired = expiresAt ? expiresAt < now : false;
        
        notices.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          priority: data.priority || 'medium',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          isPublished: data.isPublished || false,
          publishedAt: data.publishedAt || null,
          expiresAt: expiresAt,
          isExpired: isExpired,
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, notices };
    } catch (error: any) {
      console.error('Error getting notices:', error);
      return { success: false, error: error.message, notices: [] };
    }
  },

  // ============ GET ACTIVE NOTICES (For Public View) ============
  async getActiveNotices(communityId?: string) {
    try {
      const now = new Date().toISOString();
      let q = query(
        collection(db, COLLECTION),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );

      // Optional: Filter by community
      if (communityId) {
        q = query(
          collection(db, COLLECTION),
          where('isPublished', '==', true),
          where('communityId', '==', communityId),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      
      const notices: Notice[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const expiresAt = data.expiresAt || null;
        const isExpired = expiresAt ? expiresAt < now : false;
        
        // Skip expired notices
        if (isExpired) return;
        
        notices.push({
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          priority: data.priority || 'medium',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          isPublished: true,
          publishedAt: data.publishedAt || null,
          expiresAt: expiresAt,
          isExpired: false,
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, notices };
    } catch (error: any) {
      console.error('Error getting active notices:', error);
      return { success: false, error: error.message, notices: [] };
    }
  },

  // ============ GET NOTICE BY ID ============
  async getNoticeById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Notice not found' };
      }
      
      const data = docSnap.data();
      const now = new Date().toISOString();
      const expiresAt = data.expiresAt || null;
      const isExpired = expiresAt ? expiresAt < now : false;
      
      return {
        success: true,
        notice: {
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          priority: data.priority || 'medium',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          isPublished: data.isPublished || false,
          publishedAt: data.publishedAt || null,
          expiresAt: expiresAt,
          isExpired: isExpired,
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Notice
      };
    } catch (error: any) {
      console.error('Error getting notice:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ CREATE NOTICE ============
  async createNotice(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      const noticeData = {
        title: data.title,
        content: data.content,
        priority: data.priority || 'medium',
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        isPublished: data.isPublished || false,
        publishedAt: data.isPublished ? now : null,
        expiresAt: data.expiresAt || null,
        createdBy: data.createdBy || '',
        createdByAdminName: data.createdByAdminName || '',
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, noticeData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating notice:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ UPDATE NOTICE ============
  async updateNotice(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      const oldData = docSnap.exists() ? docSnap.data() : {};
      
      const updateData: any = {
        title: data.title,
        content: data.content,
        priority: data.priority || 'medium',
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        expiresAt: data.expiresAt || null,
        updatedAt: new Date().toISOString(),
      };
      
      // Handle publish status change
      if (data.isPublished && !oldData.isPublished) {
        updateData.isPublished = true;
        updateData.publishedAt = new Date().toISOString();
      } else if (!data.isPublished) {
        updateData.isPublished = false;
      } else {
        updateData.isPublished = oldData.isPublished || false;
      }
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating notice:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ DELETE NOTICE ============
  async deleteNotice(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notice:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ TOGGLE PUBLISH STATUS ============
  async togglePublish(id: string, isPublished: boolean) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const updateData: any = {
        isPublished: isPublished,
        updatedAt: new Date().toISOString(),
      };
      
      if (isPublished) {
        updateData.publishedAt = new Date().toISOString();
      }
      
      await updateDoc(docRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ AUTO-HIDE EXPIRED NOTICES ============
  async checkAndHideExpiredNotices() {
    try {
      const now = new Date().toISOString();
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      const expiredNotices: string[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.expiresAt && data.expiresAt < now && data.isPublished) {
          expiredNotices.push(doc.id);
        }
      });
      
      // Update each expired notice
      for (const id of expiredNotices) {
        await updateDoc(doc(db, COLLECTION, id), {
          isPublished: false,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return { success: true, expiredCount: expiredNotices.length };
    } catch (error: any) {
      console.error('Error hiding expired notices:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ GET NOTICE STATS ============
  async getNoticeStats() {
    try {
      const now = new Date().toISOString();
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let published = 0;
      let unpublished = 0;
      let highPriority = 0;
      let mediumPriority = 0;
      let lowPriority = 0;
      let expired = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        
        const expiresAt = data.expiresAt || null;
        const isExpired = expiresAt ? expiresAt < now : false;
        
        if (data.isPublished && !isExpired) published++;
        else if (data.isPublished && isExpired) expired++;
        else unpublished++;
        
        if (data.priority === 'high') highPriority++;
        if (data.priority === 'medium') mediumPriority++;
        if (data.priority === 'low') lowPriority++;
      });
      
      return { total, published, unpublished, highPriority, mediumPriority, lowPriority, expired };
    } catch (error) {
      console.error('Error getting notice stats:', error);
      return { total: 0, published: 0, unpublished: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, expired: 0 };
    }
  },

  // ============ SEARCH NOTICES ============
  async searchNotices(searchTerm: string) {
    try {
      const now = new Date().toISOString();
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      const results: Notice[] = [];
      const term = searchTerm.toLowerCase();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.title?.toLowerCase().includes(term) ||
          data.content?.toLowerCase().includes(term) ||
          data.communityName?.toLowerCase().includes(term)
        ) {
          const expiresAt = data.expiresAt || null;
          const isExpired = expiresAt ? expiresAt < now : false;
          
          results.push({
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            priority: data.priority || 'medium',
            communityId: data.communityId || '',
            communityName: data.communityName || '',
            isPublished: data.isPublished || false,
            publishedAt: data.publishedAt || null,
            expiresAt: expiresAt,
            isExpired: isExpired,
            createdBy: data.createdBy || '',
            createdByAdminName: data.createdByAdminName || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });
      
      return { success: true, notices: results };
    } catch (error: any) {
      console.error('Error searching notices:', error);
      return { success: false, error: error.message, notices: [] };
    }
  },
};