export const OTP_EXPIRY_MINUTES = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const MAX_OTP_RESENDS = 3;
export const MAX_OTP_ATTEMPTS = 5;
export const INDIAN_COUNTRY_CODE = '+91';

export type OtpChannel = 'sms' | 'email';

export function generateOtp(): string {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  return String(100000 + (randomValue % 900000));
}

export function isIndianCountryCode(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  return input.trim() === INDIAN_COUNTRY_CODE;
}

export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function normalizeIndianPhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;

  const digits = input.replace(/\D/g, '');
  let mobile = digits;

  if (mobile.startsWith('0') && mobile.length === 11) {
    mobile = mobile.slice(1);
  }

  if (mobile.startsWith('91') && mobile.length === 12) {
    mobile = mobile.slice(2);
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return null;
  }

  return `+91${mobile}`;
}
