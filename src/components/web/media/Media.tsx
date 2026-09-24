'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Link2, X } from 'lucide-react';
import { mediaService, type MediaItem } from '@/lib/services/mediaService';

type MediaTab = 'images' | 'videos' | 'links';

const tabs: { id: MediaTab; label: string }[] = [
  { id: 'images', label: 'Images' },
  { id: 'videos', label: 'Videos' },
  { id: 'links', label: 'Links' },
];

function isWebUrl(url: string) {
  try { return ['https:', 'http:'].includes(new URL(url).protocol); }
  catch { return false; }
}

export default function Media() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MediaTab>('images');
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const imageDialog = useRef<HTMLDialogElement>(null);
  const images = items.filter(item => item.kind === 'image');
  const videos = items.filter(item => item.kind === 'video');
  const validLinks = items.filter(item => item.kind === 'link' && isWebUrl(item.url));

  const load = async () => {
    setLoading(true); setLoadError(false);
    try { setItems(await mediaService.getItems()); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const dialog = imageDialog.current;
    if (!dialog) return;
    if (selectedImage && !dialog.open) dialog.showModal();
    if (!selectedImage && dialog.open) dialog.close();
  }, [selectedImage]);

  const selectTab = (tab: MediaTab, focus = false) => {
    setActiveTab(tab);
    if (focus) document.getElementById(`media-tab-${tab}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-2 text-sm text-[#6B5E5A] hover:text-[#6B1E5B]"><ArrowLeft className="h-4 w-4" /> Back</button>
        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#164A4A] px-6 py-7 text-white shadow-xl shadow-[#164A4A]/15 sm:px-10 sm:py-9 lg:py-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D9772B]/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#63B7AC]/25 blur-3xl" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#F4C875]">Community media</span>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Stories and connections, <span className="text-[#F4C875]">all in one place.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">Explore community images, videos and links as they are shared, and find more ways to connect with people who share your roots.</p>
          </div>
        </section>

        <section aria-labelledby="media-heading">
          <div className="mb-6">
            <h2 id="media-heading" className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Explore media</h2>
            <p className="mt-2 text-sm leading-6 text-[#6B5E5A]">Browse images, videos and useful links from the community.</p>
          </div>

          <div role="tablist" aria-label="Media categories" className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-[#E7D7E8] bg-white p-1.5 shadow-sm sm:inline-flex sm:gap-1">
            {tabs.map((tab, index) => <button key={tab.id} id={`media-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls="media-panel" tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => selectTab(tab.id)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
              if (next >= 0) { event.preventDefault(); selectTab(tabs[next].id, true); }
            }} className={`rounded-xl px-2 py-3 text-xs font-semibold transition-colors sm:min-w-32 sm:px-5 sm:text-sm ${activeTab === tab.id ? 'bg-[#6B1E5B] text-white shadow-sm' : 'text-[#6B5E5A] hover:bg-[#F7EFF5] hover:text-[#6B1E5B]'}`}>{tab.label}</button>)}
          </div>

          <div id="media-panel" role="tabpanel" aria-labelledby={`media-tab-${activeTab}`} tabIndex={0}>
            {loading && <EmptyState title="Loading media…" description="Please wait while the gallery loads." />}
            {!loading && loadError && <div className="rounded-2xl border border-[#E7D7E8] bg-white p-8 text-center"><p className="text-sm text-[#6B5E5A]">Media could not be loaded.</p><button type="button" onClick={() => void load()} className="mt-3 text-sm font-semibold text-[#6B1E5B]">Try again</button></div>}
            {!loading && !loadError && activeTab === 'images' && (images.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
              {images.map(image => <button key={image.id} type="button" onClick={() => setSelectedImage(image)} aria-label={`Open ${image.title || 'image'}`} className="group relative aspect-square overflow-hidden rounded-xl bg-[#E7D7E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
                <img src={image.url} alt={image.title || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </button>)}
            </div> : <EmptyState title="No images yet" description="Community images will appear here when they are available." />)}

            {!loading && !loadError && activeTab === 'videos' && (videos.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map(video => <div key={video.id} className="overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white shadow-sm">
                <video src={video.url} controls preload="metadata" className="aspect-video w-full bg-black" aria-label={video.title} />
                <p className="p-4 text-sm font-semibold text-[#2A1636]">{video.title}</p>
              </div>)}
            </div> : <EmptyState title="No videos yet" description="Community videos will appear here when they are available." />)}

            {!loading && !loadError && activeTab === 'links' && (validLinks.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {validLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-h-24 items-center gap-3 rounded-2xl border border-[#E7D7E8] bg-gradient-to-br from-[#FFF5EB] via-white to-[#F5EAF3] p-5 text-sm font-semibold leading-6 text-[#2A1636] shadow-sm transition-all hover:border-[#8A2E72]/40 hover:text-[#6B1E5B] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6B1E5B]/10 text-[#6B1E5B]"><Link2 className="h-4 w-4" /></span><span className="min-w-0 break-words">{link.title}</span></a>)}
            </div> : <EmptyState title="No links yet" description="Community links will appear here when they are available." />)}
          </div>
        </section>
      </div>

      <dialog ref={imageDialog} onClose={() => setSelectedImage(null)} onClick={event => { if (event.target === event.currentTarget) imageDialog.current?.close(); }} aria-label="Image viewer" className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,1100px)] max-w-none overflow-hidden rounded-2xl bg-[#24132f] p-0 shadow-2xl backdrop:bg-black/80">
        <button type="button" onClick={() => imageDialog.current?.close()} aria-label="Close image" className="absolute right-3 top-3 z-10 rounded-full bg-black/65 p-2 text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X className="h-5 w-5" /></button>
        {selectedImage && <img src={selectedImage.url} alt={selectedImage.title || 'Community image'} className="max-h-[90dvh] w-full object-contain" />}
      </dialog>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4C8C0] bg-white p-8 text-center">
    <h3 className="text-xl font-bold text-[#2A1636]">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-[#6B5E5A]">{description}</p>
  </div>;
}
