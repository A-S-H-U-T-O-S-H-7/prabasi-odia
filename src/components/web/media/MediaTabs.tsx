'use client';

export type MediaTab = 'images' | 'videos' | 'links';

const tabs: { id: MediaTab; label: string }[] = [
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'links', label: 'Links' },
];

interface MediaTabsProps {
  activeTab: MediaTab;
  onSelect: (tab: MediaTab) => void;
}

export default function MediaTabs({ activeTab, onSelect }: MediaTabsProps) {
  const selectTab = (tab: MediaTab, focus = false) => {
    onSelect(tab);
    if (focus) document.getElementById(`media-tab-${tab}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Media categories"
      className="mb-6 grid grid-cols-3 gap-2 rounded-xl border border-[#E7D7E8] bg-white p-1.5 shadow-sm sm:inline-flex sm:gap-1"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`media-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls="media-panel"
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => selectTab(tab.id)}
          onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
              : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
              : event.key === 'Home' ? 0
              : event.key === 'End' ? tabs.length - 1 : -1;
            if (next >= 0) {
              event.preventDefault();
              selectTab(tabs[next].id, true);
            }
          }}
          className={`rounded-lg px-2 py-3 text-xs font-semibold transition-colors sm:min-w-32 sm:px-5 sm:text-sm ${activeTab === tab.id
            ? 'bg-[#6B1E5B] text-white shadow-sm'
            : 'text-[#6B5E5A] hover:bg-[#F7EFF5] hover:text-[#6B1E5B]'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
