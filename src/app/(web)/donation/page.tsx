"use client";

import DonationPage from '@/components/web/donation/DonationPage';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

function page() {
  const router = useRouter();
  const { isAuthenticated, loading, initialize } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/signup');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2]">
        <Loader2 className="w-8 h-8 text-[#6B1E5B] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <DonationPage/>
    </div>
  )
}

export default page
