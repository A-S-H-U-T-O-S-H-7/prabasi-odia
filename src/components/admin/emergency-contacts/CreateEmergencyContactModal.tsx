"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Phone } from "lucide-react";
import {
  EmergencyContact,
  EmergencyCategory,
} from "@/lib/services/adminEmergencyContactService";

interface CreateEmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingContact?: EmergencyContact | null;
  isSaving?: boolean;
}

const CATEGORIES: { value: EmergencyCategory; label: string }[] = [
  { value: "ambulance", label: "Ambulance" },
  { value: "police", label: "Police" },
  { value: "fire", label: "Fire" },
  { value: "hospital", label: "Hospital" },
  { value: "helpline", label: "Helpline" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  title: "",
  phone: "",
  alternatePhone: "",
  category: "other" as EmergencyCategory,
  description: "",
  address: "",
  order: 0,
  isActive: true,
};

export default function CreateEmergencyContactModal({
  isOpen,
  onClose,
  onSave,
  editingContact,
  isSaving = false,
}: CreateEmergencyContactModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingContact) {
      setFormData({
        title: editingContact.title || "",
        phone: editingContact.phone || "",
        alternatePhone: editingContact.alternatePhone || "",
        category: editingContact.category || "other",
        description: editingContact.description || "",
        address: editingContact.address || "",
        order: editingContact.order || 0,
        isActive: editingContact.isActive !== undefined ? editingContact.isActive : true,
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [editingContact, isOpen]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.title.trim()) next.title = "Title is required";
    if (!formData.phone.trim()) next.phone = "Phone number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 border border-[#E7D7E8] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8]">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#6B1E5B]/5 text-[#6B5E5A] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border-2 ${
                  errors.title ? "border-red-500" : "border-[#D4C8C0]/50"
                } bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="e.g. Ambulance, Police Station"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as EmergencyCategory,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Phone <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 ${
                      errors.phone ? "border-red-500" : "border-[#D4C8C0]/50"
                    } bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                    placeholder="108 / 100 / +91..."
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, alternatePhone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 resize-none"
                placeholder="Short note, e.g. 24/7 emergency ambulance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                placeholder="Optional location / area"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-[#2A1636]">Active (show on site)</span>
            </label>

            <div className="flex gap-3 pt-4 border-t border-[#E7D7E8]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm bg-[#F0EAE6] text-[#2A1636] hover:bg-[#E5DDD8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingContact ? (
                  "Update Contact"
                ) : (
                  "Add Contact"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
