import { redirect } from 'next/navigation';

export default function UrgentHelpOffersPage() {
  redirect('/admin/urgent-help?tab=offers');
}
