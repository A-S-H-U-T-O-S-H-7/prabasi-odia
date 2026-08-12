"use client";

import { Eye } from "lucide-react";
import { DonationData } from "@/lib/services/donationService";

interface DonationTableRowProps {
  donation: DonationData;
  index: number;
  onView: (donation: DonationData) => void;
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
    });
  } catch {
    return "—";
  }
}

function statusBadge(status: DonationData["status"]) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "cancelled":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-[#D9772B]/10 text-[#D9772B] border-[#D9772B]/20";
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
      return "Pending";
  }
}

export default function DonationTableRow({
  donation,
  index,
  onView,
}: DonationTableRowProps) {
  return (
    <tr className="hover:bg-[#6B1E5B]/[0.03] transition-colors">
      <td className="px-4 py-3 text-sm text-[#6B5E5A]">{index + 1}</td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#2A1636]">
            {donation.donorDetails?.name || "—"}
          </p>
          <p className="text-xs text-[#6B5E5A] truncate max-w-[180px]">
            {donation.donorDetails?.email || "—"}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-bold text-[#2A1636]">
          ₹{Number(donation.amount || 0).toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-[#6B5E5A] uppercase">{donation.currency || "INR"}</p>
      </td>
      <td className="px-4 py-3 text-sm text-[#2A1636] max-w-[160px] truncate">
        {donation.purpose || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-[#6B5E5A]">
        {formatDate(donation.createdAt)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(
            donation.status
          )}`}
        >
          {statusLabel(donation.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onView(donation)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B1E5B] bg-[#6B1E5B]/5 hover:bg-[#6B1E5B]/10 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      </td>
    </tr>
  );
}
