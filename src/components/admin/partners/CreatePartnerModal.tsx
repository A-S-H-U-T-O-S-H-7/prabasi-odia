"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Globe } from "lucide-react";
import Image from "next/image";
import { Partner } from "@/lib/services/adminPartnerService";

interface CreatePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingPartner?: Partner | null;
  isSaving?: boolean;
}

export default function CreatePartnerModal({
  isOpen,
  onClose,
  onSave,
  editingPartner,
  isSaving = false,
}: CreatePartnerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    logoFile: null as File | null,
    logoPreview: "",
    website: "",
    isActive: true,
    displayOrder: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name || "",
        logo: editingPartner.logo || "",
        logoFile: null,
        logoPreview: editingPartner.logo || "",
        website: editingPartner.website || "",
        isActive: editingPartner.isActive !== undefined ? editingPartner.isActive : true,
        displayOrder: editingPartner.displayOrder || 0,
      });
    } else {
      setFormData({
        name: "",
        logo: "",
        logoFile: null,
        logoPreview: "",
        website: "",
        isActive: true,
        displayOrder: 0,
      });
    }
  }, [editingPartner, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, logo: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, logo: "Image must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        logoFile: file,
        logoPreview: reader.result as string,
      });
      setErrors({ ...errors, logo: "" });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData({
      ...formData,
      logoFile: null,
      logoPreview: "",
      logo: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Partner name is required";
    if (!formData.logoPreview && !formData.logo) newErrors.logo = "Logo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      logo: formData.logoPreview || formData.logo || "",
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingPartner ? "✏️ Edit Partner" : "➕ Add Partner"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#6B5E5A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Partner Name */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Partner Name <span className="text-red-400">*</span>
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
                placeholder="e.g. Odia Association USA"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Logo <span className="text-red-400">*</span>
              </label>
              
              {formData.logoPreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#E7D7E8] bg-white">
                  <Image
                    src={formData.logoPreview}
                    alt={formData.name || "Partner logo"}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-[#D4C8C0]/50 bg-white/50 hover:border-[#6B1E5B] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-[#6B5E5A]/40" />
                  <p className="text-[10px] text-[#6B5E5A]/40 mt-1">Upload</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {errors.logo && <p className="text-red-500 text-xs mt-1.5">{errors.logo}</p>}
              <p className="text-[10px] text-[#6B5E5A]/40 mt-1">PNG, JPG (Max 2MB)</p>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 placeholder:text-[#6B5E5A]/30"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Display Order + Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  min="0"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[#2A1636]">Active</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#E7D7E8]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#F0EAE6] text-[#2A1636] hover:bg-[#E5DDD8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingPartner ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingPartner ? "Update Partner" : "Create Partner"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}