"use client";

import { useFormContext } from "react-hook-form";
import { residencyDefaults, type ResidencyStatus } from "@/lib/residency";

export function useResidencyChange() {
  const { getValues, setValue, clearErrors } = useFormContext();

  return (status: ResidencyStatus, selectedCountryCode?: string) => {
    if (status === getValues("residencyStatus")) return;

    const updates = {
      ...residencyDefaults(status),
      ...(selectedCountryCode ? { mobileCountryCode: selectedCountryCode } : {}),
      currentState: "", currentCity: "", currentPinCode: "",
      currentLatitude: undefined, currentLongitude: undefined,
      nearbyCommunityId: "", nearbyCommunityName: "", requestedCommunityName: "",
      passportNumber: "", passportFile: undefined,
      mobileVerified: false, verifiedMobileNumber: "", emailVerified: false, verifiedEmail: "",
    };

    Object.entries(updates).forEach(([field, value]) => {
      setValue(field, value, { shouldDirty: true });
    });
    clearErrors(Object.keys(updates));
  };
}
