import type { Metadata } from 'next';
import MagazineReader from '@/components/web/magazine/MagazineReader';

export const metadata: Metadata = {
  title: 'Read Magazine | Prabasi Odia',
  description: 'Turn the pages of a Prabasi Odia magazine issue.',
};

export default async function MagazineIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MagazineReader issueId={id} />;
}
