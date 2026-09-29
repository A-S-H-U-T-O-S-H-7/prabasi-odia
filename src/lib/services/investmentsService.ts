import { addDoc, collection, doc, getDoc, getDocs, limit, query, runTransaction, updateDoc, where } from 'firebase/firestore';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase/config';
import { INVESTMENT_SECTORS, type Investment, type InvestmentInterest, type InvestmentInterestDetails, type InvestmentStatus } from '@/lib/investments/types';

const postSchema = z.object({
  name: z.string().trim().min(2).max(100),
  amount: z.coerce.number().positive().max(1_000_000_000_000),
  currency: z.enum(['INR', 'USD']),
  sector: z.enum(INVESTMENT_SECTORS),
  details: z.string().trim().min(30).max(6000),
  place: z.string().trim().min(2).max(160),
  preferredLocation: z.string().trim().max(160),
});

const interestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().min(7).max(25),
  location: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

const iso = (value: unknown) => value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
  ? value.toDate().toISOString() : typeof value === 'string' ? value : '';

const mapInvestment = (id: string, data: Record<string, unknown>): Investment => ({
  id, name: String(data.name || ''), amount: Number(data.amount || 0), currency: data.currency === 'USD' ? 'USD' : 'INR',
  sector: String(data.sector || ''), details: String(data.details || ''), place: String(data.place || ''),
  preferredLocation: String(data.preferredLocation || ''), ownerId: String(data.ownerId || ''),
  status: (data.status || 'pending') as InvestmentStatus, rejectionReason: String(data.rejectionReason || ''),
  createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt),
});

const mapInterest = (id: string, data: Record<string, unknown>): InvestmentInterest => ({
  id, memberId: String(data.memberId || id), name: String(data.name || ''), email: String(data.email || ''),
  phone: String(data.phone || ''), location: String(data.location || ''), message: String(data.message || ''),
  status: (data.status || 'new') as InvestmentInterest['status'], createdAt: iso(data.createdAt),
});

async function requireVerifiedMember() {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to continue.');
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  const member = snapshot.data();
  if (!member?.hasJoinedCommunity || !member?.isVerified) throw new Error('Only verified community members can use investments.');
  return user.uid;
}

async function requireInvestmentAdmin() {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('Please sign in as an admin.');
  const direct = await getDoc(doc(db, 'admins', user.uid));
  const admin = direct.exists() ? direct.data() : (await getDocs(query(collection(db, 'admins'), where('email', '==', user.email.toLowerCase()), limit(1)))).docs[0]?.data();
  if (!admin || admin.status !== 'active' || String(admin.email || '').toLowerCase() !== user.email.toLowerCase()
    || (admin.role !== 'super_admin' && !admin.permissions?.includes('investments'))) {
    throw new Error('You do not have permission to edit investments.');
  }
}

export const investmentsService = {
  async getVisible() {
    const uid = await requireVerifiedMember();
    const posts = collection(db, 'investments');
    const [approved, mine] = await Promise.all([
      getDocs(query(posts, where('status', '==', 'approved'))),
      getDocs(query(posts, where('ownerId', '==', uid))),
    ]);
    const results = new Map<string, Investment>();
    for (const snapshot of [approved, mine]) for (const item of snapshot.docs) results.set(item.id, mapInvestment(item.id, item.data()));
    return [...results.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(data: unknown) {
    const uid = await requireVerifiedMember();
    const parsed = postSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the investment details and try again.');
    const now = new Date().toISOString();
    const reference = await addDoc(collection(db, 'investments'), { ...parsed.data, ownerId: uid, status: 'pending', rejectionReason: '', createdAt: now, updatedAt: now });
    return reference.id;
  },

  async updatePending(postId: string, data: unknown) {
    const uid = await requireVerifiedMember();
    const parsed = postSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the investment details and try again.');
    const reference = doc(db, 'investments', postId);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      const post = snapshot.data();
      if (!post || post.ownerId !== uid || post.status !== 'pending') throw new Error('Only your pending posts can be edited. Refresh the page to see its latest status.');
      transaction.update(reference, { ...parsed.data, updatedAt: new Date().toISOString() });
    });
  },

  async updateApproved(postId: string, data: unknown) {
    await requireInvestmentAdmin();
    const parsed = postSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the investment details and try again.');
    const reference = doc(db, 'investments', postId);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(reference);
      if (snapshot.data()?.status !== 'approved') throw new Error('Only approved posts can be edited here. Refresh the page to see its latest status.');
      transaction.update(reference, { ...parsed.data, updatedAt: new Date().toISOString() });
    });
  },

  async expressInterest(postId: string, data: unknown) {
    const uid = await requireVerifiedMember();
    const parsed = interestSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check your contact details and message.');
    const post = doc(db, 'investments', postId);
    const response = doc(db, 'investments', postId, 'interests', uid);
    await runTransaction(db, async transaction => {
      const [postSnapshot, responseSnapshot] = await Promise.all([transaction.get(post), transaction.get(response)]);
      const investment = postSnapshot.data();
      if (!investment || investment.status !== 'approved') throw new Error('This investment is no longer accepting interest.');
      if (investment.ownerId === uid) throw new Error('You cannot respond to your own post.');
      if (responseSnapshot.exists()) throw new Error('You have already expressed interest in this post.');
      transaction.set(response, { ...parsed.data, memberId: uid, status: 'new', createdAt: new Date().toISOString() });
    });
  },

  async getMyInterestIds(postIds: string[]) {
    const uid = await requireVerifiedMember();
    const responses = await Promise.all(postIds.map(postId => getDoc(doc(db, 'investments', postId, 'interests', uid))));
    return postIds.filter((_, index) => responses[index].exists());
  },

  async getAll() {
    const snapshot = await getDocs(collection(db, 'investments'));
    return snapshot.docs.map(item => mapInvestment(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateStatus(postId: string, status: InvestmentStatus, rejectionReason = '') {
    await updateDoc(doc(db, 'investments', postId), { status, rejectionReason: status === 'rejected' ? rejectionReason : '', updatedAt: new Date().toISOString() });
  },

  async getInterests(postId: string) {
    const snapshot = await getDocs(collection(db, 'investments', postId, 'interests'));
    return snapshot.docs.map(item => mapInterest(item.id, item.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateInterestStatus(postId: string, memberId: string, status: InvestmentInterest['status']) {
    await updateDoc(doc(db, 'investments', postId, 'interests', memberId), { status, updatedAt: new Date().toISOString() });
  },

  async updateInterestDetails(postId: string, memberId: string, data: InvestmentInterestDetails) {
    await requireInvestmentAdmin();
    const parsed = interestSchema.safeParse(data);
    if (!parsed.success) throw new Error('Check the response details and try again.');
    const reference = doc(db, 'investments', postId, 'interests', memberId);
    await runTransaction(db, async transaction => {
      if (!(await transaction.get(reference)).exists()) throw new Error('This response no longer exists. Refresh the page.');
      transaction.update(reference, { ...parsed.data, updatedAt: new Date().toISOString() });
    });
  },
};
