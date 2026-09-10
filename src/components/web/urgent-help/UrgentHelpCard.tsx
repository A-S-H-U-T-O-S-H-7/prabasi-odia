'use client';

import { Clock3, HeartHandshake, MapPin } from 'lucide-react';
import type { UrgentHelpRequest } from '@/lib/services/urgentHelpService';

const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export default function UrgentHelpCard({ request, onView }: { request: UrgentHelpRequest; onView: (request: UrgentHelpRequest) => void }) {
  return <article className="flex h-full flex-col rounded-2xl border border-[#F0D8D0] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF0EA] text-[#B45337]"><HeartHandshake className="h-5 w-5" /></span><span className="rounded-full bg-[#FFF4E7] px-3 py-1.5 text-[11px] font-semibold text-[#9A5B20]">{request.category}</span></div><h2 className="break-words text-lg font-bold leading-snug text-[#2A1636]">{request.title}</h2><p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#6B5E5A]"><MapPin className="h-3.5 w-3.5" />{request.location}</p><p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-[#6B5E5A]">{request.message}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F7EAE5] pt-4"><span className="inline-flex items-center gap-1 text-[11px] text-[#8A7B82]"><Clock3 className="h-3.5 w-3.5" />{date(request.createdAt)}</span><button type="button" onClick={() => onView(request)} className="rounded-xl bg-[#B45337] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#923A22]">View request</button></div></article>;
}
