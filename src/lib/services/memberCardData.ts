export function coerceDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object') {
    const record = value as {
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
      nanoseconds?: number;
    };

    if (typeof record.toDate === 'function') {
      const parsed = record.toDate();
      return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
    }

    const seconds = record.seconds ?? record._seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000);
    }
  }

  return null;
}

export function formatMemberSince(value?: unknown): string {
  const parsed = coerceDate(value) ?? new Date();
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function resolveMemberName(user: Record<string, any> = {}, fallback?: string) {
  const fromPayload = fallback && fallback !== 'Member' ? fallback : '';
  return firstNonEmpty(
    fromPayload,
    user.displayName,
    user.name,
    user.fullName,
    fallback,
    user.email?.split?.('@')?.[0],
    'Member'
  );
}

export function resolveBloodGroup(user: Record<string, any> = {}, fallback?: string) {
  return firstNonEmpty(fallback, user.bloodGroup, user.blood_group, '—');
}

export function resolveLocation(user: Record<string, any> = {}, fallback?: string) {
  const composed = [user.currentCity, user.currentState, user.currentCountry]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(', ');

  return firstNonEmpty(fallback, composed, user.currentCity, user.odishaCity, 'Not set');
}

export function resolvePhotoURL(user: Record<string, any> = {}, fallback?: string) {
  return firstNonEmpty(
    fallback,
    user.photoURL,
    user.documents?.profilePhoto,
    user.profilePhoto,
    user.photo
  );
}

export function resolveMemberId(user: Record<string, any> = {}, fallback?: string) {
  return firstNonEmpty(fallback, user.memberId, user.member_id);
}
