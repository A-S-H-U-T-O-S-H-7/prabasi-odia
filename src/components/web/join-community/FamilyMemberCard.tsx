"use client";

import { motion } from "framer-motion";
import { User, X, Edit2 } from "lucide-react";

interface FamilyMemberCardProps {
  name: string;
  age: number;
  relation: string;
  occupation?: string;
  onEdit: () => void;
  onRemove: () => void;
  index: number;
}

export default function FamilyMemberCard({
  name,
  age,
  relation,
  occupation,
  onEdit,
  onRemove,
  index,
}: FamilyMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B1E5B]/10 to-[#D9772B]/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-[#6B1E5B]/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2A1636] truncate">{name || `Family Member ${index + 1}`}</p>
          <p className="text-xs text-[#6B5E5A]">
            {age || '—'} yrs · {relation || 'Select relation'}
            {occupation && ` · 💼 ${occupation}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-2 rounded-xl text-[#6B5E5A]/40 hover:text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-300 cursor-pointer">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={onRemove} className="p-2 rounded-xl text-[#6B5E5A]/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}