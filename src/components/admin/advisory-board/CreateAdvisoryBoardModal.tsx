"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Globe } from "lucide-react";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { AdvisoryBoardMember } from "@/lib/services/adminAdvisoryBoardService";

interface CreateAdvisoryBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingMember?: AdvisoryBoardMember | null;
  isSaving?: boolean;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const emptyForm = {
  name: "",
  position: "",
  photoURL: "",
  photoFile: null as File | null,
  photoPreview: "",
  organization: "",
  designation: "",
  bio: "",
  achievementsText: "",
  experience: "",
  order: 0,
  isActive: true,
  featured: false,
  linkedin: "",
  twitter: "",
  website: "",
  joinedDate: "",
};

export default function CreateAdvisoryBoardModal({
  isOpen,
  onClose,
  onSave,
  editingMember,
  isSaving = false,
}: CreateAdvisoryBoardModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name || "",
        position: editingMember.position || "",
        photoURL: editingMember.photoURL || "",
        photoFile: null,
        photoPreview: editingMember.photoURL || "",
        organization: editingMember.organization || "",
        designation: editingMember.designation || "",
        bio: editingMember.bio || "",
        achievementsText: (editingMember.achievements || []).join("\n"),
        experience: editingMember.experience || "",
        order: editingMember.order || 0,
        isActive: editingMember.isActive !== undefined ? editingMember.isActive : true,
        featured: editingMember.featured || false,
        linkedin: editingMember.linkedin || "",
        twitter: editingMember.twitter || "",
        website: editingMember.website || "",
        joinedDate: editingMember.joinedDate
          ? editingMember.joinedDate.slice(0, 10)
          : "",
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [editingMember, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors({ ...errors, photo: "Please upload a valid image (JPEG, PNG, WEBP)" });
      toast.error("Invalid file type. Please upload JPEG, PNG, or WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors({
        ...errors,
        photo: `Image must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
      });
      toast.error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        photoFile: file,
        photoPreview: reader.result as string,
      });
      setErrors({ ...errors, photo: "" });
      setIsUploading(false);
      toast.success("Photo ready to upload!");
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrors({ ...errors, photo: "Failed to read image file" });
      toast.error("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData({
      ...formData,
      photoFile: null,
      photoPreview: "",
      photoURL: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.photoPreview && !formData.photoURL)
      newErrors.photo = "Photo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      ...formData,
      photoFile: formData.photoFile,
      photoURL: formData.photoPreview || formData.photoURL || "",
      achievementsText: formData.achievementsText,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingMember ? "Edit Advisory Member" : "Add Advisory Member"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#6B5E5A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Photo <span className="text-red-400">*</span>
              </label>
              {formData.photoPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#E7D7E8] bg-white">
                  <Image
                    src={formData.photoPreview}
                    alt={formData.name || "Member photo"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-24 rounded-full border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    errors.photo
                      ? "border-red-400 bg-red-50/30"
                      : "border-[#D4C8C0]/50 bg-white/50 hover:border-[#6B1E5B]"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#6B1E5B] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#6B5E5A]/40" />
                      <p className="text-[10px] text-[#6B5E5A]/40 mt-1">Upload</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              {errors.photo && (
                <p className="text-red-500 text-xs mt-1.5">{errors.photo}</p>
              )}
              <p className="text-[10px] text-[#6B5E5A]/40 mt-1">
                JPG, PNG, WEBP (Max 2MB)
              </p>
            </div>

            {/* Name + Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                  } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  placeholder="e.g. Dr. Priya Mohanty"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Board Position <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                    errors.position
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                  } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  placeholder="e.g. Chairperson, Member"
                />
                {errors.position && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.position}</p>
                )}
              </div>
            </div>

            {/* Organization + Designation/Expertise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Organization
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  placeholder="e.g. Stanford University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Designation / Expertise
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  placeholder="e.g. Professor, Cultural Affairs"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Short Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 resize-none"
                placeholder="Brief biography shown on hover..."
              />
            </div>

            {/* Experience + Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Experience
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  placeholder="e.g. 20+ years in education"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Joined Date
                </label>
                <input
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinedDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Achievements
              </label>
              <textarea
                value={formData.achievementsText}
                onChange={(e) =>
                  setFormData({ ...formData, achievementsText: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 resize-none"
                placeholder="One achievement per line"
              />
            </div>

            {/* Social links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  LinkedIn
                </label>
                <div className="relative">
                  <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Twitter / X
                </label>
                <div className="relative">
                  <FaTwitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Order + flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  min="0"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#2A1636]">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#2A1636]">Featured</span>
              </label>
            </div>

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
                disabled={isSaving || isUploading}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingMember ? "Updating..." : "Creating..."}
                  </span>
                ) : editingMember ? (
                  "Update Member"
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
