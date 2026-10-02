import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase/config';
import { requireApprovedMember } from '@/lib/memberAccess';
import { CONSULTATION_MODES, DOCTOR_SPECIALTIES, type ConsultationDraft, type ConsultationRequest, type ConsultationStatus, type Doctor, type DoctorDraft } from '@/lib/doctors/types';

const doctorSchema = z.object({
  name: z.string().trim().min(3).max(100), degrees: z.string().trim().min(2).max(120),
  specialty: z.enum(DOCTOR_SPECIALTIES), experienceYears: z.coerce.number().int().min(0).max(70),
  city: z.string().trim().min(2).max(100), country: z.string().trim().min(2).max(100),
  languages: z.string().trim().min(2).max(160), about: z.string().trim().min(20).max(3000),
  modes: z.array(z.enum(CONSULTATION_MODES)).min(1), published: z.boolean(),
});
const requestSchema = z.object({
  patientName: z.string().trim().min(2).max(100), age: z.coerce.number().int().min(0).max(120),
  phone: z.string().trim().min(7).max(25), email: z.email().max(200), city: z.string().trim().min(2).max(120),
  concern: z.string().trim().min(15).max(1500), mode: z.enum(CONSULTATION_MODES),
  preferredDate: z.iso.date(), preferredTime: z.string().trim().min(2).max(100),
});
const scheduleSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled']), scheduledAt: z.string(),
  contactMethod: z.enum(['whatsapp', 'meet', 'zoom', 'phone', '']), contactValue: z.string().trim().max(500),
  adminMessage: z.string().trim().max(1000),
});
const date = (value: unknown) => typeof value === 'string' ? value : '';
const today = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const mapDoctor = (id: string, data: Record<string, unknown>): Doctor => ({
  id, name: String(data.name || ''), degrees: String(data.degrees || ''), specialty: String(data.specialty || ''),
  experienceYears: Number(data.experienceYears || 0), city: String(data.city || ''), country: String(data.country || ''),
  languages: String(data.languages || ''), about: String(data.about || ''),
  modes: Array.isArray(data.modes) ? data.modes as Doctor['modes'] : [], published: data.published === true,
  createdAt: date(data.createdAt), updatedAt: date(data.updatedAt),
});
const mapRequest = (id: string, data: Record<string, unknown>): ConsultationRequest => ({
  id, userId: String(data.userId || ''), doctorId: String(data.doctorId || ''), doctorName: String(data.doctorName || ''),
  doctorSpecialty: String(data.doctorSpecialty || ''), patientName: String(data.patientName || ''), age: Number(data.age || 0),
  phone: String(data.phone || ''), email: String(data.email || ''), city: String(data.city || ''),
  concern: String(data.concern || ''), mode: data.mode as ConsultationRequest['mode'],
  preferredDate: String(data.preferredDate || ''), preferredTime: String(data.preferredTime || ''),
  status: (data.status || 'pending') as ConsultationStatus, scheduledAt: date(data.scheduledAt),
  contactMethod: (data.contactMethod || '') as ConsultationRequest['contactMethod'],
  contactValue: String(data.contactValue || ''), adminMessage: String(data.adminMessage || ''),
  createdAt: date(data.createdAt), updatedAt: date(data.updatedAt),
});

function requireUser() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please sign in to request a consultation.');
  return uid;
}

async function requireDoctorAdmin() {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Please sign in as an admin.');
  const snapshot = await getDoc(doc(db, 'admins', user.uid));
  const admin = snapshot.exists() ? snapshot.data() : (await getDocs(query(collection(db, 'admins'), where('email', '==', user.email.toLowerCase()), limit(1)))).docs[0]?.data();
  if (!admin || admin.status !== 'active' || String(admin.email || '').toLowerCase() !== user.email.toLowerCase()
    || (admin.role !== 'super_admin' && !admin.permissions?.includes('doctors'))) {
    throw new Error('You do not have permission to manage consultations.');
  }
}

