"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Calendar,
  CreditCard,
  Hash,
  Heart,
} from "lucide-react";
import { DonationData } from "@/lib/services/donationService";

interface DonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: DonationData | null;
}

function formatDate(value: any): string {
  if (!value) return "—";
  try {
    const date = value?.toDate?.() ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(status: DonationData["status"]) {
  switch (status) {
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending Payment";
  }
}

export default function DonationDetailModal({
  isOpen,
  onClose,
  donation,
}: DonationDetailModalProps) {
  if (!donation) return null;

  const donor = donation.donorDetails || ({} as DonationData["donorDetails"]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 z-50 overflow-hidden"
          >
            <div className="h-full bg-[#FFF9F2] rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7D7E8] bg-white/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6B1E5B]/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-[#6B1E5B]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#2A1636]">Donation Details</h2>
                    <p className="text-sm text-[#6B5E5A]">
                      {statusLabel(donation.status)} • {formatDate(donation.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-[#6B1E5B]/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#6B5E5A]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <IndianRupee className="w-4 h-4" />
                      <span>Amount</span>
                    </div>
                    <p className="text-xl font-bold text-[#2A1636]">
                      ₹{Number(donation.amount || 0).toLocaleString("en-IN")}{" "}
                      <span className="text-sm font-medium text-[#6B5E5A]">
                        {donation.currency || "INR"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <Hash className="w-4 h-4" />
                      <span>Donation ID</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636] break-all">
                      {donation.donationId || donation.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <User className="w-4 h-4" />
                      <span>Donor Name</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636]">{donor.name || "—"}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    {donor.email ? (
                      <a
                        href={`mailto:${donor.email}`}
                        className="text-base font-semibold text-[#6B1E5B] hover:underline break-all"
                      >
                        {donor.email}
                      </a>
                    ) : (
                      <p className="text-base font-semibold text-[#2A1636]">—</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <Phone className="w-4 h-4" />
                      <span>Mobile</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636]">{donor.mobile || "—"}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636]">
                      {[donor.city, donor.state, donor.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>

                {donor.address && (
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>Address</span>
                    </div>
                    <p className="text-[#2A1636] leading-relaxed">
                      {donor.address}
                      {donor.pincode ? ` — ${donor.pincode}` : ""}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <Heart className="w-4 h-4" />
                      <span>Purpose</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636]">
                      {donation.purpose || "—"}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-[#E7D7E8]/50">
                    <div className="flex items-center gap-2 text-sm text-[#6B5E5A] mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span>Payment</span>
                    </div>
                    <p className="text-base font-semibold text-[#2A1636]">
                      {donation.paymentGateway || "—"}
                      {donation.transactionId ? ` • ${donation.transactionId}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#6B5E5A]/60 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created: {formatDate(donation.createdAt)}
                  </span>
                  {donation.completedAt && (
                    <span>Completed: {formatDate(donation.completedAt)}</span>
                  )}
                  <span className="capitalize">
                    Donor type: {donation.donorType || donor.donorType || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-[#E7D7E8] flex-shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#2A1636] hover:bg-[#E5DDD8]"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
