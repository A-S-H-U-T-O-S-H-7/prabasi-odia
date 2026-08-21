"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import useAdminAuthStore from "@/lib/store/useAdminAuthStore";
import { getSafeAdminRedirect } from "@/lib/admin/redirect";
import Image from "next/image";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeAdminRedirect(searchParams.get("redirect"));
  const { adminLogin, isAuthenticated } = useAdminAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsRedirecting(true);
      router.replace(nextPath);
    }
  }, [isAuthenticated, nextPath, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    const result = await adminLogin(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Welcome back, Admin!");
      setIsRedirecting(true);
      router.replace(nextPath);
      return;
    }

    toast.error(result.error || "Login failed. Please try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F2] via-white to-[#FDE8D0]/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Prabasi Odia"
              width={180}
              height={60}
              className="h-14 w-auto mx-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <h2 className="text-xl font-semibold text-[#2A1636] mt-3">
            Admin Panel
          </h2>
          <p className="text-sm text-[#6B5E5A]">Sign in to manage your community</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_60px_rgba(107,30,91,0.08)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-[#2A1636] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
                  placeholder="admin@prabasiodia.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-[#2A1636] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E5A]/40 hover:text-[#6B1E5B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting || isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRedirecting ? "Redirecting..." : "Signing in..."}
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#6B5E5A]/50 mt-6">
          Protected by Prabasi Odia Admin Security
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2]">
          <Loader2 className="w-8 h-8 text-[#6B1E5B] animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
