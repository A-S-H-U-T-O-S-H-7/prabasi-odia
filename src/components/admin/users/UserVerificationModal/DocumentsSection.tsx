"use client";

import { FileText, User } from "lucide-react";
import { FaPassport } from "react-icons/fa";
import Image from "next/image";
import { UserData } from "@/lib/services/adminUserService";
import { DocumentViewer } from "./DocumentViewer";

interface DocumentsSectionProps {
  user: UserData;
  hasAadharFront: string | undefined;
  hasAadharBack: string | undefined;
  hasPassportFile: string | undefined;
}

export function DocumentsSection({ user, hasAadharFront, hasAadharBack, hasPassportFile }: DocumentsSectionProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/60 shadow-sm">
      <h4 className="text-sm font-semibold text-[#2A1636] mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#6B1E5B]" />
        Uploaded Documents
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Profile Photo */}
        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-[#D4C8C0]/30">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#2A1636] truncate">Profile Photo</p>
            {user.photoURL ? (
              <button onClick={() => window.open(user.photoURL, '_blank')} className="text-xs text-[#6B1E5B] hover:underline">
                View
              </button>
            ) : (
              <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
            )}
          </div>
        </div>

        {/* Aadhar Front */}
        <DocumentStatusCard
          label="Aadhar Front"
          hasDocument={!!hasAadharFront}
          url={hasAadharFront}
          icon={<FileText className="w-5 h-5 text-[#6B1E5B]" />}
          emptyIcon={<FileText className="w-5 h-5 text-gray-400" />}
        />

        {/* Aadhar Back */}
        <DocumentStatusCard
          label="Aadhar Back"
          hasDocument={!!hasAadharBack}
          url={hasAadharBack}
          icon={<FileText className="w-5 h-5 text-[#6B1E5B]" />}
          emptyIcon={<FileText className="w-5 h-5 text-gray-400" />}
        />

        {/* Passport File */}
        <DocumentStatusCard
          label="Passport File"
          hasDocument={!!hasPassportFile}
          url={hasPassportFile}
          icon={<FaPassport className="w-5 h-5 text-[#D9772B]" />}
          emptyIcon={<FaPassport className="w-5 h-5 text-gray-400" />}
          iconBg="bg-[#D9772B]/10"
        />
      </div>
    </div>
  );
}

interface DocumentStatusCardProps {
  label: string;
  hasDocument: boolean;
  url?: string;
  icon: React.ReactNode;
  emptyIcon: React.ReactNode;
  iconBg?: string;
}

function DocumentStatusCard({ label, hasDocument, url, icon, emptyIcon, iconBg = "bg-[#6B1E5B]/10" }: DocumentStatusCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      hasDocument ? 'bg-white/50 border-[#D4C8C0]/30' : 'bg-gray-50/50 border-[#D4C8C0]/20'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        hasDocument ? iconBg : 'bg-gray-100'
      }`}>
        {hasDocument ? icon : emptyIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#2A1636] truncate">{label}</p>
        {hasDocument ? (
          <DocumentViewer url={url} label={label} />
        ) : (
          <p className="text-xs text-[#6B5E5A]/50">Not uploaded</p>
        )}
      </div>
    </div>
  );
}