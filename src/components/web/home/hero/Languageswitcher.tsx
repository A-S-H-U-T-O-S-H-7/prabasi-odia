"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check, LoaderCircle } from "lucide-react";
import { LANGUAGES, useTranslation } from "@/components/web/translation/TranslationProvider";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { language: current, isTranslating, changeLanguage } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find((language) => language.code === current) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button type="button" onClick={() => setOpen((value) => !value)} disabled={isTranslating} aria-label="Choose website language" className="flex items-center gap-1.5 rounded-full border border-[#F4D3BE] bg-white/80 px-3 py-1.5 shadow-lg backdrop-blur-md transition hover:bg-white disabled:cursor-wait disabled:opacity-80 sm:gap-2 sm:px-4 sm:py-2">
        {isTranslating ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#6B1E5B] sm:h-4 sm:w-4" /> : <Globe className="h-3.5 w-3.5 text-[#6B1E5B] sm:h-4 sm:w-4" />}
        <span className="text-[12px] font-semibold text-[#6B1E5B] sm:text-sm">{activeLang.native}</span>
        <ChevronDown className={`h-3 w-3 text-[#D9772B] transition-transform sm:h-3.5 sm:w-3.5 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-[#F4D3BE] bg-white shadow-xl">
          {LANGUAGES.map((language) => <button key={language.code} type="button" onClick={() => { void changeLanguage(language.code); setOpen(false); }} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-[#FFF3EA]">
            <span className="flex flex-col"><span className="font-medium text-[#2A1636]">{language.native}</span><span className="text-[11px] text-[#6B5E5A]">{language.label}</span></span>
            {current === language.code && <Check className="h-4 w-4 text-[#D9772B]" />}
          </button>)}
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
