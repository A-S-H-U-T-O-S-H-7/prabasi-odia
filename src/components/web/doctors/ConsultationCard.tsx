import { ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import type { ConsultationRequest } from '@/lib/doctors/types';

const statusTone = {
  pending: 'bg-amber-50 text-amber-700',
  scheduled: 'bg-teal-50 text-teal-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-rose-50 text-rose-700',
};

function contactHref(request: ConsultationRequest) {
  if (request.contactMethod === 'whatsapp') {
    return `https://wa.me/${request.contactValue.replace(/\D/g, '')}`;
  }
  if (request.contactMethod === 'phone') {
    return `tel:${request.contactValue.replace(/[^\d+]/g, '')}`;
  }
  if (request.contactMethod === 'meet' || request.contactMethod === 'zoom') {
    try {
      const url = new URL(request.contactValue);
      return url.protocol === 'https:' ? url.toString() : '';
    } catch {
      return '';
    }
  }
  return '';
}

export default function ConsultationCard({ request }: { request: ConsultationRequest }) {
  const href = request.status === 'scheduled' ? contactHref(request) : '';
  const external = href.startsWith('https:');

  return (
    <article className="rounded-[24px] border border-[#d6e9e5] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#16868a]">
            {request.doctorSpecialty}
          </p>
          <h2 className="mt-1 font-serif text-xl font-bold">{request.doctorName}</h2>
          <p className="mt-1 text-xs text-[#657c80]">
            For {request.patientName} · Requested{' '}
            {new Date(request.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusTone[request.status]}`}>
          {request.status}
        </span>
      </div>
      <div className="mt-5 grid gap-3 border-t border-[#e3efec] pt-4 text-sm sm:grid-cols-2">
        <p className="inline-flex items-center gap-2 text-[#557478]">
          <CalendarDays size={16} />
          Preferred: {request.preferredDate}
        </p>
        <p className="inline-flex items-center gap-2 text-[#557478]">
          <Clock3 size={16} />
          {request.preferredTime} · {request.mode}
        </p>
      </div>
      {request.status === 'scheduled' && (
        <div className="mt-5 rounded-2xl bg-[#edf8f4] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#167f82]">
            Confirmed consultation
          </p>
          <p className="mt-2 text-sm font-semibold">
            {new Date(request.scheduledAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          {request.adminMessage && (
            <p className="mt-2 text-sm leading-6 text-[#557478]">
              {request.adminMessage}
            </p>
          )}
          {href && (
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#167f82] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {request.contactMethod === 'whatsapp'
                ? 'Open WhatsApp'
                : request.contactMethod === 'phone'
                  ? 'Call doctor'
                  : 'Join video call'}
              <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      )}
      {request.status === 'pending' && (
        <p className="mt-4 text-xs text-[#657c80]">
          Our team will review your request and confirm a time here.
        </p>
      )}
      {request.status === 'cancelled' && request.adminMessage && (
        <p className="mt-4 text-sm text-[#a35050]">{request.adminMessage}</p>
      )}
    </article>
  );
}
