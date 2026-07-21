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

export interface PublicEvent {
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
  createdAt: string;
}

export const publicEventService = {
  // Get all events (filtered by status)
  async getEvents(status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'all') {
    try {
      let q;
      
      if (status && status !== 'all') {
        q = query(
          collection(db, 'events'),
          where('status', '==', status),
          orderBy('date', 'asc')
        );
      } else {
        q = query(
          collection(db, 'events'),
          orderBy('date', 'asc')
        );
      }
      
      const snapshot = await getDocs(q);
      
      const events: PublicEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Only show non-cancelled events for public
        if (data.status === 'cancelled' && status !== 'cancelled') return;
        
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
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      
      return { success: true, events };
    } catch (error: any) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message, events: [] };
    }
  },

  // Get upcoming events (default view)
  async getUpcomingEvents() {
    try {
      const q = query(
        collection(db, 'events'),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const events: PublicEvent[] = [];
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
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      
      return { success: true, events };
    } catch (error: any) {
      console.error('Error getting upcoming events:', error);
      return { success: false, error: error.message, events: [] };
    }
  },

  // Get event by ID
  async getEventById(id: string) {
    try {
      const docRef = doc(db, 'events', id);
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
          createdAt: data.createdAt || new Date().toISOString(),
        } as PublicEvent
      };
    } catch (error: any) {
      console.error('Error getting event:', error);
      return { success: false, error: error.message };
    }
  },

  // RSVP to event
  async rsvpEvent(eventId: string, userId: string) {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const data = docSnap.data();
      const attendees = data.attendees || [];
      
      if (attendees.includes(userId)) {
        return { success: false, error: 'Already RSVPed' };
      }
      
      await updateDoc(docRef, {
        attendees: arrayUnion(userId),
        attendeeCount: attendees.length + 1,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error RSVPing to event:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancel RSVP
  async cancelRsvp(eventId: string, userId: string) {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found' };
      }
      
      const data = docSnap.data();
      const attendees = data.attendees || [];
      
      if (!attendees.includes(userId)) {
        return { success: false, error: 'Not RSVPed' };
      }
      
      await updateDoc(docRef, {
        attendees: arrayRemove(userId),
        attendeeCount: attendees.length - 1,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling RSVP:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has RSVPed
  async hasUserRsvped(eventId: string, userId: string) {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Event not found', hasRsvped: false };
      }
      
      const data = docSnap.data();
      const attendees = data.attendees || [];
      
      return { success: true, hasRsvped: attendees.includes(userId) };
    } catch (error: any) {
      console.error('Error checking RSVP:', error);
      return { success: false, error: error.message, hasRsvped: false };
    }
  },

  // Get events by community
  async getEventsByCommunity(communityId: string) {
    try {
      const q = query(
        collection(db, 'events'),
        where('communityId', '==', communityId),
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const events: PublicEvent[] = [];
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
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      
      return { success: true, events };
    } catch (error: any) {
      console.error('Error getting events by community:', error);
      return { success: false, error: error.message, events: [] };
    }
  },
};