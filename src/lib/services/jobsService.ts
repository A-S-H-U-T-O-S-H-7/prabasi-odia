import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

export const JOB_CATEGORIES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Startup / Co-founder'] as const;
export type JobCategory = typeof JOB_CATEGORIES[number];
export type JobStatus = 'pending' | 'approved' | 'rejected' | 'closed';

export interface Job {
  id: string;
  title: string;
  company: string;
  category: JobCategory;
  location: string;
  description: string;
  compensation: string;
  contactName: string;
  contactEmail: string;
  ownerId: string;
  ownerName: string;
  status: JobStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  resumeUrl?: string;
  resumeName?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'declined';
  createdAt: string;
}

const toDate = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate().toISOString();
  return typeof value === 'string' ? value : new Date().toISOString();
};

function mapJob(id: string, data: Record<string, unknown>): Job {
  return {
    id,
    title: String(data.title || ''),
    company: String(data.company || ''),
    category: (data.category || 'Full-time') as JobCategory,
    location: String(data.location || ''),
    description: String(data.description || ''),
    compensation: String(data.compensation || ''),
    contactName: String(data.contactName || ''),
    contactEmail: String(data.contactEmail || ''),
    ownerId: String(data.ownerId || ''),
    ownerName: String(data.ownerName || ''),
    status: (data.status || 'pending') as JobStatus,
    rejectionReason: data.rejectionReason ? String(data.rejectionReason) : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapApplication(id: string, jobId: string, data: Record<string, unknown>): JobApplication {
  return {
    id,
    jobId,
    applicantId: String(data.applicantId || ''),
    name: String(data.name || ''),
    email: String(data.email || ''),
    phone: String(data.phone || ''),
    note: String(data.note || ''),
    resumeUrl: data.resumeUrl ? String(data.resumeUrl) : undefined,
    resumeName: data.resumeName ? String(data.resumeName) : undefined,
    status: (data.status || 'new') as JobApplication['status'],
    createdAt: toDate(data.createdAt),
  };
}

async function readJobs(status?: JobStatus) {
  const jobsRef = collection(db, 'jobs');
  const constraints = status ? [where('status', '==', status), orderBy('createdAt', 'desc')] : [orderBy('createdAt', 'desc')];
  try {
    const snapshot = await getDocs(query(jobsRef, ...constraints));
    return snapshot.docs.map(item => mapJob(item.id, item.data()));
  } catch {
    const snapshot = await getDocs(query(jobsRef));
    const jobs = snapshot.docs.map(item => mapJob(item.id, item.data())).filter(job => !status || job.status === status);
    return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const jobsService = {
  async getApprovedJobs() {
    return readJobs('approved');
  },

  async getMyJobs(userId: string) {
    const snapshot = await getDocs(query(collection(db, 'jobs'), where('ownerId', '==', userId)));
    return snapshot.docs.map(item => mapJob(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createJob(data: Omit<Job, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'rejectionReason'>) {
    const userSnapshot = await getDoc(doc(db, 'users', data.ownerId));
    const user = userSnapshot.exists() ? userSnapshot.data() : null;
    if (!user?.hasJoinedCommunity || !user.isVerified) {
      throw new Error('Only verified community members can post an opportunity.');
    }
    const now = new Date().toISOString();
    const reference = await addDoc(collection(db, 'jobs'), { ...data, status: 'pending', createdAt: now, updatedAt: now });
    return reference.id;
  },

  async applyToJob(jobId: string, data: Omit<JobApplication, 'id' | 'jobId' | 'status' | 'createdAt' | 'resumeUrl' | 'resumeName'>, resume?: File) {
    const applicationRef = doc(db, 'jobs', jobId, 'applications', data.applicantId);
    if ((await getDoc(applicationRef)).exists()) throw new Error('You have already applied to this opportunity.');
    let resumeUrl = '';
    let resumeName = '';
    if (resume) {
      const fileRef = ref(storage, `jobs/${jobId}/applications/${applicationRef.id}-${resume.name}`);
      await uploadBytes(fileRef, resume, { contentType: resume.type });
      resumeUrl = await getDownloadURL(fileRef);
      resumeName = resume.name;
    }
      await setDoc(applicationRef, {
      ...data,
      resumeUrl,
      resumeName,
      status: 'new',
      createdAt: serverTimestamp(),
    });
  },

  async getApplications(jobId: string) {
    const snapshot = await getDocs(query(collection(db, 'jobs', jobId, 'applications'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(item => mapApplication(item.id, jobId, item.data()));
  },
};

export const adminJobsService = {
  async getJobs(status?: JobStatus) {
    return readJobs(status);
  },

  async getApplications(jobId: string) {
    const snapshot = await getDocs(query(collection(db, 'jobs', jobId, 'applications'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(item => mapApplication(item.id, jobId, item.data()));
  },

  async updateStatus(jobId: string, status: JobStatus, rejectionReason = '') {
    await updateDoc(doc(db, 'jobs', jobId), { status, rejectionReason, updatedAt: new Date().toISOString() });
  },

  async updateApplicationStatus(jobId: string, applicationId: string, status: JobApplication['status']) {
    await updateDoc(doc(db, 'jobs', jobId, 'applications', applicationId), { status, updatedAt: new Date().toISOString() });
  },
};
