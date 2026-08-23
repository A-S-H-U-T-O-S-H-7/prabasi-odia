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

          <div className="space-y-8 text-[#2A1636]">
            {/* Section 1: Introduction */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">1. Introduction</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                Prabasi Odia ("we," "us," "our," or the "Community") is committed to protecting the privacy of our members, event attendees, and website visitors. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, register as a member, attend our events, or otherwise interact with us.
              </p>
              <p className="text-[#6B5E5A] leading-relaxed mt-3">
                By using our website or participating in our community activities, you agree to the terms of this privacy policy.
              </p>
            </section>

            {/* Section 2: Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">2. Information We Collect</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">
                We may collect the following categories of personal information:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li><strong>Contact Information:</strong> Name, email address, and phone number</li>
                <li><strong>Address/Location Information:</strong> Home address, city, or location details (e.g., for member directories, event logistics, or regional chapter organization)</li>
                <li><strong>Photos and Social Content:</strong> Photographs, videos, or other media submitted by members or captured during community events, gatherings, or celebrations, which may be shared on our website, social media pages, or newsletters</li>
              </ul>
              <p className="text-[#6B5E5A] leading-relaxed mt-3">
                We may collect this information when you:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4 mt-2">
                <li>Register as a member of Prabasi Odia</li>
                <li>Sign up for or attend an event</li>
                <li>Contact us via forms, email, or phone</li>
                <li>Submit photos or content for community publications</li>
                <li>Subscribe to updates or newsletters</li>
              </ul>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">3. How We Use Your Information</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Maintain a member directory and facilitate communication within the community</li>
                <li>Organize and coordinate events, gatherings, and cultural activities</li>
                <li>Send updates, newsletters, and event invitations</li>
                <li>Share event photos and highlights on our website or social media to celebrate community activities</li>
                <li>Respond to inquiries and provide support</li>
                <li>Improve our website and services</li>
              </ul>
            </section>

            {/* Section 4: Sharing of Information */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">4. Sharing of Information</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">
                We don't sell or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li><strong>Within the Community:</strong> Contact details may be shared with fellow members for directory purposes, unless you opt out</li>
                <li><strong>Public Content:</strong> Photos and event content may be published on our public website, social media pages, or community newsletters</li>
                <li><strong>Service Providers:</strong> With trusted third parties who help us operate the website or manage events (e.g., hosting providers), under confidentiality obligations</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect the rights, safety, or property of Prabasi Odia or its members</li>
              </ul>
            </section>

            {/* Section 5: Photos and Media */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">5. Photos and Media</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                By attending Prabasi Odia events or submitting photos/videos, you consent to their potential use on our website, social media, and promotional materials. If you don't wish to have your image or your child's image published, please notify us in writing, and we'll make reasonable efforts to accommodate your request for future publications.
              </p>
            </section>

            {/* Section 6: Your Choices and Rights */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">6. Your Choices and Rights</h2>
              <p className="text-[#6B5E5A] leading-relaxed mb-3">You may:</p>
              <ul className="list-disc list-inside text-[#6B5E5A] leading-relaxed space-y-2 ml-4">
                <li>Request access to the personal information we hold about you</li>
                <li>Request correction or updating of your information</li>
                <li>Request deletion of your information from our records (subject to legal or administrative retention needs)</li>
                <li>Opt out of having your contact details listed in the member directory</li>
                <li>Unsubscribe from newsletters or communications at any time</li>
              </ul>
              <p className="text-[#6B5E5A] leading-relaxed mt-3">
                To exercise these rights, please contact us using the details in Section 9.
              </p>
            </section>

            {/* Section 7: Data Security */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">7. Data Security</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We take reasonable technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or alteration. However, no method of transmission or storage is completely secure, and we can't guarantee absolute security.
              </p>
            </section>

            {/* Section 8: Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">8. Data Retention</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We retain personal information for as long as necessary to fulfill the purposes outlined in this policy, such as maintaining membership records and community history, unless a longer retention period is required by law or you request earlier deletion.
              </p>
            </section>

            {/* Section 9: Contact Us */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">9. Contact Us</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us at:
              </p>
              <div className="mt-4 space-y-3 text-[#6B5E5A]">
                <p className="text-sm font-medium text-[#2A1636]">Prabasi Odia</p>
                {contactInfo?.contact?.contactEmail && (
                  <p className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#6B1E5B] flex-shrink-0" />
                    <a href={`mailto:${contactInfo.contact.contactEmail}`} className="hover:text-[#6B1E5B] transition-colors">
                      {contactInfo.contact.contactEmail}
                    </a>
                  </p>
                )}
                {contactInfo?.contact?.phone1 && (
                  <p className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#6B1E5B] flex-shrink-0" />
                    <a href={`tel:${contactInfo.contact.phone1.replace(/\s/g, '')}`} className="hover:text-[#6B1E5B] transition-colors">
                      {contactInfo.contact.phone1}
                    </a>
                  </p>
                )}
                {contactInfo?.contact?.address && (
                  <p className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#6B1E5B] flex-shrink-0" />
                    <span>{contactInfo.contact.address}</span>
                  </p>
                )}
                {contactInfo?.contact?.website && (
                  <p className="flex items-center gap-3">
                    <span className="w-4 h-4 flex-shrink-0" />
                    <a href={contactInfo.contact.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#6B1E5B] transition-colors">
                      {contactInfo.contact.website}
                    </a>
                  </p>
                )}
              </div>
            </section>

            {/* Section 10: Changes to This Policy */}
            <section>
              <h2 className="text-xl font-bold text-[#2A1636] mb-3">10. Changes to This Policy</h2>
              <p className="text-[#6B5E5A] leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We'll post the revised policy on this page with an updated effective date. We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Footer */}
            <div className="pt-6 border-t border-[#E7D7E8] text-xs text-[#6B5E5A]/60">
              <p>&copy; {currentYear} Prabasi Odia. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}