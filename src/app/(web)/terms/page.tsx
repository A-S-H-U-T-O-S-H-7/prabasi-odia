"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { getContactInfo } from "@/lib/services/settingsService";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-[#6B5E5A] mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-6 text-[#2A1636]">
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">1. Acceptance of Terms</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                By using Prabasi Odia ("we," "us," or "our"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">2. Eligibility</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                You must be at least 18 years old to create an account and use our platform. By creating an account, you represent that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">3. Account Registration</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">
                When you register an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Keep your account credentials secure</li>
                <li>Notify us of any unauthorized use of your account</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">4. User Conduct</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">You agree to use our platform responsibly and agree not to:</p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Harass, abuse, or harm other members</li>
                <li>Post false or misleading information</li>
                <li>Share inappropriate or offensive content</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any illegal activities</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">5. Content and Intellectual Property</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                All content on this platform, including text, graphics, logos, and software, is the property of Prabasi Odia or its content suppliers and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">6. Privacy and Data</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                Your privacy is important to us. Please review our <a href="/privacy" className="text-[#6B1E5B] hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">7. Verification and Documents</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                By submitting documents for verification (Aadhar, Voter ID, etc.), you confirm that they are genuine and belong to you. We reserve the right to verify these documents and reject applications that do not meet our standards.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">8. Termination</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that violates these terms or is harmful to our community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">9. Limitation of Liability</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                Prabasi Odia is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">10. Contact Us</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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