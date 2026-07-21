"use client";

import { Edit, Trash2, Shield, UserCog, Eye } from "lucide-react";

interface AdminTableRowProps {
  admin: any;
  index: number;
  currentAdminId: string;
  onEdit: (admin: any) => void;
  onDelete: (admin: any) => void;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'super_admin': return Shield;
    case 'admin': return UserCog;
    default: return Eye;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return "bg-purple-100 text-purple-700 border-purple-200";
    case 'admin':
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function AdminTableRow({ admin, index, currentAdminId, onEdit, onDelete }: AdminTableRowProps) {
  const RoleIcon = getRoleIcon(admin.role);
  const roleColor = getRoleColor(admin.role);
  const isSelf = admin.id === currentAdminId;

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <tr className={`transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-[#FFF9F2]/50"} hover:bg-[#6B1E5B]/5`}>
      <td className="px-6 py-4">
        <span className="text-sm text-[#6B5E5A]">{index + 1}</span>
      </td>
      
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-[#2A1636]">{admin.name}</div>
          <div className="text-xs text-[#6B5E5A]">{admin.email}</div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${roleColor}`}>
          <RoleIcon className="w-3 h-3" />
          {admin.role === 'super_admin' ? 'Super Admin' : admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-[#6B5E5A]">{formatDate(admin.lastLoginAt)}</div>
      </td>
      
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
          admin.status === 'active'
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {admin.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(admin)}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="Edit Admin"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(admin)}
            disabled={isSelf}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
              isSelf
                ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={isSelf ? "Cannot delete yourself" : "Delete Admin"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}