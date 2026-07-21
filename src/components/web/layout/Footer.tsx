"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, MapPin, Heart } from "lucide-react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin 
} from "react-icons/fa";

const footerLinks = {
  Community: [
    { label: "Communities", href: "/communities" },
    { label: "Events", href: "/events" },
    { label: "About Us", href: "/about" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: FaFacebook, href: "https://facebook.com", label: "Facebook", color: "#1877F2" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", color: "#E4405F" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", color: "#1DA1F2" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube", color: "#FF0000" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn", color: "#0A66C2" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2A1636] text-white/80">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-white.png"
                alt="Prabasi Odia"
                width={160}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white/50 mt-4 max-w-xs leading-relaxed">
              Connecting Odias worldwide through culture, community, 
              and meaningful connections.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
              <Heart className="w-4 h-4 text-[#D9772B]" />
              <span>Made with love for the Odia community</span>
            </div>
          </div>

          {/* Quick Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/50">
                <Mail className="w-4 h-4 text-[#D9772B]" />
                <span>hello@prabasiodia.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/50">
                <MapPin className="w-4 h-4 text-[#D9772B]" />
                <span>Bhubaneswar, Odisha, India</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <p className="text-sm text-white/50 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.05 }}
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#6B1E5B] flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} Prabasi Odia. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}