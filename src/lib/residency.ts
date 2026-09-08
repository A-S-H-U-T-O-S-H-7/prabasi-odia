import { normalizeEmail, normalizeIndianPhone } from './mobileVerification';

export type ResidencyStatus = 'RI' | 'NRI';

export function residencyDefaults(residencyStatus: ResidencyStatus) {
  return {
    residencyStatus,
    mobileCountryCode: residencyStatus === 'NRI' ? '+44' : '+91',
    currentCountry: residencyStatus === 'NRI' ? '' : 'India',
    idType: 'aadhar' as const,
    identityDocumentSelected: true,
  };
}

export function isResidencyContactVerified(data: Record<string, unknown>): boolean {
  if (data.residencyStatus === 'NRI') {
    const email = normalizeEmail(data.email);
    return Boolean(data.emailVerified && email && email === normalizeEmail(data.verifiedEmail));
  }
  const phone = normalizeIndianPhone(`${data.mobileCountryCode || ''}${data.mobileNumber || ''}`);
  return Boolean(data.mobileCountryCode === '+91' && data.mobileVerified && phone &&
    phone === normalizeIndianPhone(data.verifiedMobileNumber));
}
