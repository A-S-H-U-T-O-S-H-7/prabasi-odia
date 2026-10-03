import type { Metadata } from 'next';
import OdishaTourism from '@/components/web/odisha-tourism/OdishaTourism';

export const metadata: Metadata = {
  title: 'Explore Odisha | Prabasi Odia',
  description: 'Explore Odisha’s top attractions, road trips, cuisine, Adivasi heritage, culture and themed trails with Prabasi Odia.',
};

export default function OdishaTourismPage() {
  return <OdishaTourism />;
}
