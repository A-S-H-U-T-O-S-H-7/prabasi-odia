"use client";

import { useState, useEffect } from "react";
import { X, Users, User, CheckCircle, XCircle } from "lucide-react";
import { Event } from "@/lib/services/adminEventService";
import { adminEventService } from "@/lib/services/adminEventService";

interface EventAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

interface Attendee {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isVerified: boolean;
}

export default function EventAttendeesModal({
  isOpen,
  onClose,
  event,
}: EventAttendeesModalProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && event) {
      fetchAttendees();
    }
  }, [isOpen, event]);

  const fetchAttendees = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const result = await adminEventService.getEventAttendees(event.id);
      if (result.success) {
        setAttendees(result.attendees as Attendee[]);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-[#E7D7E8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7D7E8] flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#2A1636]">👥 Event Attendees</h2>
            <p className="text-sm text-[#6B5E5A]">
              {event.title} • {event.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#6B1E5B]/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer text-[#6B5E5A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#6B1E5B] border-t-transparent" />
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[#6B5E5A]/30 mx-auto" />
              <p className="text-[#6B5E5A] mt-3">No attendees for this event yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.uid}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-[#E7D7E8]/50 hover:border-[#6B1E5B]/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B1E5B] to-[#D9772B] flex items-center justify-center text-white font-bold text-sm">
                    {attendee.displayName?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2A1636] truncate">
                      {attendee.displayName || "Unknown User"}
                    </p>
                    <p className="text-xs text-[#6B5E5A] truncate">{attendee.email}</p>
                  </div>
                  <div>
                    {attendee.isVerified ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B5E5A] flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[#E7D7E8] flex-shrink-0">
          <div className="text-sm text-[#6B5E5A]">
            Total: {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer bg-[#6B1E5B] text-white hover:bg-[#531547]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}