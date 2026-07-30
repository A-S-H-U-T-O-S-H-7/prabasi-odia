"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    // Google Translate reads the language from a hidden <select>
    // it injects into the DOM. We drive it programmatically.
    const trySetLanguage = () => {
      const select = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;

      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
        setCurrent(langCode);
        setOpen(false);
        return true;
      }
      return false;
    };

    // Widget script can take a moment to inject the select on first load
    if (!trySetLanguage()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (trySetLanguage() || attempts > 20) clearInterval(interval);
      }, 150);
    }
  };

  const activeLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#F4D3BE] bg-white/80 px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg backdrop-blur-md transition hover:bg-white"
      >
        <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B1E5B]" />
        <span className="text-[12px] sm:text-sm font-semibold text-[#6B1E5B]">
          {activeLang.native}
        </span>
        <ChevronDown
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#D9772B] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-[#F4D3BE] bg-white shadow-xl"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-[#FFF3EA]"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-[#2A1636]">
                    {lang.native}
                  </span>
                  <span className="text-[11px] text-[#6B5E5A]">
                    {lang.label}
                  </span>
                </span>
                {current === lang.code && (
                  <Check className="h-4 w-4 text-[#D9772B]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}