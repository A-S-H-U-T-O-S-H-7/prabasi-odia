import { ArrowUpRight, CircleCheck, Clock3, Compass, HandCoins, MapPin, Pencil } from 'lucide-react';
import type { Investment } from '@/lib/investments/types';

interface InvestmentCardProps {
  item: Investment;
  own: boolean;
  interested: boolean;
  checkingInterest: boolean;
  onInterest: (item: Investment) => void;
  onEdit: (item: Investment) => void;
}

const money = (item: Investment) =>
  new Intl.NumberFormat(item.currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: item.currency,
    maximumFractionDigits: 0,
  }).format(item.amount);

const date = (value: string) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

export default function InvestmentCard({
  item,
  own,
  interested,
  checkingInterest,
  onInterest,
  onEdit,
}: InvestmentCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col rounded-2xl border border-[#DCE6F1] bg-[radial-gradient(circle_at_top_right,#E8F2FF_0%,#F6FAFF_44%,#FFFFFF_100%)] p-5 shadow-[0_8px_24px_rgba(36,75,120,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#B7CDE3] hover:shadow-[0_18px_36px_rgba(36,75,120,.13)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#D6E9FB] to-[#EDF5FE] text-[#244B78] shadow-sm">
          <HandCoins className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-[#D5E5F4] bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-[#244B78]">
          {item.sector}
        </span>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#52799E]">
        {item.name}
      </p>
      <h3 className="break-words text-2xl font-bold leading-snug text-[#2A1636]">
        {money(item)}
      </h3>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6B5E5A]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {item.place}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5" />
          {item.preferredLocation || 'Flexible location'}
        </span>
      </div>
      <p className="mt-5 line-clamp-3 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-[#6B5E5A]">
        {item.details}
      </p>
      <details className="mt-3 text-xs text-[#244B78]">
        <summary className="cursor-pointer font-semibold">Read full details</summary>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6B5E5A]">
          {item.details}
        </p>
      </details>

      {own && (
        <div className="mt-4">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            item.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700'
              : item.status === 'pending'
                ? 'bg-amber-50 text-amber-700'
                : item.status === 'rejected'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-slate-100 text-slate-700'
          }`}>
            {item.status}
          </span>
          {item.rejectionReason && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              Admin note: {item.rejectionReason}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE6F1] pt-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#8A7B82]">
          <Clock3 className="h-3.5 w-3.5" />
          {date(item.createdAt)}
        </span>
        {own && item.status === 'pending' ? (
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#B8D1E8] bg-white/85 px-4 py-2.5 text-xs font-semibold text-[#244B78] transition hover:bg-[#EAF3FC]"
          >
            <Pencil className="h-4 w-4" />
            Edit post
          </button>
        ) : own ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5E5A]">
            <CircleCheck className="h-4 w-4" />
            Your post
          </span>
        ) : interested ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
            <CircleCheck className="h-4 w-4" />
            Interested
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onInterest(item)}
            disabled={checkingInterest}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6B1E5B] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#531547] disabled:opacity-60"
          >
            {checkingInterest ? 'Checking...' : 'I am interested'}
            {!checkingInterest && <ArrowUpRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </article>
  );
}
