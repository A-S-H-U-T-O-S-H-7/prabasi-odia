"use client";

import { ContactRequest } from "@/lib/services/adminContactService";
import ContactTableRow from "./ContactTableRow";
import { Mail } from "lucide-react";

interface ContactTableProps {
  requests: ContactRequest[];
  loading?: boolean;
  onView: (request: ContactRequest) => void;
  onDelete: (request: ContactRequest) => void;
  onToggleRead: (request: ContactRequest) => void;
}

export default function ContactTable({
  requests,
  loading = false,
  onView,
  onDelete,
  onToggleRead,
}: ContactTableProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#6B1E5B] border-t-transparent mx-auto" />
        <p className="text-[#6B5E5A] mt-3">Loading messages...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#6B1E5B]/5 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#6B5E5A]/30" />
        </div>
        <p className="text-lg text-[#6B5E5A]">No messages yet</p>
        <p className="text-sm text-[#6B5E5A]/60 mt-2">
          Messages from the contact form will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#6B1E5B]/5 via-[#8A2E72]/5 to-[#D9772B]/5 border-b border-[#E7D7E8]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Sender</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Message</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Received</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7D7E8]/50">
            {requests.map((request, index) => (
              <ContactTableRow
                key={request.id}
                request={request}
                index={index}
                onView={onView}
                onDelete={onDelete}
                onToggleRead={onToggleRead}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}