"use client";

import { Edit, Trash2, Eye, EyeOff, Phone } from "lucide-react";
import { EmergencyContact } from "@/lib/services/adminEmergencyContactService";

const CATEGORY_LABELS: Record<string, string> = {
  ambulance: "Ambulance",
  police: "Police",
  fire: "Fire",
  hospital: "Hospital",
  helpline: "Helpline",
  other: "Other",
};

interface EmergencyContactTableRowProps {
  contact: EmergencyContact;
  index: number;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contact: EmergencyContact) => void;
  onToggleActive: (contact: EmergencyContact) => void;
}

export default function EmergencyContactTableRow({
  contact,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: EmergencyContactTableRowProps) {
  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"
      } hover:bg-[#6B1E5B]/5`}
    >
      <td className="px-4 py-3 text-sm text-[#6B5E5A]">{index + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2A1636]">{contact.title}</p>
            {contact.description && (
              <p className="text-xs text-[#6B5E5A] truncate max-w-[200px]">
                {contact.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#6B1E5B]/10 text-[#6B1E5B]">
          {CATEGORY_LABELS[contact.category] || contact.category}
        </span>
      </td>
      <td className="px-4 py-3">
        <a
          href={`tel:${contact.phone}`}
          className="text-sm text-[#6B1E5B] font-medium hover:underline"
        >
          {contact.phone}
        </a>
        {contact.alternatePhone && (
          <p className="text-xs text-[#6B5E5A]">{contact.alternatePhone}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-[#6B5E5A]">{contact.order}</td>
      <td className="px-4 py-3">
        {contact.isActive ? (
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(contact)}
            className={`p-2 rounded-lg transition-all hover:scale-110 cursor-pointer ${
              contact.isActive
                ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            title={contact.isActive ? "Deactivate" : "Activate"}
          >
            {contact.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(contact)}
            className="p-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-all hover:scale-110 cursor-pointer"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all hover:scale-110 cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
