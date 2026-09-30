'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, Users } from 'lucide-react';
import AdminUrgentHelp from './UrgentHelp';
import HelperOffers from './HelperOffers';

type Tab = 'requests' | 'offers';

export default function UrgentHelpAdminTabs({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const selectTab = (next: Tab) => {
    setTab(next);
    router.replace(
      next === 'offers' ? '/admin/urgent-help?tab=offers' : '/admin/urgent-help',
      { scroll: false }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#B45337]">
          Community support
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#2A1636] sm:text-3xl">
          Urgent Help
        </h1>
        <p className="mt-2 text-sm text-[#6B5E5A]">
          Review urgent requests and coordinate with people who offered to help.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Urgent help administration"
        className="mb-6 flex w-fit max-w-full gap-1 rounded-2xl border border-[#E7D7E8] bg-white p-1.5 shadow-sm"
      >
        <button
          id="urgent-requests-tab"
          type="button"
          role="tab"
          aria-controls="urgent-admin-panel"
          aria-selected={tab === 'requests'}
          onClick={() => selectTab('requests')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
            tab === 'requests'
              ? 'bg-[#B45337] text-white shadow-sm'
              : 'text-[#6B5E5A] hover:bg-[#FFF0EA]'
          }`}
        >
          <HeartHandshake size={16} />
          Requests
        </button>
        <button
          id="urgent-offers-tab"
          type="button"
          role="tab"
          aria-controls="urgent-admin-panel"
          aria-selected={tab === 'offers'}
          onClick={() => selectTab('offers')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:px-5 ${
            tab === 'offers'
              ? 'bg-[#B45337] text-white shadow-sm'
              : 'text-[#6B5E5A] hover:bg-[#FFF0EA]'
          }`}
        >
          <Users size={16} />
          Helper Offers
        </button>
      </div>

      <div
        id="urgent-admin-panel"
        role="tabpanel"
        aria-labelledby={tab === 'requests' ? 'urgent-requests-tab' : 'urgent-offers-tab'}
      >
        {tab === 'requests' ? <AdminUrgentHelp embedded /> : <HelperOffers embedded />}
      </div>
    </div>
  );
}
