/**
 * URL-friendly slug helpers for communities.
 *
 * Older community documents were created before slugs existed, so every read
 * falls back to deriving the slug from the community name.
 */

export function slugify(text: string): string {
  return (text || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCommunitySlug(community: { slug?: string; name?: string; id?: string }): string {
  return community.slug || slugify(community.name || '') || community.id || '';
}

/** Firestore auto-generated IDs are 20 chars with mixed case and no separators. */
export function looksLikeFirestoreId(value: string): boolean {
  return /^[A-Za-z0-9]{20}$/.test(value) && /[A-Z]/.test(value);
}
