"use client";

import { useState, useEffect, useRef } from "react";
import { X, Star, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Testimonial } from "@/lib/services/adminTestimonialService";

interface CreateTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingTestimonial?: Testimonial | null;
  isSaving?: boolean;
}

export default function CreateTestimonialModal({
  isOpen,
  onClose,
  onSave,
  editingTestimonial,
  isSaving = false,
}: CreateTestimonialModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    city: "",
    image: "",
    imageFile: null as File | null,
    imagePreview: "",
    content: "",
    rating: 5,
    isPublished: false,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTestimonial) {
      setFormData({
        name: editingTestimonial.name || "",
        profession: editingTestimonial.profession || "",
        city: editingTestimonial.city || "",
        image: editingTestimonial.image || "",
        imageFile: null,
        imagePreview: editingTestimonial.image || "",
        content: editingTestimonial.content || "",
        rating: editingTestimonial.rating || 5,
        isPublished: editingTestimonial.isPublished || false,
      });
    } else {
      setFormData({
        name: "",
        profession: "",
        city: "",
        image: "",
        imageFile: null,
        imagePreview: "",
        content: "",
        rating: 5,
        isPublished: false,
      });
    }
  }, [editingTestimonial, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: reader.result as string,
      });
      setErrors({ ...errors, image: "" });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: "",
      image: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.profession.trim()) newErrors.profession = "Profession is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.imagePreview && !formData.image) newErrors.image = "Image is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      image: formData.imagePreview || formData.image || "",
    };
    onSave(submitData);
  };

  const handleRatingClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleRatingHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  if (!isOpen) return null;

  const displayRating = hoverRating || formData.rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingTestimonial ? "✏️ Edit Testimonial" : "➕ Add Testimonial"}
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
            {/* Name + Profession */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Name <span className="text-red-400">*</span>
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
                  placeholder="Full name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Profession <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                    errors.profession
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                  } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  placeholder="e.g. Software Engineer"
                />
                {errors.profession && <p className="text-red-500 text-xs mt-1.5">{errors.profession}</p>}
              </div>
            </div>

            {/* City */}
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Profile Image <span className="text-red-400">*</span>
              </label>
              
              {formData.imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#E7D7E8]">
                  <Image
                    src={formData.imagePreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
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
              
              {errors.image && <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Testimonial <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 resize-none ${
                  errors.content
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="What they say about the community..."
              />
              {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Rating
              </label>
              <div 
                className="flex gap-1"
                onMouseLeave={handleRatingLeave}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => handleRatingHover(star)}
                    className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                  >
                    <span className={star <= displayRating ? "text-[#E6A11C]" : "text-[#D4C8C0]"}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-sm text-[#6B5E5A] ml-2 self-center">
                  {displayRating} / 5
                </span>
              </div>
            </div>

            {/* Publish */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#2A1636]">Publish immediately</span>
              </label>
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
                    {editingTestimonial ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingTestimonial ? "Update Testimonial" : "Create Testimonial"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}