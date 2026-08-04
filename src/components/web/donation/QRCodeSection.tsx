"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { QrCode, Download } from 'lucide-react';

export default function QRCodeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-4 md:p-6 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-[#6B1E5B]" />
        <h3 className="text-lg font-bold text-[#2A1636]">Quick Donation</h3>
      </div>

      <div className="bg-gradient-to-br from-[#F7F1EA] to-white rounded-xl p-4 border border-[#D4C8C0]/20">
        <div className="relative w-40 h-48 sm:w-48 sm:h-56 mx-auto">
          <Image
            src="/donationqr.jpg"
            alt="Donation QR Code"
            fill
            className="object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.getElementById('qr-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            id="qr-fallback"
            className="hidden w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex-col items-center justify-center"
          >
            <QrCode className="w-16 h-16 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">QR Code</p>
          </div>
        </div>

        <p className="text-sm text-[#6B5E5A] mt-3">Scan to donate instantly via UPI</p>

        <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B1E5B]/5 text-[#6B1E5B] text-sm font-medium hover:bg-[#6B1E5B]/10 transition-colors">
          <Download className="w-4 h-4" />
          Download QR
        </button>
      </div>
    </motion.div>
  );
}