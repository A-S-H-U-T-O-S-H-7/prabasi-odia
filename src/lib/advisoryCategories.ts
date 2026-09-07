export const ADVISORY_CATEGORIES = [
  { value: 'patron', title: 'Patron Group', role: 'Patron' },
  { value: 'mentor', title: 'Mentor Council', role: 'Mentor' },
  { value: 'advisor', title: 'Advisory Board', role: 'Advisor' },
] as const;

export type AdvisoryCategory = typeof ADVISORY_CATEGORIES[number]['value'];

export function normalizeAdvisoryCategory(value: unknown): AdvisoryCategory {
  return value === 'patron' || value === 'mentor' ? value : 'advisor';
}

export function advisoryCategoryDetails(value: unknown) {
  return ADVISORY_CATEGORIES.find((category) => category.value === normalizeAdvisoryCategory(value))!;
}
