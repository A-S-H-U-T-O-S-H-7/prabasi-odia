import { db } from '@/lib/firebase/config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';

export interface DonationData {
  id: string;
  donationId: string;
  userId?: string | null;
  donorDetails: {
    name: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    donorType: 'indian' | 'foreign';
  };
  amount: number;
  currency: string;
  status: 'pending_payment' | 'completed' | 'failed' | 'cancelled';
  paymentGateway: string;
  purpose: string;
  donorType: 'indian' | 'foreign';
  taxExemption: {
    eligible: boolean;
    section: string;
    certificateRequired: boolean;
  };
  transactionId?: string;
  paymentDetails?: any;
  createdAt: any;
  updatedAt: any;
}

export interface DonationResponse {
  success: boolean;
  data?: DonationData;
  error?: string;
}

export const donationService = {
  async createDonation(data: Omit<DonationData, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; donationId?: string; error?: string }> {
    try {
      const donationRef = doc(db, 'donations', data.id);
      const now = new Date().toISOString();
      
      await setDoc(donationRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      
      return { success: true, donationId: data.id };
    } catch (error: any) {
      console.error('Error creating donation:', error);
      return { success: false, error: error.message };
    }
  },

  async updateDonationStatus(donationId: string, status: DonationData['status'], paymentDetails?: any): Promise<{ success: boolean; error?: string }> {
    try {
      const donationRef = doc(db, 'donations', donationId);
      const updates: any = {
        status,
        updatedAt: new Date().toISOString(),
      };
      
      if (paymentDetails) {
        updates.paymentDetails = paymentDetails;
        if (paymentDetails.transaction_id) {
          updates.transactionId = paymentDetails.transaction_id;
        }
      }
      
      await updateDoc(donationRef, updates);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating donation:', error);
      return { success: false, error: error.message };
    }
  },

  async getDonation(donationId: string): Promise<DonationResponse> {
    try {
      const donationRef = doc(db, 'donations', donationId);
      const docSnap = await getDoc(donationRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as DonationData;
        return { success: true, data };
      }
      return { success: false, error: 'Donation not found' };
    } catch (error: any) {
      console.error('Error getting donation:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserDonations(userId: string): Promise<{ success: boolean; donations?: DonationData[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'donations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const donations: DonationData[] = [];
      snapshot.forEach(doc => {
        donations.push({ id: doc.id, ...doc.data() } as DonationData);
      });
      
      return { success: true, donations };
    } catch (error: any) {
      console.error('Error getting user donations:', error);
      return { success: false, error: error.message, donations: [] };
    }
  },

  async getAllDonations(limitCount: number = 50): Promise<{ success: boolean; donations?: DonationData[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'donations'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const donations: DonationData[] = [];
      snapshot.forEach(doc => {
        donations.push({ id: doc.id, ...doc.data() } as DonationData);
      });
      
      return { success: true, donations };
    } catch (error: any) {
      console.error('Error getting all donations:', error);
      return { success: false, error: error.message, donations: [] };
    }
  }
};