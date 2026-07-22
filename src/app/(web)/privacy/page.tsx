"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { getContactInfo } from "@/lib/services/settingsService";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState<any>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      const result = await getContactInfo();
      if (result.success) {
        setContactInfo(result);
      }
    };
    fetchContactInfo();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#FDE8D0]/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-8 md:p-12 shadow-sm"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#6B5E5A] mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-[#2A1636]">
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">1. Introduction</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                At Prabasi Odia, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">2. Information We Collect</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Name, email address, phone number, and profile information</li>
                <li>Address details (Odisha home address and current address)</li>
                <li>Government ID documents (Aadhar, Voter ID) for verification purposes</li>
                <li>Family member information</li>
                <li>Interests and preferences</li>
                <li>Community and event participation data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">3. How We Use Your Information</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Create and manage your account and profile</li>
                <li>Verify your identity for community membership</li>
                <li>Connect you with other Odias in your community</li>
                <li>Organize and manage events and gatherings</li>
                <li>Send you updates about community activities</li>
                <li>Improve our platform and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">4. Information Sharing</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4 mt-2">
                <li>Other verified members of your community (with your consent)</li>
                <li>Service providers who assist us in operating our platform</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">5. Data Security</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information. Your documents are encrypted and stored securely, accessible only to authorized administrators for verification purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">6. Your Rights</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">7. Cookies</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We use cookies to enhance your experience on our platform. You can control cookie preferences through your browser settings. For more details, please see our <a href="/cookies" className="text-[#6B1E5B] hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">8. Contact Us</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-3 space-y-2 text-[#6B5E5A]">
                {contactInfo?.contact?.contactEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#6B1E5B]" />
                    <a href={`mailto:${contactInfo.contact.contactEmail}`} className="hover:text-[#6B1E5B] transition-colors">
                      {contactInfo.contact.contactEmail}
                    </a>
                  </p>
                )}
                {contactInfo?.contact?.phone1 && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#6B1E5B]" />
                    <a href={`tel:${contactInfo.contact.phone1.replace(/\s/g, '')}`} className="hover:text-[#6B1E5B] transition-colors">
                      {contactInfo.contact.phone1}
                    </a>
                  </p>
                )}
                {contactInfo?.contact?.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6B1E5B]" />
                    <span>{contactInfo.contact.address}</span>
                  </p>
                )}
              </div>
            </section>

            <div className="pt-4 border-t border-[#E7D7E8] text-xs text-[#6B5E5A]/60">
              <p>&copy; {currentYear} Prabasi Odia. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}