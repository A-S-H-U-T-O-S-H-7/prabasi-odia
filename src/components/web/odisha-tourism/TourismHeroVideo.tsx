'use client';

import { useState } from 'react';

const INTRO_END_SECONDS = 3.2;

export default function TourismHeroVideo() {
  const [ready, setReady] = useState(false);

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:hidden ${ready ? 'opacity-100' : 'opacity-0'}`}
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster="/tourism/konark-hero.webp"
      aria-hidden="true"
      tabIndex={-1}
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        if (video.duration <= INTRO_END_SECONDS + 0.25) {
          video.pause();
          return;
        }
        video.currentTime = INTRO_END_SECONDS;
      }}
      onSeeked={(event) => {
        if (event.currentTarget.currentTime >= INTRO_END_SECONDS - 0.1) setReady(true);
      }}
      onEnded={(event) => {
        const video = event.currentTarget;
        video.currentTime = INTRO_END_SECONDS;
        void video.play().catch(() => {});
      }}
      onError={() => setReady(false)}
    >
      <source src="/Odisha_Hero_Banner.mp4" type="video/mp4" />
    </video>
  );
}
