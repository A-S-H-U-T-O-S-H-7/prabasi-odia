'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, Bell, ChevronDown, 
  Home, Calendar, Users, Settings, HelpCircle 
} from 'lucide-react';
import { useAuthStore, useUserStore } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Zustand stores
  const { user, isAuthenticated, logout, loading, initialize } = useAuthStore();
  const { profile, hasJoinedCommunity, fetchUserProfile } = useUserStore();

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [isAuthenticated, user?.uid, fetchUserProfile]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    if (profile?.displayName) {
      return profile.displayName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (profile?.displayName) return profile.displayName;
    if (user?.displayName) return user.displayName;
    return 'User';
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/about', label: 'About' },
  ];

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-[#FFF8F2]/80 backdrop-blur-sm border-b border-[#E7D7E8]/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/logo.png"
                alt="Prabasi Odia"
                width={140}
                height={48}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFF8F2]/95 backdrop-blur-md shadow-lg border-b border-[#E7D7E8]'
          : 'bg-[#FFF8F2]/80 backdrop-blur-sm border-b border-[#E7D7E8]/50'
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/logo.png"
              alt="Prabasi Odia"
              width={140}
              height={48}
              className="h-16 w-auto transition-transform group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors text-sm font-medium relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6B1E5B] transition-all group-hover:w-full" />
              </Link>
            ))}

            {/* Show Login/Register when not authenticated and not loading */}
            {!isAuthenticated && !loading && (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-5 py-2 text-sm font-medium text-white bg-[#6B1E5B] hover:bg-[#531547] rounded-lg transition-all shadow-lg shadow-[#6B1E5B]/25 hover:shadow-[#6B1E5B]/40">
                    Register
                  </button>
                </Link>
              </div>
            )}

            {/* Show loading state */}
            {loading && (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
              </div>
            )}

            {/* CASE 2: Logged In + Not Joined - Show Join Free */}
            {isAuthenticated && !hasJoinedCommunity && !loading && (
              <div className="flex items-center space-x-4">
                <Link href="/join-community">
                  <button className="px-5 py-2 text-sm font-medium text-white bg-[#D9772B] hover:bg-[#B8621E] rounded-lg transition-all shadow-lg shadow-[#D9772B]/25 hover:shadow-[#D9772B]/40 animate-pulse-slow">
                    Join Free
                  </button>
                </Link>
              </div>
            )}

            {/* CASE 3: Logged In + Joined - Show Profile Dropdown */}
            {isAuthenticated && hasJoinedCommunity && !loading && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D9772B] rounded-full animate-pulse" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#E7D7E8]/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#6B1E5B] flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#6B5E5A]" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-52 bg-[#FFF8F2] rounded-lg shadow-lg border border-[#E7D7E8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-[#E7D7E8]">
                        <p className="text-sm font-semibold text-[#2C2420]">
                          {getUserDisplayName()}
                        </p>
                        {profile?.memberId && (
                          <p className="text-xs text-[#6B5E5A]">
                            Member ID: {profile.memberId}
                          </p>
                        )}
                        {profile?.isVerified && (
                          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <span>✅</span> Verified Member
                          </p>
                        )}
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#2C2420] hover:bg-[#E7D7E8]/30 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#2C2420] hover:bg-[#E7D7E8]/30 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      
                      <hr className="my-1 border-[#E7D7E8]" />
                      
                      <Link 
                        href="/help" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#2C2420] hover:bg-[#E7D7E8]/30 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4" />
                        Need Help?
                      </Link>
                      
                      <hr className="my-1 border-[#E7D7E8]" />
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#E7D7E8]/50 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#FFF8F2] border-b border-[#E7D7E8] overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon && <link.icon className="h-5 w-5" />}
                  <span>{link.label}</span>
                </Link>
              ))}

              <hr className="border-[#E7D7E8]" />

              {/* Mobile - Logged Out */}
              {!isAuthenticated && !loading && (
                <>
                  <Link
                    href="/login"
                    className="block text-center text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center bg-[#6B1E5B] text-white hover:bg-[#531547] rounded-lg py-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile - Loading */}
              {loading && (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Mobile - Logged In + Not Joined */}
              {isAuthenticated && !hasJoinedCommunity && !loading && (
                <Link
                  href="/join-community"
                  className="block text-center bg-[#D9772B] text-white hover:bg-[#B8621E] rounded-lg py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Join Free
                </Link>
              )}

              {/* Mobile - Logged In + Joined */}
              {isAuthenticated && hasJoinedCommunity && !loading && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/help"
                    className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Need Help?</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors py-2 w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}