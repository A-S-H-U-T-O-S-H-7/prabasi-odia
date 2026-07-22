"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Megaphone,
  Settings,
  Menu,
  X,
  Shield,
  Eye,
} from "lucide-react";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";

const navigationItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Communities", href: "/admin/communities", icon: Building2 },
  { name: "Events", href: "/admin/events", icon: CalendarDays },
  { name: "Notices", href: "/admin/notices", icon: Megaphone },
    { name: "Contacts", href: "/admin/contact", icon: Megaphone },
  { name: "Partners", href: "/admin/partners", icon: Megaphone },
  { name: "testimonials", href: "/admin/testimonials", icon: Megaphone },
  { name: "Admin Management", href: "/admin/admins", icon: Shield },
  { name: "Activity Logs", href: "/admin/activity", icon: Eye },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin } = useAdminAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isSuperAdmin = admin?.role === "super_admin";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Filter navigation based on permissions
  const filteredNavItems = navigationItems.filter((item) => {
    if (isSuperAdmin) return true;
    // For regular admins, check permissions
    const permissions = admin?.permissions || [];
    if (item.name === "Dashboard") return true;
    if (item.name === "Users" && permissions.includes("users")) return true;
    if (item.name === "Communities" && permissions.includes("communities")) return true;
    if (item.name === "Events" && permissions.includes("events")) return true;
    if (item.name === "Notices" && permissions.includes("notices")) return true;
    if (item.name === "Settings" && permissions.includes("settings")) return true;
    return false;
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-white shadow-lg border border-[#D4C8C0]/30 hover:bg-[#6B1E5B]/5 transition-all duration-300"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-[#2A1636]" /> : <Menu className="w-5 h-5 text-[#2A1636]" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col bg-white border-r border-[#E7D7E8] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E7D7E8]">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 w-full"
          >
            <Image
              src="/logo.png"
              alt="Prabasi Odia"
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="text-xs font-medium text-[#6B5E5A] bg-[#6B1E5B]/5 px-2 py-0.5 rounded-full border border-[#E7D7E8]">
              Admin
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-5 py-3 border-b border-[#E7D7E8] bg-gradient-to-r from-[#6B1E5B]/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white text-sm font-bold">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2A1636] truncate">
                {admin?.name || "Admin"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B5E5A]">
                  {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
                {isSuperAdmin && (
                  <span className="text-[8px] font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-1.5 py-0.5 rounded-full">
                    ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#6B1E5B] to-[#8A2E72] text-white shadow-md shadow-[#6B1E5B]/20"
                      : "text-[#6B5E5A] hover:bg-[#6B1E5B]/5 hover:text-[#2A1636]"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="mt-4 pt-4 border-t border-[#E7D7E8]">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6B5E5A] hover:bg-[#6B1E5B]/5 hover:text-[#2A1636] transition-all duration-200"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}