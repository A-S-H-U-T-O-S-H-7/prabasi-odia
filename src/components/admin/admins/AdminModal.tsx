"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { ROLES, ROLE_PERMISSIONS } from "@/lib/services/adminManagementService";
import PermissionSelector from "./PermissionSelector";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingAdmin: any | null;
  isSaving: boolean;
}

export default function AdminModal({ isOpen, onClose, onSave, editingAdmin, isSaving }: AdminModalProps) {
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: [] as string[],
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        uid: editingAdmin.uid || editingAdmin.id || "",
        name: editingAdmin.name || "",
        email: editingAdmin.email || "",
        password: "",
        role: editingAdmin.role || "admin",
        permissions: editingAdmin.permissions || [],
        status: editingAdmin.status || "active",
      });
    } else {
      setFormData({
        uid: "",
        name: "",
        email: "",
        password: "",
        role: "admin",
        permissions: [],
        status: "active",
      });
    }
  }, [editingAdmin, isOpen]);

  const handleRoleChange = (role: string) => {
    let permissions: string[] = [];
    if (role !== "super_admin") {
      permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    } else {
      // For super_admin, we keep permissions empty (they have all access)
      permissions = [];
    }
    setFormData({ ...formData, role, permissions });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!editingAdmin && !formData.password) newErrors.password = "Password is required";
    if (!editingAdmin && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingAdmin ? "✏️ Edit Admin" : "➕ Add New Admin"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#6B5E5A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 p-5" style={{ maxHeight: "calc(90vh - 140px)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Row 2: Email + Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                  } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
              </div>

              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 pr-10 border-2 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                      } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                      placeholder="Enter password (min 6 chars)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#6B5E5A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                  <p className="text-xs mt-1 text-[#6B5E5A]">Minimum 6 characters</p>
                </div>
              )}
            </div>

            {/* Row 3: Role + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                >
                  {ROLES.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <p className="text-xs mt-1 text-[#6B5E5A]">
                  {ROLES.find(r => r.id === formData.role)?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">⛔ Inactive</option>
                </select>
              </div>
            </div>

            {/* Permissions Section */}
            {formData.role !== "super_admin" && (
              <div className="pt-2">
                <PermissionSelector
                  selectedPermissions={formData.permissions}
                  onChange={(permissions) => setFormData({ ...formData, permissions })}
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[#E7D7E8] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#2A1636] hover:bg-[#E5DDD8]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg hover:shadow-xl"
          >
            {isSaving ? (editingAdmin ? "Updating..." : "Creating...") : (editingAdmin ? "Update Admin" : "Create Admin")}
          </button>
        </div>
      </div>
    </div>
  );
}