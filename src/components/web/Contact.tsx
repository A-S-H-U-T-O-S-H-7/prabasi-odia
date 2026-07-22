"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  User, 
  MessageSquare, 
  ArrowLeft,
  Heart,
  Droplet,
  Briefcase,
  HelpCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore, useUserStore } from "@/lib/store";
import { getContactInfo } from "@/lib/services/settingsService";
import { submitContactForm } from "@/lib/services/contactService";

const helpTypes = [
  { id: "general", label: "General Inquiry", icon: HelpCircle },
  { id: "bloodDonation", label: "Blood Donation", icon: Droplet },
  { id: "volunteering", label: "Volunteering", icon: Heart },
  { id: "jobHelp", label: "Job Help / Referrals", icon: Briefcase },
  { id: "other", label: "Other", icon: MessageSquare },
];

export default function ContactPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { profile } = useUserStore();
  
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    helpType: "general",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch contact info from settings
  useEffect(() => {
    const fetchContactInfo = async () => {
      const result = await getContactInfo();
      if (result.success) {
        setContactInfo(result);
      }
      setLoading(false);
    };
    fetchContactInfo();
  }, []);

  // Auto-fill from user profile if logged in
  useEffect(() => {
    if (isAuthenticated && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.displayName || user?.displayName || "",
        email: profile.email || user?.email || "",
        phone: profile.phoneNumber || "",
      }));
    }
  }, [isAuthenticated, profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        helpType: formData.helpType,
        subject: formData.subject,
        message: formData.message,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success("Message sent successfully!");
        setFormData(prev => ({ ...prev, message: "", subject: "" }));
        setTimeout(() => setIsSuccess(false), 6000);
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact items from settings
  const contactItems = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: contactInfo?.contact?.phone1 || "+91 99999 99999",
      href: `tel:${(contactInfo?.contact?.phone1 || "9999999999").replace(/\s/g, '')}`,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: contactInfo?.contact?.contactEmail || "hello@prabasiodia.com",
      href: `mailto:${contactInfo?.contact?.contactEmail || "hello@prabasiodia.com"}`,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: contactInfo?.contact?.address || "Bhubaneswar, Odisha, India",
      href: null,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] via-white to-[#FDE8D0]/20 py-8 px-4">
      {/* Decorative Blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#6B1E5B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-[#D9772B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E7D7E8] text-[#6B5E5A] hover:text-[#6B1E5B] hover:border-[#6B1E5B]/30 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/80 border border-[#E7D7E8] text-[#6B1E5B] backdrop-blur-sm mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9772B] animate-pulse" />
            We're here to help
          </span>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2A1636] mb-4 leading-tight">
            Get in <span className="text-[#6B1E5B]">Touch</span>
          </h1>

          <p className="text-base text-[#6B5E5A] max-w-md mx-auto leading-relaxed">
            Have a question or need help? Reach out to us and we'll respond promptly.
          </p>

          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] mx-auto mt-5" />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="h-full bg-white/70 backdrop-blur-xl border border-[#E7D7E8] rounded-2xl shadow-xl p-7">
              <h2 className="text-xl font-serif font-bold text-[#2A1636] mb-7">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0 text-[#6B1E5B]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#6B5E5A] mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-medium text-[#2A1636] hover:text-[#6B1E5B] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-[#2A1636] leading-relaxed">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show second phone if exists */}
              {contactInfo?.contact?.phone2 && (
                <div className="mt-4 pt-4 border-t border-[#E7D7E8]/50">
                  <p className="text-xs text-[#6B5E5A] mb-1">Alternate Number</p>
                  <a
                    href={`tel:${contactInfo.contact.phone2.replace(/\s/g, '')}`}
                    className="text-sm font-medium text-[#2A1636] hover:text-[#6B1E5B] transition-colors"
                  >
                    {contactInfo.contact.phone2}
                  </a>
                </div>
              )}

              <div className="mt-6 h-1.5 w-full rounded-full bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#E6A11C] opacity-60" />
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-[#E7D7E8] rounded-2xl shadow-xl p-6 md:p-8">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center mb-5">
                      <CheckCircle className="w-10 h-10 text-[#6B1E5B]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#2A1636] mb-2">
                      Message Sent! 🎉
                    </h3>
                    <p className="text-sm text-[#6B5E5A] mb-6 leading-relaxed max-w-xs">
                      Thank you for reaching out. We'll get back to you within 24-48 hours.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white hover:opacity-90 transition-opacity shadow-md"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6B1E5B] to-[#D9772B]" />
                      <h3 className="text-base font-semibold text-[#2A1636]">
                        Send us a message
                      </h3>
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                          Full Name <span className="text-[#D9772B]">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4C8C0]/50 text-[#2A1636] placeholder:text-[#6B5E5A]/30 focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                          Email <span className="text-[#D9772B]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@email.com"
                            required
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4C8C0]/50 text-[#2A1636] placeholder:text-[#6B5E5A]/30 focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone + Help Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Optional"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4C8C0]/50 text-[#2A1636] placeholder:text-[#6B5E5A]/30 focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                          Help Type
                        </label>
                        <select
                          name="helpType"
                          value={formData.helpType}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4C8C0]/50 text-[#2A1636] focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          {helpTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief subject"
                        className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4C8C0]/50 text-[#2A1636] placeholder:text-[#6B5E5A]/30 focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E5A] mb-1.5">
                        Message <span className="text-[#D9772B]">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Write your message here…"
                        required
                        className="w-full px-4 py-2.5 text-sm rounded-xl resize-none bg-white border border-[#D4C8C0]/50 text-[#2A1636] placeholder:text-[#6B5E5A]/30 focus:outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}