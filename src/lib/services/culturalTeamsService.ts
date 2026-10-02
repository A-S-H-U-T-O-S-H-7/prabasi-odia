import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { z } from 'zod';
import { auth, db, storage } from '@/lib/firebase/config';
import { requireApprovedMember } from '@/lib/memberAccess';
import { CULTURAL_ART_FORMS, INDIAN_STATES, TRAVEL_SCOPES, type CulturalTeam, type CulturalTeamContact, type CulturalTeamDraft, type CulturalTeamEnquiry, type CulturalTeamEnquiryDraft, type CulturalTeamImage, type CulturalTeamStatus, type EnquiryStatus } from '@/lib/culturalTeams/types';

const teamSchema = z.object({
  name: z.string().trim().min(3).max(120), artForm: z.enum(CULTURAL_ART_FORMS),
  description: z.string().trim().min(40).max(4000), baseCity: z.string().trim().min(2).max(100),
  baseState: z.string().trim().min(2).max(100), baseCountry: z.string().trim().min(2).max(100),
  memberCount: z.coerce.number().int().min(1).max(500), languages: z.string().trim().min(2).max(160),
  travelScopes: z.array(z.enum(TRAVEL_SCOPES)).min(1), availableStates: z.array(z.enum(INDIAN_STATES)).max(36),
}).refine(data => !data.travelScopes.includes('states') || data.availableStates.length > 0, { message: 'Choose at least one state where the team can perform.' });
const contactSchema = z.object({ contactName: z.string().trim().min(2).max(100), email: z.email().max(200), phone: z.string().trim().min(7).max(25) });
const enquirySchema = z.object({
  organiserName: z.string().trim().min(2).max(100), email: z.email().max(200), phone: z.string().trim().min(7).max(25),
  eventType: z.string().trim().min(2).max(120), eventDate: z.string().trim().max(20),
  eventLocation: z.string().trim().min(3).max(180), message: z.string().trim().min(20).max(2000),
});
const text = (value: unknown) => typeof value === 'string' ? value : '';
const mapTeam = (id: string, data: Record<string, unknown>): CulturalTeam => ({
  id, ownerId: text(data.ownerId), name: text(data.name), artForm: text(data.artForm), description: text(data.description),
  baseCity: text(data.baseCity), baseState: text(data.baseState), baseCountry: text(data.baseCountry),
  memberCount: Number(data.memberCount || 0), languages: text(data.languages),
  travelScopes: Array.isArray(data.travelScopes) ? data.travelScopes as CulturalTeam['travelScopes'] : [],
  availableStates: Array.isArray(data.availableStates) ? data.availableStates as string[] : [],
  images: Array.isArray(data.images) ? data.images as CulturalTeamImage[] : [],
  status: (data.status || 'pending') as CulturalTeamStatus, rejectionReason: text(data.rejectionReason),
  createdAt: text(data.createdAt), updatedAt: text(data.updatedAt),
});
const mapEnquiry = (id: string, data: Record<string, unknown>): CulturalTeamEnquiry => ({
  id, teamId: text(data.teamId), teamName: text(data.teamName), organiserName: text(data.organiserName),
  email: text(data.email), phone: text(data.phone), eventType: text(data.eventType), eventDate: text(data.eventDate),
  eventLocation: text(data.eventLocation), message: text(data.message), status: (data.status || 'new') as EnquiryStatus,
  adminNotes: text(data.adminNotes), createdAt: text(data.createdAt), updatedAt: text(data.updatedAt),
});
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

function requireUser() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in to register a cultural team.');
  return uid;
}
async function requireCulturalAdmin() {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Please sign in as an admin.');
  const direct = await getDoc(doc(db, 'admins', user.uid));
  const admin = direct.exists() ? direct.data() : (await getDocs(query(collection(db, 'admins'), where('email', '==', user.email.toLowerCase()), limit(1)))).docs[0]?.data();
  if (!admin || admin.status !== 'active' || String(admin.email || '').toLowerCase() !== user.email.toLowerCase()
    || (admin.role !== 'super_admin' && !admin.permissions?.includes('cultural_teams'))) {
    throw new Error('You do not have permission to manage cultural teams.');
  }
}

