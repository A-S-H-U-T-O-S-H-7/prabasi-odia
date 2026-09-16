import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase/config';
import { validateUrgentHelpMedia } from '@/lib/urgentHelpMedia';

export const URGENT_HELP_CATEGORIES = ['Medical support', 'Blood donation', 'Travel / stranded', 'Shelter / essentials', 'Other urgent help'] as const;
export type UrgentHelpCategory = typeof URGENT_HELP_CATEGORIES[number];
export type UrgentHelpStatus = 'pending' | 'approved' | 'rejected' | 'resolved';

export interface UrgentHelpMedia { name: string; url: string; type: string; }
export interface UrgentHelpRequest {
  id: string; title: string; category: UrgentHelpCategory; location: string; message: string;
  contactName: string; email: string; phone: string; ownerId: string; ownerName: string; status: UrgentHelpStatus;
  rejectionReason?: string; media: UrgentHelpMedia[]; createdAt: string; updatedAt: string;
}

export type UrgentHelpOfferStatus = 'new' | 'contacted' | 'coordinated' | 'closed';
export interface UrgentHelpOffer {
  id: string; requestId: string; requestTitle: string; helperName: string; email: string; phone: string;
  address: string; message?: string; userId?: string; status: UrgentHelpOfferStatus; createdAt: string; updatedAt: string;
}

const asDate = (value: unknown) => value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function'
  ? (value as { toDate: () => Date }).toDate().toISOString() : typeof value === 'string' ? value : new Date().toISOString();

const mapRequest = (id: string, data: Record<string, unknown>): UrgentHelpRequest => ({
  id, title: String(data.title || ''), category: (data.category || 'Other urgent help') as UrgentHelpCategory,
  location: String(data.location || ''), message: String(data.message || ''), contactName: String(data.contactName || ''),
  phone: String(data.phone || ''), email: String(data.email || ''), ownerId: String(data.ownerId || ''), ownerName: String(data.ownerName || ''),
  status: (data.status || 'pending') as UrgentHelpStatus, rejectionReason: data.rejectionReason ? String(data.rejectionReason) : undefined,
  media: Array.isArray(data.media) ? data.media as UrgentHelpMedia[] : [], createdAt: asDate(data.createdAt), updatedAt: asDate(data.updatedAt),
});

const mapOffer = (id: string, data: Record<string, unknown>): UrgentHelpOffer => ({
  id, requestId: String(data.requestId || ''), requestTitle: String(data.requestTitle || ''),
  helperName: String(data.helperName || ''), email: String(data.email || ''), phone: String(data.phone || ''),
  address: String(data.address || ''), message: data.message ? String(data.message) : undefined,
  userId: data.userId ? String(data.userId) : undefined,
  status: (data.status || 'new') as UrgentHelpOfferStatus, createdAt: asDate(data.createdAt), updatedAt: asDate(data.updatedAt),
});

async function readRequests(status?: UrgentHelpStatus) {
  const requests = collection(db, 'urgentHelpRequests');
  try {
    const snapshot = await getDocs(query(requests, ...(status ? [where('status', '==', status), orderBy('createdAt', 'desc')] : [orderBy('createdAt', 'desc')])));
    return snapshot.docs.map(item => mapRequest(item.id, item.data()));
  } catch {
    const snapshot = await getDocs(query(requests));
    return snapshot.docs.map(item => mapRequest(item.id, item.data())).filter(item => !status || item.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const urgentHelpService = {
  getApprovedRequests: () => readRequests('approved'),
  getAllRequests: () => readRequests(),
  async createOffer(data: Omit<UrgentHelpOffer, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const reference = await addDoc(collection(db, 'urgentHelpOffers'), { ...data, status: 'new', createdAt: now, updatedAt: now });
    return reference.id;
  },
  async getOffers(requestId?: string) {
    const offers = collection(db, 'urgentHelpOffers');
    try {
      const constraints = requestId ? [where('requestId', '==', requestId), orderBy('createdAt', 'desc')] : [orderBy('createdAt', 'desc')];
      const snapshot = await getDocs(query(offers, ...constraints));
      return snapshot.docs.map(item => mapOffer(item.id, item.data()));
    } catch {
      const snapshot = await getDocs(query(offers));
      return snapshot.docs.map(item => mapOffer(item.id, item.data())).filter(item => !requestId || item.requestId === requestId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  },
  updateOfferStatus: (id: string, status: UrgentHelpOfferStatus) => updateDoc(doc(db, 'urgentHelpOffers', id), { status, updatedAt: new Date().toISOString() }),
  async createRequest(data: Omit<UrgentHelpRequest, 'id' | 'status' | 'rejectionReason' | 'media' | 'createdAt' | 'updatedAt'>, files: File[]) {
    const signedInUser = auth.currentUser;
    if (!signedInUser || signedInUser.uid !== data.ownerId) {
      throw new Error('Please sign in before submitting an urgent-help request.');
    }
    const member = await getDoc(doc(db, 'users', signedInUser.uid));
    if (!member.exists() || member.data().isVerified !== true) {
      throw new Error('Only verified members can submit an urgent-help request.');
    }
    if (files.length > 3) throw new Error('You can upload up to 3 photos or videos.');
    const mediaTypes = files.map(validateUrgentHelpMedia);
    const reference = await addDoc(collection(db, 'urgentHelpRequests'), { ...data, status: 'pending', media: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    const media = await Promise.all(files.map(async (file, index) => {
      const fileRef = ref(storage, `urgent-help/${reference.id}/${Date.now()}-${index}-${file.name}`);
      const type = mediaTypes[index];
      await uploadBytes(fileRef, file, { contentType: type });
      return { name: file.name, url: await getDownloadURL(fileRef), type };
    }));
    await updateDoc(reference, { media, updatedAt: new Date().toISOString() });
    return { id: reference.id, media };
  },
  updateStatus: (id: string, status: UrgentHelpStatus, rejectionReason = '') => updateDoc(doc(db, 'urgentHelpRequests', id), { status, rejectionReason, updatedAt: new Date().toISOString() }),
  updateRequest: (id: string, data: Pick<UrgentHelpRequest, 'title' | 'category' | 'location' | 'message' | 'contactName' | 'email' | 'phone'>) => updateDoc(doc(db, 'urgentHelpRequests', id), { ...data, updatedAt: new Date().toISOString() }),
  deleteRequest: (id: string) => deleteDoc(doc(db, 'urgentHelpRequests', id)),
};
