'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/web/layout/Navbar';
import Footer from '@/components/web/layout/Footer';
import EmergencyContactWidget from '@/components/web/EmergencyContactWidget';
import { TranslationProvider } from '@/components/web/translation/TranslationProvider';
import { usePathname } from 'next/navigation';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
