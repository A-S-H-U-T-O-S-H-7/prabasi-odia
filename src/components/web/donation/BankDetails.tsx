"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CreditCard, Banknote, Copy, Check, ChevronDown, Globe } from 'lucide-react';

interface BankDetailsProps {
  donorType?: 'indian' | 'foreign';
}

export default function BankDetails({ donorType = 'indian' }: BankDetailsProps) {
  const [activeTab, setActiveTab] = useState<'indian' | 'international'>('indian');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(donorType === 'foreign' ? 'international' : 'indian');
  }, [donorType]);

  const indianBankDetails = {
    accountName: "Samudayik Vikas Samiti",
    accountNo: "083101002804",
    ifscCode: "ICIC0000831",
    accountType: "SAVING",
    bankName: "ICICI BANK",
    branch: "LAXMI NAGAR BRANCH",
    city: "DELHI"
  };

  const internationalBankDetails = {
    accountName: "FCRA Samudayik Vikas Samiti",
    accountNo: "40052522428",
    swiftCode: "SBININBB104",
    accountType: "SAVING",
    bankName: "SBI BANK",
    branch: "FCRA Cell, 4th Floor, State Bank of India, New Delhi Main Branch, 11, Sansad Marg, New Delhi-110001",
    city: "DELHI"
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderField = (label: string, value: string, fieldKey: string) => (
    <div className="flex items-center justify-between py-2 border-b border-[#D4C8C0]/20 last:border-0">
      <span className="text-sm font-medium text-[#6B5E5A]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#2A1636]">{value}</span>
        <button
          onClick={() => handleCopy(value, fieldKey)}
          className="p-1 rounded-lg hover:bg-[#6B1E5B]/10 transition-colors text-[#6B5E5A] hover:text-[#6B1E5B]"
        >
          {copiedField === fieldKey ? (
            <Check className="w-3.5 h-3.5 text-green-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );

  const currentDetails = activeTab === 'indian' ? indianBankDetails : internationalBankDetails;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#6B1E5B]" />
          <h3 className="text-lg font-bold text-[#2A1636]">Bank Details</h3>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#F0EAE6] rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('indian')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
              activeTab === 'indian'
                ? 'bg-[#6B1E5B] text-white shadow-lg shadow-[#6B1E5B]/20'
                : 'text-[#6B5E5A] hover:text-[#2A1636]'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Indian
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
              activeTab === 'international'
                ? 'bg-[#6B1E5B] text-white shadow-lg shadow-[#6B1E5B]/20'
                : 'text-[#6B5E5A] hover:text-[#2A1636]'
            }`}
          >
            <Globe className="w-4 h-4" />
            International
          </button>
        </div>

        {/* Bank Details Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-4 ${
              activeTab === 'indian'
                ? 'bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5 border border-[#6B1E5B]/10'
                : 'bg-gradient-to-br from-[#D9772B]/5 to-[#6B1E5B]/5 border border-[#D9772B]/10'
            }`}
          >
            <div className="space-y-1">
              {renderField('Account Name', currentDetails.accountName, 'accountName')}
              {renderField('Account Number', currentDetails.accountNo, 'accountNo')}
              {activeTab === 'indian'
                ? renderField('IFSC Code', indianBankDetails.ifscCode, 'ifsc')
                : renderField('SWIFT Code', internationalBankDetails.swiftCode, 'swift')}
              {renderField('Bank Name', currentDetails.bankName, 'bankName')}
              {renderField('Branch', currentDetails.branch, 'branch')}
              {renderField('City', currentDetails.city, 'city')}
            </div>

            <div className="mt-4 pt-4 border-t border-[#D4C8C0]/20">
              <p className="text-xs text-[#6B5E5A] flex items-center gap-1.5">
                <span className="text-[#D9772B]">⏰</span>
                Please mention <span className="font-semibold text-[#2A1636]">"Donation"</span> in the remarks
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
