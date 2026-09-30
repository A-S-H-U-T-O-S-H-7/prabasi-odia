import UrgentHelpAdminTabs from '@/components/admin/urgent-help/UrgentHelpAdminTabs';

export default async function UrgentHelpAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  return <UrgentHelpAdminTabs initialTab={tab === 'offers' ? 'offers' : 'requests'} />;
}