export const culturalTeamsService = {
  async getApproved() {
    const snapshot = await getDocs(query(collection(db, 'culturalTeams'), where('status', '==', 'approved')));
    return snapshot.docs.map(item => mapTeam(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getMine() {
    const uid = requireUser();
    const snapshot = await getDocs(query(collection(db, 'culturalTeams'), where('ownerId', '==', uid)));
    return snapshot.docs.map(item => mapTeam(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async register(data: CulturalTeamDraft, contact: Omit<CulturalTeamContact, 'ownerId'>, files: File[], onProgress?: (done: number, total: number) => void) {
    const uid = await requireApprovedMember('register a cultural team');
    const team = teamSchema.safeParse(data);
    const privateContact = contactSchema.safeParse(contact);
    if (!team.success) throw new Error(team.error.issues[0]?.message || 'Check the team details.');
    if (!privateContact.success) throw new Error('Check the team contact details.');
    if (!files.length || files.length > 10) throw new Error('Add 1 to 10 team images.');
    if (files.some(file => !imageTypes.includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0)) {
      throw new Error('Each image must be JPG, PNG or WebP and under 5 MB.');
    }
    const reference = doc(collection(db, 'culturalTeams'));
    const images: CulturalTeamImage[] = [];
    const uploadedPaths: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const path = `cultural-teams/${uid}/${reference.id}/${index}-${crypto.randomUUID()}`;
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file, { contentType: file.type });
        uploadedPaths.push(path);
        images.push({ url: await getDownloadURL(fileRef), path });
        onProgress?.(index + 1, files.length);
      }
      const now = new Date().toISOString();
      const batch = writeBatch(db);
      batch.set(reference, { ...team.data, availableStates: team.data.travelScopes.includes('states') ? team.data.availableStates : [], ownerId: uid, images, status: 'pending', rejectionReason: '', createdAt: now, updatedAt: now });
      batch.set(doc(db, 'culturalTeamContacts', reference.id), { ...privateContact.data, ownerId: uid });
      await batch.commit();
      return reference.id;
    } catch (cause) {
      await Promise.allSettled(uploadedPaths.map(path => deleteObject(ref(storage, path))));
      throw cause;
    }
  },
  async sendEnquiry(teamId: string, data: CulturalTeamEnquiryDraft) {
    await requireApprovedMember('contact a cultural team');
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the event and contact details.');
    const snapshot = await getDoc(doc(db, 'culturalTeams', teamId));
    const team = snapshot.data();
    if (!team || team.status !== 'approved') throw new Error('This team is not accepting enquiries right now.');
    const now = new Date().toISOString();
    await addDoc(collection(db, 'culturalTeamEnquiries'), { ...parsed.data, teamId, teamName: team.name, status: 'new', adminNotes: '', createdAt: now, updatedAt: now });
  },
  async getAllTeams() {
    await requireCulturalAdmin();
    const snapshot = await getDocs(collection(db, 'culturalTeams'));
    return snapshot.docs.map(item => mapTeam(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getContact(teamId: string) {
    await requireCulturalAdmin();
    const snapshot = await getDoc(doc(db, 'culturalTeamContacts', teamId));
    return snapshot.exists() ? snapshot.data() as CulturalTeamContact : null;
  },
  async setStatus(teamId: string, status: CulturalTeamStatus, rejectionReason = '') {
    await requireCulturalAdmin();
    await updateDoc(doc(db, 'culturalTeams', teamId), { status, rejectionReason: status === 'rejected' ? rejectionReason.trim() : '', updatedAt: new Date().toISOString() });
  },
  async getAllEnquiries() {
    await requireCulturalAdmin();
    const snapshot = await getDocs(collection(db, 'culturalTeamEnquiries'));
    return snapshot.docs.map(item => mapEnquiry(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async updateEnquiry(id: string, status: EnquiryStatus, adminNotes: string) {
    await requireCulturalAdmin();
    if (!['new', 'contacted', 'closed'].includes(status) || adminNotes.length > 2000) throw new Error('Check the enquiry update.');
    await updateDoc(doc(db, 'culturalTeamEnquiries', id), { status, adminNotes: adminNotes.trim(), updatedAt: new Date().toISOString() });
  },
};
