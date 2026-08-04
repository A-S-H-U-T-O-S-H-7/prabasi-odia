"use client";

import { Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import Image from "next/image";
import { AdvisoryBoardMember } from "@/lib/services/adminAdvisoryBoardService";

interface AdvisoryBoardTableRowProps {
  member: AdvisoryBoardMember;
  index: number;
  onEdit: (member: AdvisoryBoardMember) => void;
  onDelete: (member: AdvisoryBoardMember) => void;
  onToggleActive: (member: AdvisoryBoardMember) => void;
}

export default function AdvisoryBoardTableRow({
  member,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: AdvisoryBoardTableRowProps) {
  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"
      } hover:bg-[#6B1E5B]/5`}
    >
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{index + 1}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#F0EAE6] border border-[#E7D7E8]">
            {member.photoURL ? (
              <Image
                src={member.photoURL}
                alt={member.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[#6B1E5B]">
                {member.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#2A1636] truncate">
                {member.name}
              </span>
              {member.featured && (
                <Star className="w-3.5 h-3.5 fill-[#E6A11C] text-[#E6A11C] flex-shrink-0" />
              )}
            </div>
            {member.organization && (
              <p className="text-xs text-[#6B5E5A] truncate">{member.organization}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#2A1636]">{member.position || "—"}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{member.designation || "—"}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{member.order ?? 0}</span>
      </td>

      <td className="px-4 py-3">
        {member.isActive ? (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
            Active
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
            Inactive
          </span>
        )}
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{formatDate(member.createdAt)}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(member)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              member.isActive
                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            title={member.isActive ? "Deactivate" : "Activate"}
          >
            {member.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(member)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Member"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
