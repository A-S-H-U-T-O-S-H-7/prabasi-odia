"use client";

import AdminTableRow from "./AdminTableRow";

interface AdminTableProps {
  admins: any[];
  currentAdminId: string;
  onEdit: (admin: any) => void;
  onDelete: (admin: any) => void;
}

export default function AdminTable({ admins, currentAdminId, onEdit, onDelete }: AdminTableProps) {
  if (admins.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E7D7E8] bg-white/80 backdrop-blur-sm p-12 text-center shadow-md">
        <p className="text-lg text-[#6B5E5A]">No admins found</p>
        <p className="text-sm text-[#6B5E5A]/60 mt-2">Click "Add Admin" to create one</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E7D7E8] bg-white/80 backdrop-blur-sm overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#6B1E5B]/5 via-[#8A2E72]/5 to-[#D9772B]/5 border-b border-[#E7D7E8]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Name & Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B5E5A] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7D7E8]/50">
            {admins.map((admin, index) => {
              // Use uid as the unique identifier
              const adminWithId = { ...admin, id: admin.uid || admin.id };
              return (
                <AdminTableRow
                  key={adminWithId.id || index}
                  admin={adminWithId}
                  index={index}
                  currentAdminId={currentAdminId}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}