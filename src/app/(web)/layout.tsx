'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/web/layout/Navbar';
import Footer from '@/components/web/layout/Footer';
import EmergencyContactWidget from '@/components/web/EmergencyContactWidget';
import { TranslationProvider } from '@/components/web/translation/TranslationProvider';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const blockKeyboardZoom = (event: KeyboardEvent) => {
      if (event.ctrlKey && ["+", "-", "=", "0"].includes(event.key)) event.preventDefault();
    };
    const blockPinchZoom = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    const blockGestureZoom = (event: Event) => event.preventDefault();

    window.addEventListener("keydown", blockKeyboardZoom);
    window.addEventListener("wheel", blockPinchZoom, { passive: false });
    document.addEventListener("gesturestart", blockGestureZoom, { passive: false });
    document.addEventListener("gesturechange", blockGestureZoom, { passive: false });
    document.addEventListener("gestureend", blockGestureZoom, { passive: false });

    return () => {
      window.removeEventListener("keydown", blockKeyboardZoom);
      window.removeEventListener("wheel", blockPinchZoom);
      document.removeEventListener("gesturestart", blockGestureZoom);
      document.removeEventListener("gesturechange", blockGestureZoom);
      document.removeEventListener("gestureend", blockGestureZoom);
    };
  }, []);

  return (
    <TranslationProvider>
      <div data-translation-root className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <motion.main className="flex-1 pt-16">
          {children}
        </motion.main>
        <Footer/>
      </div>
      {/* Outside translation root so open/close is never rewritten by translator */}
      {pathname !== '/join-community' && <EmergencyContactWidget />}
    </TranslationProvider>
  );
}
