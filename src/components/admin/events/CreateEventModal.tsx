"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2, Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { Event } from "@/lib/services/adminEventService";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingEvent?: Event | null;
  isSaving?: boolean;
  communities?: { id: string; name: string }[];
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  isSaving = false,
  communities = [],
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    city: "",
    communityId: "",
    communityName: "",
    coverImage: "",
    coverImageFile: null as File | null,
    coverImagePreview: "",
    status: "upcoming" as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        date: editingEvent.date || "",
        time: editingEvent.time || "",
        location: editingEvent.location || "",
        city: editingEvent.city || "",
        communityId: editingEvent.communityId || "",
        communityName: editingEvent.communityName || "",
        coverImage: editingEvent.coverImage || "",
        coverImageFile: null,
        coverImagePreview: editingEvent.coverImage || "",
        status: editingEvent.status || "upcoming",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        city: "",
        communityId: "",
        communityName: "",
        coverImage: "",
        coverImageFile: null,
        coverImagePreview: "",
        status: "upcoming",
      });
    }
  }, [editingEvent, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, coverImage: "Please upload an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, coverImage: "Image must be less than 5MB" });
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

  const handleCommunityChange = (communityId: string) => {
    const community = communities.find(c => c.id === communityId);
    setFormData({
      ...formData,
      communityId,
      communityName: community?.name || "",
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
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
            {editingEvent ? "✏️ Edit Event" : "➕ Add New Event"}
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="e.g. Rath Yatra Celebration"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="Describe the event..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                      errors.date
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                    } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Time <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                      errors.time
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                    } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                  />
                </div>
                {errors.time && <p className="text-red-500 text-xs mt-1.5">{errors.time}</p>}
              </div>
            </div>

            {/* Location + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 ${
                      errors.location
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                    } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                    placeholder="Venue name or address"
                  />
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1.5">{errors.location}</p>}
              </div>

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
            </div>

            {/* Community */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Community
              </label>
              <select
                value={formData.communityId}
                onChange={(e) => handleCommunityChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
              >
                <option value="">Select a community (optional)</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
              >
                <option value="upcoming">📅 Upcoming</option>
                <option value="ongoing">🔄 Ongoing</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
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
                    {editingEvent ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingEvent ? "Update Event" : "Create Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}