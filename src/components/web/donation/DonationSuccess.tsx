"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Heart, Home, User, Mail, 
  Download, Share2, ArrowRight, Clock, Shield,
  Calendar, IndianRupee, Building2, FileText
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DonationSuccessProps {
  donationData?: {
    id: string;
    amount: number;
    donorName: string;
    email: string;
    transactionId?: string;
    date?: string;
    status?: string;
  };
}

export default function DonationSuccess({ donationData }: DonationSuccessProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [showDetails, setShowDetails] = useState(false);

  // Default data if not provided
  const data = donationData || {
    id: 'DN' + Date.now(),
    amount: 1000,
    donorName: 'Anonymous Donor',
    email: 'donor@email.com',
    transactionId: 'TXN' + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    status: 'completed'
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDownloadReceipt = () => {
    // Simulate download
    const receipt = document.createElement('div');
    receipt.innerHTML = `
      <div style="font-family: 'Georgia', serif; padding: 40px; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #E7D7E8;">
        <h1 style="color: #6B1E5B; text-align: center;">Prabasi Odia</h1>
        <h2 style="color: #2A1636; text-align: center; margin-bottom: 20px;">Donation Receipt</h2>
        <hr style="border: 1px solid #E7D7E8; margin: 20px 0;">
        <p><strong>Donation ID:</strong> ${data.id}</p>
        <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
        <p><strong>Donor:</strong> ${data.donorName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <hr style="border: 1px solid #E7D7E8; margin: 20px 0;">
        <p style="text-align: center; color: #6B5E5A; font-size: 14px;">
          This donation is eligible for 80G tax exemption.<br>
          Thank you for your support!
        </p>
      </div>
    `;
    
    const blob = new Blob([receipt.innerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-receipt-${data.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative py-8 md:py-12 px-4"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#6B1E5B]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#D9772B]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#E8B84C]/5 blur-2xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.3, 
            type: "spring", 
            stiffness: 200, 
            damping: 20 
          }}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] flex items-center justify-center mx-auto shadow-2xl shadow-[#6B1E5B]/30"
        >
          <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-4 border-[#D9772B]/30"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-full border-4 border-[#6B1E5B]/20"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-3xl md:text-4xl font-serif font-bold text-[#2A1636] text-center"
        >
          Thank You for Your Donation! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-base md:text-lg text-[#6B5E5A] text-center max-w-lg mx-auto"
        >
          Your generosity will help empower Odias worldwide and create lasting impact.
        </motion.p>

        {/* Donation Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-6 md:p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2A1636]">Donation Summary</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
              ✅ Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Amount</span>
                <span className="ml-auto font-bold text-[#2A1636]">₹{data.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Donor</span>
                <span className="ml-auto font-medium text-[#2A1636]">{data.donorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Email</span>
                <span className="ml-auto font-medium text-[#2A1636]">{data.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Date</span>
                <span className="ml-auto font-medium text-[#2A1636]">{data.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Transaction ID</span>
                <span className="ml-auto font-mono text-xs text-[#2A1636]">{data.transactionId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#6B1E5B]" />
                <span className="text-[#6B5E5A]">Status</span>
                <span className="ml-auto font-medium text-green-600">✓ Completed</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#D4C8C0]/20">
            <p className="text-xs text-[#6B5E5A] flex items-center justify-center gap-1.5">
              <span className="text-[#D9772B]">📋</span>
              This donation is eligible for <span className="font-semibold text-[#2A1636]">80G Tax Exemption</span>
            </p>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/50"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">What happens next?</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-amber-700/80">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>You will receive a confirmation email within 10 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-700/80">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Tax exemption certificate will be emailed within 7 business days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-700/80">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Your contribution will support Odia community programs</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
        >
          <button
            onClick={handleDownloadReceipt}
            className="px-6 py-3 rounded-xl bg-white/80 border border-[#6B1E5B]/20 text-[#6B1E5B] font-medium hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          
          <Link href="/">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-medium hover:shadow-xl shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:scale-[1.02]">
              <Home className="w-4 h-4" />
              Go to Home
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-[#6B5E5A] mb-3 flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            Share your support
          </p>
          <div className="flex items-center justify-center gap-2">
            {[
              { icon: '🐦', label: 'Twitter', color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]' },
              { icon: '💼', label: 'LinkedIn', color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]' },
              { icon: '💬', label: 'WhatsApp', color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]' },
            ].map((social, index) => (
              <button
                key={index}
                className={`p-2 rounded-full bg-white/50 border border-[#D4C8C0]/30 text-[#6B5E5A] transition-all duration-300 ${social.color} hover:scale-110`}
                onClick={() => {
                  const text = `I just donated to Prabasi Odia! Join me in supporting the Odia community. 🌟`;
                  const url = window.location.origin;
                  let shareUrl = '';
                  if (social.label === 'Twitter') {
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                  } else if (social.label === 'LinkedIn') {
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
                  } else if (social.label === 'WhatsApp') {
                    shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
                  }
                  window.open(shareUrl, '_blank');
                }}
              >
                <span className="text-base">{social.icon}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Auto Redirect */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-xs text-[#6B5E5A]/50 flex items-center justify-center gap-1.5"
        >
          <Clock className="w-3 h-3" />
          Redirecting to home in {countdown}s...
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-[#6B1E5B]"
          />
        </motion.p>

        {/* Floating Hearts */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [-20, -60, -100],
              opacity: [0, 1, 0],
              x: [i * 20 - 20, i * 30 - 30, i * 20 - 20]
            }}
            transition={{ 
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
            className="absolute pointer-events-none"
            style={{ 
              left: `${30 + i * 20}%`,
              top: `${20 + i * 10}%`
            }}
          >
            <Heart className={`w-4 h-4 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-purple-400' : 'text-pink-400'}`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}