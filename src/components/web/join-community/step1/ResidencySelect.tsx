"use client";

import { useFormContext } from 'react-hook-form';
import { residencyDefaults, type ResidencyStatus } from '@/lib/residency';

export default function ResidencySelect() {
  const { watch, setValue, clearErrors } = useFormContext();
  const residencyStatus = watch('residencyStatus');

  const selectResidency = (value: ResidencyStatus) => {
    if (value === residencyStatus) return;
    const updates = {
      ...residencyDefaults(value),
      currentState: '', currentCity: '', currentPinCode: '',
      currentLatitude: undefined, currentLongitude: undefined,
      nearbyCommunityId: '', nearbyCommunityName: '', requestedCommunityName: '',
      passportNumber: '', passportFile: undefined,
      mobileVerified: false, verifiedMobileNumber: '', emailVerified: false, verifiedEmail: '',
    };
    Object.entries(updates).forEach(([field, nextValue]) => {
      setValue(field, nextValue, { shouldDirty: true });
    });
    clearErrors(Object.keys(updates));
  };

  return (
    <fieldset className="rounded-xl border border-[#6B1E5B]/15 bg-[#6B1E5B]/5 p-3 sm:rounded-2xl sm:p-4">
      <legend className="px-1 text-sm font-semibold text-[#2A1636]">Residency status <span className="text-red-400">*</span></legend>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {([
          ['RI', 'Resident Indian (RI)'],
          ['NRI', 'Non-Resident Indian (NRI)'],
        ] as const).map(([value, label]) => (
          <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${residencyStatus === value ? 'border-[#6B1E5B] bg-white text-[#6B1E5B]' : 'border-[#D4C8C0]/50 text-[#2A1636] hover:bg-white/60'}`}>
            <input type="radio" name="residencyStatus" value={value} checked={residencyStatus === value} onChange={() => selectResidency(value)} className="h-4 w-4 accent-[#6B1E5B]" />
            {label}
          </label>
        ))}
      </div>
      
    </fieldset>
  );
}
