'use client';

import { Link2, Loader2 } from 'lucide-react';
import type { MediaItem } from '@/lib/services/mediaService';
import type { MediaTab } from './MediaTabs';

interface MediaGalleryProps {
  activeTab: MediaTab;
  items: MediaItem[];
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  onSelectImage: (image: MediaItem) => void;
}

function isWebUrl(url: string) {
  try {
    return ['https:', 'http:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export default function MediaGallery({
  activeTab,
  items,
  loading,
  loadError,
  onRetry,
  onSelectImage,
}: MediaGalleryProps) {
  const images = items.filter((item) => item.kind === 'image');
  const videos = items.filter((item) => item.kind === 'video');
  const links = items.filter((item) => item.kind === 'link' && isWebUrl(item.url));

  return (
    <div id="media-panel" role="tabpanel" aria-labelledby={`media-tab-${activeTab}`} tabIndex={0}>
      {loading ? (
        <div role="status" className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-[#E7D7E8] bg-white text-sm text-[#6B5E5A]">
          <Loader2 className="h-6 w-6 animate-spin text-[#6B1E5B]" />
          Loading media...
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center">
          <p className="text-sm text-red-600">Media could not be loaded.</p>
          <button type="button" onClick={onRetry} className="mt-4 text-sm font-semibold text-[#6B1E5B]">
            Try again
          </button>
        </div>
      ) : activeTab === 'images' ? (
        images.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelectImage(image)}
                aria-label={`Open ${image.title || 'image'}`}
                className="group aspect-square overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white shadow-sm transition hover:shadow-xl hover:shadow-[#6B1E5B]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"
              >
                <img src={image.url} alt={image.title || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </button>
            ))}
          </div>
        ) : <EmptyState title="No images yet" description="Community images will appear here when they are available." />
      ) : activeTab === 'videos' ? (
        videos.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white shadow-sm">
                <video src={video.url} controls preload="metadata" className="aspect-video w-full bg-black" aria-label={video.title} />
                <p className="p-5 text-sm font-semibold text-[#2A1636]">{video.title}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No videos yet" description="Community videos will appear here when they are available." />
      ) : (
        links.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-24 items-center gap-3 rounded-2xl border border-[#E7D7E8] bg-white p-5 text-sm font-semibold leading-6 text-[#2A1636] shadow-sm transition hover:text-[#6B1E5B] hover:shadow-xl hover:shadow-[#6B1E5B]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4E8F1] text-[#6B1E5B]">
                  <Link2 className="h-5 w-5" />
                </span>
                <span className="min-w-0 break-words">{link.title}</span>
              </a>
            ))}
          </div>
        ) : <EmptyState title="No links yet" description="Community links will appear here when they are available." />
      )}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4C8C0] bg-white p-8 text-center">
      <h3 className="text-xl font-bold text-[#2A1636]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#6B5E5A]">{description}</p>
    </div>
  );
}
