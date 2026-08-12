"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X as XIcon } from "lucide-react";

interface DocumentViewerProps {
  url?: string;
  label: string;
}

export function DocumentViewer({ url, label }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!url) return null;

  const handleView = () => {
    setIsOpen(true);
    setImageError(false);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[80]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-20 z-[90] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E7D7E8] flex-shrink-0">
              <h3 className="text-lg font-semibold text-[#2A1636]">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#6B1E5B]/5 transition-colors"
              >
                <XIcon className="w-5 h-5 text-[#6B5E5A]" />
              </button>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 overflow-hidden">
              {!imageError ? (
                <img
                  src={url}
                  alt={label}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <FileText className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">Unable to load image</p>
                  <p className="text-gray-400 text-sm mt-1">The document may not be accessible</p>
                  <button
                    onClick={() => window.open(url, '_blank')}
                    className="mt-4 px-4 py-2 bg-[#6B1E5B] text-white rounded-lg hover:bg-[#531547] transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={handleView}
        className="text-xs text-[#6B1E5B] hover:underline font-medium cursor-pointer"
      >
        View
      </button>
      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}