"use client";

import { Edit, Trash2, Eye, EyeOff, Calendar, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Notice } from "@/lib/services/adminNoticeService";

interface NoticeTableRowProps {
  notice: Notice;
  index: number;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
  onTogglePublish: (notice: Notice) => void;
}

export default function NoticeTableRow({
  notice,
  index,
  onEdit,
  onDelete,
  onTogglePublish,
}: NoticeTableRowProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High</span>;
      case 'medium':
        return <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Medium</span>;
      case 'low':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200 flex items-center gap-1"><Info className="w-3 h-3" /> Low</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{priority}</span>;
    }
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">✅ Published</span>;
    }
    return <span className="px-2.5 py-1 bg-[#D9772B]/10 text-[#D9772B] text-xs font-medium rounded-full border border-[#D9772B]/20">⏳ Draft</span>;
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
          <div className="text-sm font-semibold text-[#2A1636]">{notice.title}</div>
          <div className="text-xs text-[#6B5E5A] truncate max-w-xs">{notice.content}</div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        {getPriorityBadge(notice.priority)}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{notice.communityName || 'All Communities'}</span>
      </td>
      
      <td className="px-4 py-3">
        {getStatusBadge(notice.isPublished)}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{formatDate(notice.createdAt)}</span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePublish(notice)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              notice.isPublished
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={notice.isPublished ? "Unpublish" : "Publish"}
          >
            {notice.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(notice)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Notice"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(notice)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Notice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}