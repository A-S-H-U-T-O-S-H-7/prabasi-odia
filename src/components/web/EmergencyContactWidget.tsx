"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  X,
  Ambulance,
  Shield,
  Flame,
  Hospital,
  Headphones,
  AlertTriangle,
  MapPin,
  ChevronRight,
} from "lucide-react";
import {
  adminEmergencyContactService,
  EmergencyContact,
  EmergencyCategory,
} from "@/lib/services/adminEmergencyContactService";

const CATEGORY_ICON: Record<EmergencyCategory, typeof Phone> = {
  ambulance: Ambulance,
  police: Shield,
  emergency: AlertTriangle,
  "women-helpline": Headphones,
  railway: Phone,
  lpg: Flame,
  "cyber-crime": Shield,
  fire: Flame,
  hospital: Hospital,
  helpline: Headphones,
  other: AlertTriangle,
};

const CATEGORY_COLOR: Record<EmergencyCategory, string> = {
  ambulance: "bg-red-100 text-red-600",
  police: "bg-blue-100 text-blue-600",
  emergency: "bg-amber-100 text-amber-600",
  "women-helpline": "bg-pink-100 text-pink-600",
  railway: "bg-indigo-100 text-indigo-600",
  lpg: "bg-orange-100 text-orange-600",
  "cyber-crime": "bg-slate-100 text-slate-600",
  fire: "bg-orange-100 text-orange-600",
  hospital: "bg-emerald-100 text-emerald-600",
  helpline: "bg-purple-100 text-purple-600",
  other: "bg-[#6B1E5B]/10 text-[#6B1E5B]",
};

export default function EmergencyContactWidget() {
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await adminEmergencyContactService.getActiveContacts();
        if (!cancelled && result.success) {
          setContacts(result.contacts);
        }
      } catch (error) {
        console.error("Error loading emergency contacts:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      data-no-translate
      translate="no"
      className="notranslate fixed bottom-3 right-2 z-[60] flex max-w-[calc(100vw-1rem)] flex-col items-end gap-2 sm:bottom-8 sm:right-6 sm:max-w-none sm:gap-3"
    >
      {/* Panel */}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Emergency contacts" className="w-[calc(100vw-1rem)] max-w-sm max-h-[78svh] overflow-hidden rounded-xl border border-[#E7D7E8] bg-white shadow-2xl shadow-[#2A1636]/20 animate-in fade-in slide-in-from-bottom-2 duration-200 sm:w-96 sm:max-h-[70vh] sm:rounded-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#D9772B] px-3 py-2.5 sm:px-4 sm:py-3">
            <div>
              <p className="text-white font-serif font-bold text-base leading-tight">
                Emergency Contact
              </p>
              <p className="text-white/80 text-[11px] mt-0.5">
                Tap a number to call instantly
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[calc(78svh-60px)] space-y-1 overflow-y-auto p-2 sm:max-h-[calc(70vh-64px)] sm:space-y-1.5 sm:p-2.5">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-[#6B5E5A] text-center py-6 px-3">
                No emergency contacts available yet.
              </p>
            ) : (
              contacts.map((contact) => {
                const Icon = CATEGORY_ICON[contact.category] || AlertTriangle;
                const color =
                  CATEGORY_COLOR[contact.category] || CATEGORY_COLOR.other;

                return (
                  <a
                    key={contact.id}
                    href={`tel:${contact.phone}`}
                    className="group flex items-center gap-2 rounded-lg border border-transparent p-2.5 transition-all hover:border-[#E7D7E8] hover:bg-[#FFF9F2] sm:gap-3 sm:rounded-xl sm:p-3"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${color}`}
                    >
                      <span className="text-lg leading-none">
                        {contact.category === "ambulance" && "🚑"}
                        {contact.category === "police" && "👮"}
                        {contact.category === "emergency" && "🚨"}
                        {contact.category === "women-helpline" && "👩‍⚕️"}
                        {contact.category === "railway" && "🚆"}
                        {contact.category === "lpg" && "⛽"}
                        {contact.category === "cyber-crime" && "💻"}
                        {contact.category === "fire" && "🔥"}
                        {contact.category === "hospital" && "🏥"}
                        {contact.category === "helpline" && "📞"}
                        {contact.category === "other" && "🆘"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2A1636] truncate group-hover:text-[#B91C1C] transition-colors">
                        
                        {contact.title}
                      </p>
                      <p className="text-sm font-medium text-[#6B1E5B] mt-0.5">
                        {contact.phone}
                      </p>
                      {contact.description && (
                        <p className="text-[11px] text-[#6B5E5A] truncate mt-0.5">
                          {contact.description}
                        </p>
                      )}
                      {contact.address && (
                        <p className="text-[11px] text-[#6B5E5A]/80 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {contact.address}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B5E5A]/40 group-hover:text-[#B91C1C] flex-shrink-0" />
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sticky button — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close emergency contacts" : "Open emergency contacts"}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-[#B91C1C] to-[#DC2626] py-2 pl-3 pr-3.5 text-white shadow-lg shadow-red-500/40 transition-transform hover:scale-105 active:scale-95 sm:py-3 sm:pl-3.5 sm:pr-5"
      >
        <span className="flex items-center justify-center rounded-full bg-white/20 w-7 h-7 md:w-9 md:h-9">
          {open ? <X className="w-4 h-4 md:w-[18px] md:h-[18px]" /> : <Phone className="w-4 h-4 md:w-[18px] md:h-[18px]" />}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap">
          {open ? "Close" : "Emergency"}
        </span>
      </button>
    </div>
  );
}
