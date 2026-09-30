'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { mediaService, type MediaItem } from '@/lib/services/mediaService';
import MediaGallery from './MediaGallery';
import MediaHero from './MediaHero';
import MediaTabs, { type MediaTab } from './MediaTabs';

export default function Media() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MediaTab>('images');
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const imageDialog = useRef<HTMLDialogElement>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setItems(await mediaService.getItems());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const dialog = imageDialog.current;
    if (!dialog) return;
    if (selectedImage && !dialog.open) dialog.showModal();
    if (!selectedImage && dialog.open) dialog.close();
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-2 py-3 sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#6B5E5A] transition-colors hover:text-[#6B1E5B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <MediaHero totalItems={items.length} loading={loading || loadError} />

        <section aria-labelledby="media-heading">
          <div className="mb-6">
            <h2 id="media-heading" className="text-2xl font-bold text-[#2A1636]">
              Explore media
            </h2>
            <p className="mt-2 text-sm text-[#6B5E5A]">
              Browse images, videos and useful links from the community.
            </p>
          </div>

          <MediaTabs activeTab={activeTab} onSelect={setActiveTab} />
          <MediaGallery
            activeTab={activeTab}
            items={items}
            loading={loading}
            loadError={loadError}
            onRetry={() => void load()}
            onSelectImage={setSelectedImage}
          />
        </section>
      </div>

      <dialog
        ref={imageDialog}
        onClose={() => setSelectedImage(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) imageDialog.current?.close();
        }}
        aria-label="Image viewer"
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,1100px)] max-w-none overflow-hidden rounded-2xl bg-[#24132f] p-0 shadow-2xl backdrop:bg-black/80"
      >
        <button
          type="button"
          onClick={() => imageDialog.current?.close()}
          aria-label="Close image"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/65 p-2 text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" />
        </button>
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={selectedImage.title || 'Community image'}
            className="max-h-[90dvh] w-full object-contain"
          />
        )}
      </dialog>
    </div>
  );
}
