'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, User, LogOut, Bell, ChevronDown, 
  Home, Calendar, Users, Settings, HelpCircle, MapPin 
} from 'lucide-react';
import { useAuthStore, useUserStore } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { user, isAuthenticated, logout, loading, initialize } = useAuthStore();
  const { profile, hasJoinedCommunity, fetchUserProfile } = useUserStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [isAuthenticated, user?.uid, fetchUserProfile]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (profile?.displayName) return profile.displayName.charAt(0).toUpperCase();
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
    { href: '/advisory-board', label: 'Advisory Board' },
    { href: '/associates', label: 'Associates' },
    { href: '/partners', label: 'Partners' },
    { href: '/about', label: 'About' },
  ];
  const donateHref = isAuthenticated ? '/donation' : '/signup';

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-[#FFF8F2]/80 backdrop-blur-sm border-b border-[#E7D7E8]/50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative bg-gray-200 rounded-full animate-pulse" />
              <div className="w-32 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
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
      <div className="max-w-8xl mx-auto px-3 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left: Prabasi Odia Logo + Divider + Parent Org Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prabasi Odia Logo - Independent, no border */}
            <Link href="/" aria-label="Go to home page" className="flex-shrink-0 relative group">
              <div className="w-18 h-18 md:w-26 md:h-26 relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Prabasi Odia Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -inset-2 bg-[#6B1E5B]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>

            {/* Divider — visible on all screen sizes */}
            <div className="flex flex-col items-center self-stretch py-1 sm:py-2">
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-[#D4C8C0] to-transparent"></div>
            </div>

            {/* Parent Org Logo — visible on all screen sizes */}
            <a
              href="https://svsamiti.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 group hover:opacity-80 transition-opacity flex-shrink-0"
              title="Visit Samudayik Vikas Samiti"
            >
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-amber-200 shadow-sm group-hover:shadow-md group-hover:border-amber-400 transition-all duration-300 group-hover:scale-105 flex-shrink-0">
                <Image
                  src="/svslogo.png"
                  alt="Samudayik Vikas Samiti"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-800 group-hover:text-amber-900 transition-colors whitespace-nowrap">
                  Samudayik Vikas
                </span>
                <span className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-800 group-hover:text-amber-900 transition-colors whitespace-nowrap -mt-0.5">
                  Samiti
                </span>
                <span className="text-[5px] xs:text-[6px] sm:text-[7px] md:text-[8px] text-amber-500 group-hover:text-amber-600 transition-colors hidden lg:block">
                  svsamiti.com
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
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
            <Link
              href="/map"
              aria-label="Member Map"
              title="Member Map"
              className="relative w-8 h-8 flex-shrink-0 transition-transform duration-200 hover:scale-110"
            >
              <Image
                src="/mapicon.png"
                alt="Member Map"
                fill
                className="object-contain"
              />
            </Link>

            {!loading && (
              <Link href={donateHref}>
                <button className="px-5 py-2 text-sm font-semibold text-white bg-[#D9772B] hover:bg-[#B8621E] rounded-lg transition-all shadow-lg shadow-[#D9772B]/25 hover:shadow-[#D9772B]/40">
                  Donate
                </button>
              </Link>
            )}

            {!isAuthenticated && !loading && (
              <div className="flex items-center space-x-3">
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

            {loading && (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
              </div>
            )}

            {isAuthenticated && !hasJoinedCommunity && !loading && (
              <div className="flex items-center space-x-4">
                <Link href="/join-community">
                  <button className="px-5 py-2 text-sm font-medium text-white bg-[#D9772B] hover:bg-[#B8621E] rounded-lg transition-all shadow-lg shadow-[#D9772B]/25 hover:shadow-[#D9772B]/40 animate-pulse-slow">
                    Join Free
                  </button>
                </Link>
              </div>
            )}

            {isAuthenticated && hasJoinedCommunity && !loading && (
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D9772B] rounded-full animate-pulse" />
                </button>

                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#E7D7E8]/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#6B1E5B] flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#6B5E5A]" />
                  </button>

                  <div className="absolute right-0 mt-2 w-52 bg-[#FFF8F2] rounded-lg shadow-lg border border-[#E7D7E8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
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
                        href="/map" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#2C2420] hover:bg-[#E7D7E8]/30 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <MapPin className="h-4 w-4" />
                        Member Map
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
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            <div className="px-4 py-4 space-y-3">
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
              <Link
                href="/map"
                className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                <span className="relative w-6 h-6 flex-shrink-0">
                  <Image
                    src="/mapicon.png"
                    alt="Member Map"
                    fill
                    className="object-contain"
                  />
                </span>
                <span>Member Map</span>
              </Link>

              {!loading && (
                <Link
                  href={donateHref}
                  className="block text-center bg-[#D9772B] text-white hover:bg-[#B8621E] rounded-lg py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Donate
                </Link>
              )}

              <hr className="border-[#E7D7E8]" />

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

              {loading && (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {isAuthenticated && !hasJoinedCommunity && !loading && (
                <Link
                  href="/join-community"
                  className="block text-center bg-[#D9772B] text-white hover:bg-[#B8621E] rounded-lg py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Join Free
                </Link>
              )}

              {isAuthenticated && hasJoinedCommunity && !loading && (
                <>
                  <div className="flex items-center gap-3 px-2 py-2 bg-[#E7D7E8]/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#6B1E5B] flex items-center justify-center text-white font-semibold text-sm">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2C2420]">
                        {getUserDisplayName()}
                      </p>
                      {profile?.memberId && (
                        <p className="text-xs text-[#6B5E5A]">
                          ID: {profile.memberId}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-[#6B5E5A] hover:text-[#6B1E5B] transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
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