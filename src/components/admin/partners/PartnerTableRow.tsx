"use client";

import { Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Partner } from "@/lib/services/adminPartnerService";

interface PartnerTableRowProps {
  partner: Partner;
  index: number;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  onToggleActive: (partner: Partner) => void;
}

export default function PartnerTableRow({
  partner,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: PartnerTableRowProps) {
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0EAE6] border border-[#E7D7E8]">
            {partner.logo ? (
              <Image
                src={partner.logo}
                alt={partner.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                🏢
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-[#2A1636]">{partner.name}</span>
        </div>
      </td>
      
      <td className="px-4 py-3">
        {partner.website ? (
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#6B1E5B] hover:text-[#531547] transition-colors flex items-center gap-1"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-[#6B5E5A]">—</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{partner.displayOrder || 0}</span>
      </td>
      
      <td className="px-4 py-3">
        {partner.isActive ? (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">🟢 Active</span>
        ) : (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">⚫ Inactive</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-[#6B5E5A]">{formatDate(partner.createdAt)}</span>
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(partner)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              partner.isActive
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={partner.isActive ? "Deactivate" : "Activate"}
          >
            {partner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(partner)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-amber-100 text-amber-600 hover:bg-amber-200"
            title="Edit Partner"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(partner)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Partner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}