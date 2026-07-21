"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, AlertCircle, Info, Calendar } from "lucide-react";
import { Notice } from "@/lib/services/adminNoticeService";

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingNotice?: Notice | null;
  isSaving?: boolean;
  communities?: { id: string; name: string }[];
}

export default function CreateNoticeModal({
  isOpen,
  onClose,
  onSave,
  editingNotice,
  isSaving = false,
  communities = [],
}: CreateNoticeModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium" as 'high' | 'medium' | 'low',
    communityId: "",
    communityName: "",
    isPublished: false,
    expiresAt: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingNotice) {
      setFormData({
        title: editingNotice.title || "",
        content: editingNotice.content || "",
        priority: editingNotice.priority || "medium",
        communityId: editingNotice.communityId || "",
        communityName: editingNotice.communityName || "",
        isPublished: editingNotice.isPublished || false,
        expiresAt: editingNotice.expiresAt || "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        priority: "medium",
        communityId: "",
        communityName: "",
        isPublished: false,
        expiresAt: "",
      });
    }
  }, [editingNotice, isOpen]);

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
    if (!formData.title.trim()) newErrors.title = "Notice title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
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
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#2A1636]">
            {editingNotice ? "✏️ Edit Notice" : "➕ Add New Notice"}
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
                Notice Title <span className="text-red-400">*</span>
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
                placeholder="e.g. Important Community Update"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 resize-none ${
                  errors.content
                    ? "border-red-500 focus:ring-red-500/20"
                    : "border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B]"
                } focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20`}
                placeholder="Write your notice content here..."
              />
              {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
            </div>

            {/* Priority + Community */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟠 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Community
                </label>
                <select
                  value={formData.communityId}
                  onChange={(e) => handleCommunityChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20 cursor-pointer"
                >
                  <option value="">All Communities</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry Date + Publish */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
                  Expires At
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:outline-none focus:ring-2 focus:ring-[#6B1E5B]/20"
                  />
                </div>
              </div>

              <div className="flex items-end">
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
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editingNotice ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editingNotice ? "Update Notice" : "Create Notice"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}