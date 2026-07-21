"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, verifySession } = useAdminAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await verifySession();
      setIsInitialized(true);
    };
    initAuth();
  }, [verifySession]);

  useEffect(() => {
    if (isInitialized && !loading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isInitialized, loading, isAuthenticated, pathname, router]);

  // Only show on /admin/login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading || !isInitialized) {
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
    <div className="min-h-screen bg-[#FFF9F2]">
      <AdminSidebar />
      <div className="lg:pl-60">
        <AdminHeader />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}