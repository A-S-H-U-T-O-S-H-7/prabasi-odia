// src/components/admin/associates/AssociateTable.tsx
'use client';

import { Associate } from "@/lib/services/adminAssociateService";
import AssociateTableRow from "./AssociateTableRow";

interface AssociateTableProps {
  associates: Associate[];
  loading?: boolean;
  onEdit: (associate: Associate) => void;
  onDelete: (associate: Associate) => void;
  onToggleActive: (associate: Associate) => void;
}

export default function AssociateTable({
  associates,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}: AssociateTableProps) {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8 text-center shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#6B1E5B] border-t-transparent mx-auto" />
        <p className="text-[#6B5E5A] mt-3">Loading associates...</p>
      </div>
    );
  }

  if (associates.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-12 text-center shadow-sm">
        <p className="text-lg text-[#6B5E5A]">No associates found</p>
        <p className="text-sm text-[#6B5E5A]/60 mt-2">Click "Add Associate" to create one</p>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Associate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Website</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7D7E8]/50">
            {associates.map((associate, index) => (
              <AssociateTableRow
                key={associate.id}
                associate={associate}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}