export const doctorsService = {
  async getPublished() {
    const snapshot = await getDocs(query(collection(db, 'doctors'), where('published', '==', true)));
    return snapshot.docs.map(item => mapDoctor(item.id, item.data())).sort((a, b) => a.name.localeCompare(b.name));
  },
  async getAllDoctors() {
    await requireDoctorAdmin();
    const snapshot = await getDocs(collection(db, 'doctors'));
    return snapshot.docs.map(item => mapDoctor(item.id, item.data())).sort((a, b) => a.name.localeCompare(b.name));
  },
  async saveDoctor(data: DoctorDraft, id?: string) {
    await requireDoctorAdmin();
    const parsed = doctorSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the doctor profile and try again.');
    const now = new Date().toISOString();
    if (id) { await updateDoc(doc(db, 'doctors', id), { ...parsed.data, updatedAt: now }); return id; }
    const reference = await addDoc(collection(db, 'doctors'), { ...parsed.data, createdAt: now, updatedAt: now });
    return reference.id;
  },
  async requestConsultation(doctorId: string, data: ConsultationDraft) {
    const uid = await requireApprovedMember('contact a doctor');
    const parsed = requestSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the patient details and consultation request.');
    if (parsed.data.preferredDate < today()) throw new Error('Choose today or a future date.');
    const snapshot = await getDoc(doc(db, 'doctors', doctorId));
    const doctor = snapshot.data();
    if (!doctor?.published || !Array.isArray(doctor.modes) || !doctor.modes.includes(parsed.data.mode)) throw new Error('This doctor is not available for the selected consultation type.');
    const now = new Date().toISOString();
    await addDoc(collection(db, 'consultationRequests'), {
      ...parsed.data, userId: uid, doctorId, doctorName: doctor.name, doctorSpecialty: doctor.specialty,
      status: 'pending', scheduledAt: '', contactMethod: '', contactValue: '', adminMessage: '', createdAt: now, updatedAt: now,
    });
  },
  async getMyRequests() {
    const uid = requireUser();
    const snapshot = await getDocs(query(collection(db, 'consultationRequests'), where('userId', '==', uid)));
    return snapshot.docs.map(item => mapRequest(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getAllRequests() {
    await requireDoctorAdmin();
    const snapshot = await getDocs(collection(db, 'consultationRequests'));
    return snapshot.docs.map(item => mapRequest(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async updateRequest(id: string, data: Pick<ConsultationRequest, 'status' | 'scheduledAt' | 'contactMethod' | 'contactValue' | 'adminMessage'>) {
    await requireDoctorAdmin();
    const parsed = scheduleSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the schedule and contact details.');
    if (parsed.data.status === 'scheduled') {
      if (!parsed.data.scheduledAt || !parsed.data.contactMethod || !parsed.data.contactValue) throw new Error('A date, contact method and contact detail are required to schedule.');
      if (Number.isNaN(Date.parse(parsed.data.scheduledAt))) throw new Error('Enter a valid consultation date and time.');
      if (['whatsapp', 'phone'].includes(parsed.data.contactMethod) && !/^\+?[\d\s()-]{7,25}$/.test(parsed.data.contactValue)) throw new Error('Enter a valid phone number with country code.');
      if (['meet', 'zoom'].includes(parsed.data.contactMethod)) {
        let url: URL;
        try { url = new URL(parsed.data.contactValue); } catch { throw new Error('Enter a valid meeting link.'); }
        const host = url.hostname.toLowerCase();
        if (url.protocol !== 'https:' || (parsed.data.contactMethod === 'meet' && host !== 'meet.google.com')
          || (parsed.data.contactMethod === 'zoom' && host !== 'zoom.us' && !host.endsWith('.zoom.us'))) {
          throw new Error('Use a Google Meet or Zoom link that matches the selected method.');
        }
      }
    }
    await updateDoc(doc(db, 'consultationRequests', id), { ...parsed.data, updatedAt: new Date().toISOString() });
  },
};
