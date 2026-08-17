export const OTP_EXPIRY_MINUTES = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const MAX_OTP_RESENDS = 3;
export const MAX_OTP_ATTEMPTS = 5;

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
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
