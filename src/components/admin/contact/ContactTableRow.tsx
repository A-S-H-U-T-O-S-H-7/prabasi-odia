"use client";

import { Eye, Trash2, Mail, MailOpen, MessageSquare } from "lucide-react";
import { ContactRequest } from "@/lib/services/adminContactService";

interface ContactTableRowProps {
  request: ContactRequest;
  index: number;
  onView: (request: ContactRequest) => void;
  onDelete: (request: ContactRequest) => void;
  onToggleRead: (request: ContactRequest) => void;
}

const helpTypeLabels: Record<string, string> = {
  general: "General Inquiry",
  bloodDonation: "Blood Donation",
  volunteering: "Volunteering",
  jobHelp: "Job Help / Referrals",
  other: "Other",
};

export default function ContactTableRow({
  request,
  index,
  onView,
  onDelete,
  onToggleRead,
}: ContactTableRowProps) {
  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHelpTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-700",
      bloodDonation: "bg-red-100 text-red-700",
      volunteering: "bg-purple-100 text-purple-700",
      jobHelp: "bg-blue-100 text-blue-700",
      other: "bg-amber-100 text-amber-700",
    };
    return colors[type] || colors.general;
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"} hover:bg-[#6B1E5B]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{index + 1}</span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#6B1E5B]">
              {request.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#2A1636] flex items-center gap-2">
              {request.name}
              {!request.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#D9772B] animate-pulse" />
              )}
            </div>
            <div className="text-xs text-[#6B5E5A]">{request.email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getHelpTypeColor(request.helpType)}`}>
          {helpTypeLabels[request.helpType] || request.helpType}
        </span>
      </td>
      
      <td className="px-4 py-3">
        <p className="text-sm text-[#6B5E5A] truncate max-w-xs">
          {request.message}
        </p>
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{formatDate(request.createdAt)}</span>
      </td>
      
      <td className="px-4 py-3">
        {request.isRead ? (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
            ✅ Read
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20 animate-pulse">
            ⏳ Unread
          </span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleRead(request)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              request.isRead
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={request.isRead ? "Mark as Unread" : "Mark as Read"}
          >
            {request.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onView(request)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Message"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(request)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}