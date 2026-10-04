import { normalizeEmail, normalizeIndianPhone } from './mobileVerification';

// GUEST remains for accounts created before Guest registration was removed.
export type ResidencyStatus = 'NRI' | 'RI' | 'RO' | 'GUEST';
export type JoinResidencyStatus = Exclude<ResidencyStatus, 'GUEST'>;

export const residencyLabels: Record<ResidencyStatus, string> = {
  NRI: 'Odia living abroad',
  RI: 'Odia living elsewhere in India',
  RO: 'Odia living in Odisha',
  GUEST: 'Guest',
};

export function canJoinCommunity(status?: ResidencyStatus | null): boolean {
  return status !== 'RO' && status !== 'GUEST';
}

export function canUseMemberServices(status?: ResidencyStatus | null): boolean {
  return status !== 'GUEST';
}

export function canHaveMemberCard(status?: ResidencyStatus | null): boolean {
  return status === 'NRI' || status === 'RI' || !status;
}

export function residencyDefaults<T extends ResidencyStatus>(residencyStatus: T) {
  return {
    residencyStatus,
    mobileCountryCode: residencyStatus === 'NRI' ? '+44' : '+91',
    currentCountry: residencyStatus === 'NRI' ? '' : 'India',
    ...(residencyStatus === 'RO' ? { currentState: 'Odisha' } : {}),
    idType: 'aadhar' as const,
    identityDocumentSelected: true,
  };
}

export function isResidencyContactVerified(data: Record<string, unknown>): boolean {
  if (data.residencyStatus !== 'RI') {
    const email = normalizeEmail(data.email);
    return Boolean(data.emailVerified && email && email === normalizeEmail(data.verifiedEmail));
  }
  const phone = normalizeIndianPhone(`${data.mobileCountryCode || ''}${data.mobileNumber || ''}`);
  return Boolean(data.mobileCountryCode === '+91' && data.mobileVerified && phone &&
    phone === normalizeIndianPhone(data.verifiedMobileNumber));
}
