import type { Metadata } from 'next';
import TripsExplorer from '@/components/web/odisha-tourism/TripsExplorer';

export const metadata: Metadata = {
  title: 'Odisha Trips & Itineraries | Prabasi Odia',
  description: 'Explore 30 suggested Odisha itineraries with routes, overnight stays and filters for interests, duration and districts.',
};

export default function OdishaTripsPage() {
  return <TripsExplorer />;
}
