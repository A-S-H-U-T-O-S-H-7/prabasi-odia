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

const COLLECTION = 'events';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  communityId: string;
  communityName: string;
  coverImage?: string;
  attendees: string[];
  attendeeCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdByAdminName: string;
  createdAt: string;
  updatedAt: string;
}

export const adminEventService = {
  // Get all events
  async getAllEvents() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      const events: Event[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          city: data.city || '',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          coverImage: data.coverImage || '',
          attendees: data.attendees || [],
          attendeeCount: data.attendeeCount || 0,
          status: data.status || 'upcoming',
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      
      return { success: true, events };
    } catch (error: any) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message, events: [] };
    }
  },

  // Get event by ID
  async getEventById(id: string) {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const data = docSnap.data();
      return {
        success: true,
        event: {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          city: data.city || '',
          communityId: data.communityId || '',
          communityName: data.communityName || '',
          coverImage: data.coverImage || '',
          attendees: data.attendees || [],
          attendeeCount: data.attendeeCount || 0,
          status: data.status || 'upcoming',
          createdBy: data.createdBy || '',
          createdByAdminName: data.createdByAdminName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as Event
      };
    } catch (error: any) {
      console.error('Error getting event:', error);
      return { success: false, error: error.message };
    }
  },

  // Create event
  async createEvent(data: any) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      const now = new Date().toISOString();
      
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        city: data.city,
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        coverImage: data.coverImage || '',
        attendees: [],
        attendeeCount: 0,
        status: data.status || 'upcoming',
        createdBy: data.createdBy || '',
        createdByAdminName: data.createdByAdminName || '',
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, eventData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  },

  // Update event
  async updateEvent(id: string, data: any) {
    try {
      const docRef = doc(db, COLLECTION, id);
      
      const updateData: any = {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        city: data.city,
        communityId: data.communityId || '',
        communityName: data.communityName || '',
        coverImage: data.coverImage || '',
        status: data.status || 'upcoming',
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, updateData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete event
  async deleteEvent(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  },

  // Get event stats
  async getEventStats() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      let total = 0;
      let upcoming = 0;
      let ongoing = 0;
      let completed = 0;
      let cancelled = 0;
      let totalAttendees = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'upcoming') upcoming++;
        if (data.status === 'ongoing') ongoing++;
        if (data.status === 'completed') completed++;
        if (data.status === 'cancelled') cancelled++;
        totalAttendees += data.attendeeCount || 0;
      });
      
      return { total, upcoming, ongoing, completed, cancelled, totalAttendees };
    } catch (error) {
      console.error('Error getting event stats:', error);
      return { total: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0, totalAttendees: 0 };
    }
  },

  // Search events
  async searchEvents(searchTerm: string) {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION));
      
      const results: Event[] = [];
      const term = searchTerm.toLowerCase();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (
          data.title?.toLowerCase().includes(term) ||
          data.city?.toLowerCase().includes(term) ||
          data.location?.toLowerCase().includes(term) ||
          data.communityName?.toLowerCase().includes(term)
        ) {
          results.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            date: data.date || '',
            time: data.time || '',
            location: data.location || '',
            city: data.city || '',
            communityId: data.communityId || '',
            communityName: data.communityName || '',
            coverImage: data.coverImage || '',
            attendees: data.attendees || [],
            attendeeCount: data.attendeeCount || 0,
            status: data.status || 'upcoming',
            createdBy: data.createdBy || '',
            createdByAdminName: data.createdByAdminName || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });
      
      return { success: true, events: results };
    } catch (error: any) {
      console.error('Error searching events:', error);
      return { success: false, error: error.message, events: [] };
    }
  },

  // Get event attendees
  async getEventAttendees(eventId: string) {
    try {
      const result = await this.getEventById(eventId);
      if (!result.success || !result.event) {
        return { success: false, error: 'Event not found', attendees: [] };
      }
      
      const attendeeIds = result.event.attendees || [];
      
      if (attendeeIds.length === 0) {
        return { success: true, attendees: [] };
      }
      
      const usersRef = collection(db, 'users');
      const attendeePromises = attendeeIds.map(async (uid) => {
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
      
      const attendees = (await Promise.all(attendeePromises)).filter(a => a !== null);
      
      return { success: true, attendees };
    } catch (error: any) {
      console.error('Error getting event attendees:', error);
      return { success: false, error: error.message, attendees: [] };
    }
  },
};