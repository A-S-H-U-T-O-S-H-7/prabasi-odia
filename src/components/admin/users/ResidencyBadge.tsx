import type { ResidencyStatus } from '@/lib/residency';

export default function ResidencyBadge({ status, compact = false }: { status?: ResidencyStatus; compact?: boolean }) {
  const label = status === 'RI' ? 'Resident Indian (RI)' : status === 'NRI' ? 'Non-Resident Indian (NRI)' : 'Not provided';
  const colors = status === 'RI'
    ? 'border-[#D9772B]/20 bg-[#D9772B]/10 text-[#9A4C16]'
    : status === 'NRI'
      ? 'border-[#6B1E5B]/20 bg-[#6B1E5B]/10 text-[#6B1E5B]'
      : 'border-gray-200 bg-gray-50 text-gray-500';

  return (
    <span title={`Residency status: ${label}`} aria-label={`Residency status: ${label}`} className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${colors}`}>
      {compact && (status === 'RI' || status === 'NRI') ? status : compact ? 'Residency not provided' : label}
    </span>
  );
}
