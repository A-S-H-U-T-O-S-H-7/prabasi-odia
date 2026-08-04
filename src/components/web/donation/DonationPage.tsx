"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import DonationBanner from './DonationBanner';
import DonationForm from './DonationForm';
import BankDetails from './BankDetails';
import QRCodeSection from './QRCodeSection';

export default function DonationPage() {
  const [donorType, setDonorType] = useState<'indian' | 'foreign'>('indian');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] via-white to-[#FFF0EB] py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <DonationBanner />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form - 3 columns on desktop */}
          <div className="lg:col-span-3">
            <DonationForm donorType={donorType} setDonorType={setDonorType} />
          </div>

          {/* Right Side - QR & Bank Details - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <QRCodeSection />
            <BankDetails donorType={donorType} />
          </div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs text-[#6B5E5A]"
        >
          <p>All donations are eligible for 80G tax exemption under section 80G of the Income Tax Act, 1961.</p>
          <p className="mt-1">For any queries, please contact us at <a href="mailto:info@prabasiodia.org" className="text-[#6B1E5B] hover:underline">info@prabasiodia.org</a></p>
        </motion.div>
      </div>
    </div>
  );
}