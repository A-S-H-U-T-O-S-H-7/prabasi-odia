"use client";

import { Users, Edit, Trash2, Eye } from "lucide-react";
import { Community } from "@/lib/services/adminCommunityService";

interface CommunityTableRowProps {
  community: Community;
  index: number;
  onViewMembers: (community: Community) => void;
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
}

export default function CommunityTableRow({
  community,
  index,
  onViewMembers,
  onEdit,
  onDelete,
}: CommunityTableRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">🟢 Active</span>;
      case 'pending':
        return <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20">⏳ Pending</span>;
      case 'inactive':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">⚫ Inactive</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"} hover:bg-[#6B1E5B]/5`}>
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{index + 1}</span>
      </td>
      
      <td className="px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[#2A1636]">{community.name}</div>
          <div className="text-xs text-[#6B5E5A]">{community.city}, {community.state}</div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm text-[#6B5E5A]">
          <Users className="w-4 h-4" />
          <span>{community.memberCount || 0}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        {getStatusBadge(community.status)}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{formatDate(community.createdAt)}</span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewMembers(community)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View Members"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(community)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Community"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(community)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Community"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}