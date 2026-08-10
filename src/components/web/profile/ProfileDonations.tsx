"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Loader2,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock3,
  Ban,
  Receipt,
  CreditCard,
} from "lucide-react";
import { donationService, DonationData } from "@/lib/services/donationService";

interface ProfileDonationsProps {
  userId: string;
}

function formatDate(value: any): string {
  if (!value) return "—";
  try {
    const date = value?.toDate?.() ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusMeta(status: DonationData["status"]) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
      };
    case "failed":
      return {
        label: "Failed",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Ban,
      };
    default:
      return {
        label: "Pending",
        className: "bg-[#D9772B]/10 text-[#D9772B] border-[#D9772B]/20",
        icon: Clock3,
      };
  }
}

export default function ProfileDonations({ userId }: ProfileDonationsProps) {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await donationService.getUserDonations(userId);
        if (cancelled) return;
        if (!result.success) {
          setError(result.error || "Failed to load donations");
          setDonations([]);
          return;
        }
        setDonations(result.donations || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load donations");
          setDonations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (userId) load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const totals = useMemo(() => {
    const completed = donations.filter((d) => d.status === "completed");
    const totalAmount = completed.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    return {
      count: completed.length,
      totalAmount,
      allCount: donations.length,
    };
  }, [donations]);

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-10 shadow-sm flex flex-col items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#6B1E5B] animate-spin" />
        <p className="text-sm text-[#6B5E5A] mt-3">Loading your donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#6B1E5B]/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-[#6B1E5B]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2A1636]">No donations yet</h3>
        <p className="text-sm text-[#6B5E5A] mt-2 max-w-md mx-auto">
          When you donate while logged in, your contribution history and receipt details will appear here.
        </p>
        <Link
          href="/donation"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white text-sm font-medium hover:opacity-95 transition-opacity"
        >
          <Heart className="w-4 h-4" fill="currentColor" />
          Make a Donation
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-4 shadow-sm">
          <p className="text-xs text-[#6B5E5A]">Successful Donations</p>
          <p className="text-2xl font-bold text-[#2A1636] mt-1">{totals.count}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-4 shadow-sm">
          <p className="text-xs text-[#6B5E5A]">Total Contributed</p>
          <p className="text-2xl font-bold text-[#6B1E5B] mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {totals.totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-4 shadow-sm">
          <p className="text-xs text-[#6B5E5A]">All Records</p>
          <p className="text-2xl font-bold text-[#2A1636] mt-1">{totals.allCount}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7D7E8] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2A1636] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#6B1E5B]" />
            Donation History
          </h3>
          <Link href="/donation" className="text-xs font-medium text-[#6B1E5B] hover:underline">
            Donate again
          </Link>
        </div>

        <div className="divide-y divide-[#E7D7E8]">
          {donations.map((donation) => {
            const meta = statusMeta(donation.status);
            const StatusIcon = meta.icon;
            const isExpanded = expandedId === donation.id;
            const txnId =
              donation.transactionId ||
              donation.paymentDetails?.tracking_id ||
              donation.paymentDetails?.transaction_id ||
              "—";

            return (
              <div key={donation.id} className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : donation.id)}
                  className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[#2A1636] flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {Number(donation.amount || 0).toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${meta.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B5E5A] mt-1 font-mono truncate">
                      {donation.donationId || donation.id}
                    </p>
                    <p className="text-xs text-[#6B5E5A] mt-0.5">
                      {formatDate(donation.completedAt || donation.createdAt)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#6B5E5A] flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B5E5A] flex-shrink-0 mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-[#E7D7E8] bg-[#FFF9F2]/70 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <Detail label="Donation ID" value={donation.donationId || donation.id} mono />
                    <Detail label="Transaction ID" value={String(txnId)} mono />
                    <Detail label="Purpose" value={donation.purpose || "donation"} />
                    <Detail
                      label="Payment Mode"
                      value={
                        donation.paymentDetails?.payment_mode ||
                        donation.paymentGateway ||
                        "CCAvenue"
                      }
                    />
                    <Detail
                      label="Donor Name"
                      value={donation.donorDetails?.name || "—"}
                    />
                    <Detail
                      label="Email"
                      value={donation.donorDetails?.email || "—"}
                    />
                    <Detail
                      label="Mobile"
                      value={donation.donorDetails?.mobile || "—"}
                    />
                    <Detail
                      label="Donor Type"
                      value={donation.donorType === "foreign" ? "NRI / Foreign" : "Indian"}
                    />
                    <Detail
                      label="Location"
                      value={[
                        donation.donorDetails?.city,
                        donation.donorDetails?.state,
                        donation.donorDetails?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    />
                    <Detail
                      label="Tax Exemption"
                      value={
                        donation.taxExemption?.eligible
                          ? `Eligible (${donation.taxExemption.section || "80G"})`
                          : "Not marked"
                      }
                    />
                    <Detail label="Created" value={formatDate(donation.createdAt)} />
                    <Detail label="Completed" value={formatDate(donation.completedAt)} />
                    {donation.paymentDetails?.bank_ref_no && (
                      <Detail
                        label="Bank Ref No"
                        value={String(donation.paymentDetails.bank_ref_no)}
                        mono
                      />
                    )}
                    {(donation.paymentDetails?.failure_message ||
                      donation.paymentDetails?.status_message) && (
                      <div className="sm:col-span-2">
                        <Detail
                          label="Status Message"
                          value={
                            donation.paymentDetails?.failure_message ||
                            donation.paymentDetails?.status_message
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#6B5E5A] mb-0.5 flex items-center gap-1">
        {label === "Transaction ID" ? <CreditCard className="w-3 h-3" /> : null}
        {label}
      </p>
      <p className={`text-[#2A1636] break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>
        {value || "—"}
      </p>
    </div>
  );
}
