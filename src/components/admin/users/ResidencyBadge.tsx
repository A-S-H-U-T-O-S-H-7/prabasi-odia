import { residencyLabels, type ResidencyStatus } from '@/lib/residency';

export default function ResidencyBadge({ status, compact = false }: { status?: ResidencyStatus; compact?: boolean }) {
  const label = status ? residencyLabels[status] : 'Not provided';
  const colors = status === 'RI'
    ? 'border-[#D9772B]/20 bg-[#D9772B]/10 text-[#9A4C16]'
    : status === 'NRI'
      ? 'border-[#6B1E5B]/20 bg-[#6B1E5B]/10 text-[#6B1E5B]'
      : status === 'RO'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : status === 'GUEST'
          ? 'border-slate-200 bg-slate-50 text-slate-600'
      : 'border-gray-200 bg-gray-50 text-gray-500';

  return (
    <span title={`Residency status: ${label}`} aria-label={`Residency status: ${label}`} className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${colors}`}>
      {compact && status ? status : compact ? 'Residency not provided' : label}
    </span>
  );
}
