'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { urgentHelpService, type UrgentHelpOffer } from '@/lib/services/urgentHelpService';

export default function HelperOffers() {
  const { admin } = useAdminAuthStore();
  const [offers, setOffers] = useState<UrgentHelpOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('urgent_help');
  const load = async () => { setLoading(true); try { setOffers(await urgentHelpService.getOffers()); } catch { toast.error('Could not load helper submissions.'); } finally { setLoading(false); } };
  useEffect(() => { if (canManage) void load(); }, [canManage]);
  if (!canManage) return <p className="p-6 text-sm text-[#6B5E5A]">You do not have permission to view helper submissions.</p>;
  return <div className="mx-auto max-w-6xl"><div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Interested Helpers</h1><p className="mt-2 text-sm text-[#6B5E5A]">People who submitted their details to help with urgent requests.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#E7D7E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B1E5B]"><RefreshCw className="h-4 w-4" />Refresh</button></div><div className="overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white">{loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[#6B5E5A]"><Loader2 className="h-5 w-5 animate-spin" />Loading helpers...</div> : offers.length === 0 ? <p className="p-12 text-center text-sm text-[#6B5E5A]">No helper submissions yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#F8F1F7] text-xs uppercase text-[#6B5E5A]"><tr><th className="px-5 py-4">Helper</th><th className="px-5 py-4">Helping with</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Address / note</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-[#F0E7EE]">{offers.map(offer => <tr key={offer.id} className="align-top"><td className="px-5 py-4 font-semibold text-[#2A1636]">{offer.helperName}</td><td className="px-5 py-4 text-[#6B5E5A]">{offer.requestTitle}</td><td className="px-5 py-4"><a className="block text-[#B45337]" href={`tel:${offer.phone}`}>{offer.phone}</a><a className="block break-all text-[#B45337]" href={`mailto:${offer.email}`}>{offer.email}</a></td><td className="px-5 py-4 text-xs text-[#6B5E5A]">{offer.address}{offer.message && <p className="mt-1">{offer.message}</p>}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{offer.status}</span></td></tr>)}</tbody></table></div>}</div></div>;
}
