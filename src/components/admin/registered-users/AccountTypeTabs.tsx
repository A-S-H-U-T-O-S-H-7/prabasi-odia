'use client';

export type AccountTypeTab = 'all' | 'RO';

const tabs: { value: AccountTypeTab; label: string; activeClass: string }[] = [
  {
    value: 'all',
    label: 'All users',
    activeClass: 'border-[#6B1E5B] bg-[#6B1E5B] text-white',
  },
  {
    value: 'RO',
    label: 'Odisha residents (RO)',
    activeClass: 'border-violet-600 bg-violet-600 text-white',
  },
];

export default function AccountTypeTabs({
  value,
  onChange,
  allLabel = 'All users',
}: {
  value: AccountTypeTab;
  onChange: (value: AccountTypeTab) => void;
  allLabel?: string;
}) {
  return (
    <nav aria-label="Filter users by account type" className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={value === tab.value}
          className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            value === tab.value
              ? tab.activeClass
              : 'border-[#D4C8C0] bg-white text-[#6B5E5A] hover:border-[#6B1E5B]/50 hover:text-[#6B1E5B]'
          }`}
        >
          {tab.value === 'all' ? allLabel : tab.label}
        </button>
      ))}
    </nav>
  );
}
