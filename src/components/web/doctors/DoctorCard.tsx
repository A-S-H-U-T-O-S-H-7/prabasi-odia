import { ArrowRight, MapPin } from 'lucide-react';
import type { Doctor } from '@/lib/doctors/types';

const modeLabel = {
  chat: 'Chat',
  video: 'Video call',
  phone: 'Phone call',
};

interface DoctorCardProps {
  doctor: Doctor;
  onOpen: () => void;
}

export default function DoctorCard({ doctor, onOpen }: DoctorCardProps) {
  return (
    <article
      className="flex h-full flex-col rounded-[24px] border border-[#d6e9e5]
        bg-[radial-gradient(circle_at_top_right,#e1f5f0_0%,#fff_55%)] p-5
        shadow-[0_10px_28px_rgba(16,80,88,.06)] transition hover:-translate-y-1
        hover:shadow-[0_16px_32px_rgba(16,80,88,.12)] sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#d5efeb] font-serif text-2xl font-bold text-[#167f82]">
          {doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0) || 'D'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#16868a]">
            {doctor.specialty}
          </p>
          <h3 className="mt-1 break-words font-serif text-xl font-bold">
            {doctor.name}
          </h3>
          <p className="mt-1 text-xs text-[#657c80]">{doctor.degrees}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#657c80]">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} />
          {doctor.city}, {doctor.country}
        </span>
        <span>{doctor.experienceYears} years experience</span>
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[#557478]">
        {doctor.about}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {doctor.modes.map((value) => (
          <span
            key={value}
            className="rounded-full bg-[#eaf5f2] px-3 py-1.5 text-[11px] font-semibold text-[#167f82]"
          >
            {modeLabel[value]}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12686e]"
      >
        View details & request
        <ArrowRight size={15} />
      </button>
    </article>
  );
}
