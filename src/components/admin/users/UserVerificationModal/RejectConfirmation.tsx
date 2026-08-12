"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X, Loader2 } from "lucide-react";

interface RejectConfirmationProps {
  showRejectForm: boolean;
  setShowRejectForm: (show: boolean) => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  handleReject: () => void;
  isVerifying: boolean;
  userDisplayName: string;
}

export function RejectConfirmation({
  showRejectForm,
  setShowRejectForm,
  rejectReason,
  setRejectReason,
  handleReject,
  isVerifying,
  userDisplayName,
}: RejectConfirmationProps) {
  return (
    <AnimatePresence>
      {showRejectForm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => {
              if (!isVerifying) {
                setShowRejectForm(false);
                setRejectReason("");
              }
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[#FFF9F2] border border-white/60 shadow-2xl pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7D7E8]">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#2A1636]">Reject Member</h3>
                    <p className="text-xs text-[#6B5E5A] truncate max-w-[220px]">
                      {userDisplayName || "Unknown User"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isVerifying) {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-[#6B1E5B]/5 transition-colors cursor-pointer"
                  disabled={isVerifying}
                >
                  <X className="w-4 h-4 text-[#6B5E5A]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#2A1636] block mb-1.5">
                    Reason for rejection
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none text-sm resize-none h-28"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isVerifying) {
                        setShowRejectForm(false);
                        setRejectReason("");
                      }
                    }}
                    disabled={isVerifying}
                    className="flex-1 py-2.5 rounded-xl border border-[#D4C8C0]/60 text-[#6B5E5A] font-medium hover:bg-white/80 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isVerifying}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}