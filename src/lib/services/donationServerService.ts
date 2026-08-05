import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { CCAvenuePaymentData } from '@/lib/payment/ccavenue';
import type { DonationData } from '@/lib/services/donationService';

export type ServerDonationStatus = DonationData['status'];

function getDonationsCollection() {
  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin is not configured');
  }
  return db.collection('donations');
}

export async function getDonationById(orderId: string): Promise<DonationData | null> {
  try {
    const snapshot = await getDonationsCollection().doc(orderId).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...snapshot.data() } as DonationData;
  } catch (error) {
    console.error('getDonationById failed:', error);
    return null;
  }
}

export async function updateDonationFromPayment(
  orderId: string,
  status: ServerDonationStatus,
  paymentDetails: CCAvenuePaymentData
): Promise<{ success: boolean; error?: string }> {
  try {
    const ref = getDonationsCollection().doc(orderId);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return { success: false, error: 'Donation not found' };
    }

    const existing = snapshot.data() as DonationData;
    if (existing.status === 'completed' && status === 'completed') {
      return { success: true };
    }

    await ref.update({
      status,
      transactionId: paymentDetails.tracking_id || existing.transactionId || null,
      paymentDetails,
      updatedAt: FieldValue.serverTimestamp(),
      completedAt:
        status === 'completed' ? FieldValue.serverTimestamp() : existing.completedAt || null,
    });

    return { success: true };
  } catch (error: any) {
    console.error('updateDonationFromPayment failed:', error);
    return { success: false, error: error.message || 'Failed to update donation' };
  }
}

export async function markDonationCancelled(
  orderId: string,
  reason = 'Payment cancelled by user'
): Promise<{ success: boolean; error?: string }> {
  try {
    const ref = getDonationsCollection().doc(orderId);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return { success: false, error: 'Donation not found' };
    }

    const existing = snapshot.data() as DonationData;
    if (existing.status === 'completed') {
      return { success: true };
    }

    await ref.update({
      status: 'cancelled',
      paymentDetails: {
        ...(existing.paymentDetails || {}),
        failure_message: reason,
        status_message: 'Cancelled',
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('markDonationCancelled failed:', error);
    return { success: false, error: error.message || 'Failed to cancel donation' };
  }
}

export function toPublicDonationView(donation: DonationData) {
  return {
    id: donation.id,
    amount: donation.amount,
    currency: donation.currency,
    status: donation.status,
    donorName: donation.donorDetails?.name || 'Donor',
    email: donation.donorDetails?.email || '',
    transactionId: donation.transactionId || donation.paymentDetails?.tracking_id || '',
    paymentMode: donation.paymentDetails?.payment_mode || 'Online',
    createdAt: donation.createdAt || null,
    completedAt: donation.completedAt || null,
    failureMessage:
      donation.paymentDetails?.failure_message ||
      donation.paymentDetails?.status_message ||
      '',
  };
}
