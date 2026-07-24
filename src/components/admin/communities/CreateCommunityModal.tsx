"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingCommunity?: any | null;
  isSaving?: boolean;
}

const ODISHA_STATES = ["Odisha", "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", "West Bengal", "Jharkhand", "Chhattisgarh", "Delhi", "Other"];

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onSave,
  editingCommunity,
  isSaving = false,
}: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "Odisha",
    description: "",
    coverImage: "",
    coverImageFile: null as File | null,
    coverImagePreview: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCommunity) {
      setFormData({
        name: editingCommunity.name || "",
        city: editingCommunity.city || "",
        state: editingCommunity.state || "Odisha",
        description: editingCommunity.description || "",
        coverImage: editingCommunity.coverImage || "",
        coverImageFile: null,
        coverImagePreview: editingCommunity.coverImage || "",
        status: editingCommunity.status || "active",
      });
    } else {
      setFormData({
        name: "",
        city: "",
        state: "Odisha",
        description: "",
        coverImage: "",
        coverImageFile: null,
        coverImagePreview: "",
        status: "active",
      });
    }
  }, [editingCommunity, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, coverImage: "Please upload an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, coverImage: "Image must be less than 10MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        coverImageFile: file,
        coverImagePreview: reader.result as string,
      });
      setErrors({ ...errors, coverImage: "" });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      coverImageFile: null,
      coverImagePreview: "",
      coverImage: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Community name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      coverImage: formData.coverImagePreview || formData.coverImage || "",
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
            {editingCommunity ? "✏️ Edit Community" : "➕ Add New Community"}
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
            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Community Name <span className="text-red-400">*</span>
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
                placeholder="e.g. Bhubaneswar Odia Samaj"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                    errors.city
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                  } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  placeholder="e.g. Bhubaneswar"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
                >
                  {ODISHA_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="Describe the community..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Cover Image
              </label>
              
              {formData.coverImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#E7D7E8]">
                  <Image
                    src={formData.coverImagePreview}
                    alt="Cover preview"
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-[#D4C8C0]/50 bg-white/50 hover:border-[#6B1E5B] transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-[#6B5E5A]/40" />
                  <p className="text-sm text-[#6B5E5A]/60 mt-2">Click to upload cover image</p>
                  <p className="text-xs text-[#6B5E5A]/40">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {errors.coverImage && (
                <p className="text-red-500 text-xs mt-1.5">{errors.coverImage}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
              >
                <option value="active">🟢 Active</option>
                <option value="pending">⏳ Pending</option>
                <option value="inactive">⚫ Inactive</option>
              </select>
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
                    {editingCommunity ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingCommunity ? "Update Community" : "Create Community"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}