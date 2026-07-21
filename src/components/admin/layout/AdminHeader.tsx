"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";

export default function AdminHeader() {
  const router = useRouter();
  const { admin, adminLogout } = useAdminAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    setDropdownOpen(false);
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-30 lg:left-64 bg-white/95 backdrop-blur-md border-b border-[#E7D7E8] transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-end gap-4">
          {/* Date & Time */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF9F2] border border-[#E7D7E8]/50">
            <span className="text-sm font-medium text-[#6B5E5A]">
              {format(currentTime, "EEEE, MMMM d, yyyy • h:mm a")}
            </span>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF9F2] border border-[#E7D7E8]/50 hover:bg-[#6B1E5B]/5 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white text-xs font-bold">
                {admin?.name?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#2A1636]">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-xs text-[#6B5E5A]">
                  {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#6B5E5A] transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border border-[#E7D7E8] bg-white z-50">
                <div className="px-4 py-3 border-b border-[#E7D7E8]">
                  <p className="text-sm font-medium text-[#2A1636]">
                    {admin?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-[#6B5E5A] mt-0.5">{admin?.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3 text-[#6B1E5B]" />
                    <span className="text-[10px] font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-2 py-0.5 rounded-full">
                      {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}