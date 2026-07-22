"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Save } from "lucide-react";

interface ContactSettingsProps {
  settings: {
    phone1?: string;
    phone2?: string;
    contactEmail?: string;
    address?: string;
  };
  onUpdate: (data: any) => Promise<void>;
}

export default function ContactSettings({ settings, onUpdate }: ContactSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onUpdate(formData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#E7D7E8] bg-white/70 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[#6B1E5B]/10">
            <Phone className="w-5 h-5 text-[#6B1E5B]" />
          </div>
          <h2 className="text-xl font-bold text-[#2A1636]">Contact Information</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-2">
                Phone Number 1
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  type="tel"
                  value={formData.phone1 || ''}
                  onChange={(e) => handleChange('phone1', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-200 placeholder:text-[#6B5E5A]/30"
                  placeholder="+91 99999 99999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-2">
                Phone Number 2 (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  type="tel"
                  value={formData.phone2 || ''}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-200 placeholder:text-[#6B5E5A]/30"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-200 placeholder:text-[#6B5E5A]/30"
                placeholder="hello@prabasiodia.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Office Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#6B5E5A]/40" />
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-2 border-[#D4C8C0]/50 bg-white/50 text-[#2A1636] focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-200 resize-none placeholder:text-[#6B5E5A]/30"
                placeholder="Bhubaneswar, Odisha, India"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E7D7E8]">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Contact Info"}
          </button>
        </div>
      </div>
    </form>
  );
}