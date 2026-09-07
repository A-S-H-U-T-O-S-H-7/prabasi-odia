export const JOIN_WHATSAPP_URL = 'https://wa.me/917303397090?text=Hello%2C%20I%20need%20help%20with%20the%20Prabasi%20Odia%20join%20form.';

export function normalizeSupportMobile(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\+?[\d\s()-]+$/.test(value.trim())) return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 14) return null;
  // The PHP endpoint expects Indian numbers without the separately selected +91.
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

export type SupportTrigger = 'otp_retry' | 'next_blocked' | 'manual';

export function createSupportAttemptTracker() {
  const counts = new Map<string, number>();
  let lastPrompt = -Infinity;
  return {
    record(trigger: Exclude<SupportTrigger, 'manual'>, key: string, now = Date.now()) {
      const counter = `${trigger}:${key}`;
      const count = (counts.get(counter) ?? 0) + 1;
      counts.set(counter, count);
      if (count < (trigger === 'otp_retry' ? 2 : 3) || now - lastPrompt < 120_000) return false;
      lastPrompt = now;
      return true;
    },
    resetNext(step: number) { counts.delete(`next_blocked:${step}`); },
  };
}
