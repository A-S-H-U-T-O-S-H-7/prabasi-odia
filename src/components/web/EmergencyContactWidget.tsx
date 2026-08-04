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
      className="notranslate fixed bottom-5 right-4 sm:bottom-8 sm:right-6 z-[60] flex flex-col items-end gap-3"
    >
      {/* Panel */}
      {open && (
        <div className="w-[min(92vw,340px)] max-h-[70vh] overflow-hidden rounded-2xl bg-white border border-[#E7D7E8] shadow-2xl shadow-[#2A1636]/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-gradient-to-r from-[#B91C1C] via-[#DC2626] to-[#D9772B] px-4 py-3.5 flex items-center justify-between">
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

          <div className="overflow-y-auto max-h-[calc(70vh-64px)] p-2.5 space-y-1.5">
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
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FFF9F2] border border-transparent hover:border-[#E7D7E8] transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
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
        className="flex items-center gap-2 rounded-full shadow-lg shadow-red-500/40 cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r from-[#B91C1C] to-[#DC2626] text-white pl-3.5 pr-5 py-3.5"
      >
        <span className="flex items-center justify-center rounded-full bg-white/20 w-9 h-9">
          {open ? <X className="w-[18px] h-[18px]" /> : <Phone className="w-[18px] h-[18px]" />}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap">
          {open ? "Close" : "Emergency"}
        </span>
      </button>
    </div>
  );
}
