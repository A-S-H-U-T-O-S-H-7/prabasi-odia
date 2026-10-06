import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OdishaPlaceDetail from '@/components/web/odisha-tourism/OdishaPlaceDetail';
import { detailedPlaces } from '@/components/web/odisha-tourism/placeDetails';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return detailedPlaces.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const place = detailedPlaces.find((entry) => entry.slug === slug);
  if (!place) return { title: 'Place not found | Explore Odisha' };

  return {
    title: `${place.name} | Explore Odisha | Prabasi Odia`,
    description: `${place.description} Discover things to do, nearby experiences, a map and ways to reach ${place.name}.`,
    openGraph: { title: `${place.name} | Explore Odisha`, description: place.description },
  };
}

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;
  const place = detailedPlaces.find((entry) => entry.slug === slug);
  if (!place) notFound();

  return <OdishaPlaceDetail place={place} />;
}
