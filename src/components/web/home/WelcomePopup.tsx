"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Sparkles, ArrowRight, CheckCircle, Globe } from "lucide-react";
import Image from "next/image";

interface WelcomePopupProps {
  onClose?: () => void;
}

type Language = "en" | "hi" | "or";

const translations = {
  en: {
    title: "Welcome to Prabasi Odia",
    subtitle: "Your home away from home",
    join: "Join Community",
    skip: "Skip for now",
    whatYouGet: "What you get:",
    faqs: [
      {
        question: "What is Prabasi Odia?",
        answer:
          "A heartfelt community where Odias from every corner of the world come together. We celebrate our culture, share our stories, support each other, and keep the Odia spirit alive — no matter how far we are from home.",
      },
      {
        question: "Who can join?",
        answer:
          "Every Odia soul living outside Odisha — students chasing dreams, professionals building careers, artists creating magic, entrepreneurs shaping the future, and anyone who carries Odisha in their heart.",
      },
      {
        question: "What are the benefits?",
        answer:
          "A warm community that feels like family, opportunities to grow and give back, and a chance to be part of something bigger than yourself.",
      },
    ],
    benefits: [
      "Find your Odia family anywhere in the world",
      "Discover events, jobs, and mentorship",
      "Celebrate festivals and culture together",
      "Get verified and trusted in the community",
      "Give back through 80G tax-exempt donations",
      "Connect, learn, and grow with your people",
      "Share your journey and inspire others",
      "Be part of a global Odia movement",
    ],
  },
  hi: {
    title: "प्रबासी ओडिया में आपका स्वागत है",
    subtitle: "आपका घर, घर से दूर",
    join: "समुदाय में शामिल हों",
    skip: "अभी नहीं",
    whatYouGet: "आपको क्या मिलता है:",
    faqs: [
      {
        question: "प्रबासी ओडिया क्या है?",
        answer:
          "एक हार्दिक समुदाय जहाँ दुनिया के कोने-कोने से ओडिया एक साथ आते हैं। हम अपनी संस्कृति का जश्न मनाते हैं, अपनी कहानियाँ साझा करते हैं, एक-दूसरे का समर्थन करते हैं, और ओडिया भावना को जीवित रखते हैं — चाहे हम घर से कितनी भी दूर क्यों न हों।",
      },
      {
        question: "कौन जुड़ सकता है?",
        answer:
          "हर ओडिया आत्मा जो ओडिशा के बाहर रहती है — सपनों का पीछा करने वाले छात्र, करियर बनाने वाले पेशेवर, जादू बनाने वाले कलाकार, भविष्य को आकार देने वाले उद्यमी, और कोई भी जो अपने दिल में ओडिशा रखता है।",
      },
      {
        question: "लाभ क्या हैं?",
        answer:
          "एक गर्म समुदाय जो परिवार जैसा लगता है, बढ़ने और वापस देने के अवसर, और अपने से बड़ा कुछ बनने का मौका।",
      },
    ],
    benefits: [
      "दुनिया में कहीं भी अपना ओडिया परिवार खोजें",
      "कार्यक्रमों, नौकरियों और मार्गदर्शन की खोज करें",
      "एक साथ त्योहारों और संस्कृति का जश्न मनाएं",
      "समुदाय में सत्यापित और विश्वसनीय बनें",
      "80G कर-मुक्त दान के माध्यम से वापस दें",
      "अपने लोगों से जुड़ें, सीखें और बढ़ें",
      "अपनी यात्रा साझा करें और दूसरों को प्रेरित करें",
      "वैश्विक ओडिया आंदोलन का हिस्सा बनें",
    ],
  },
  or: {
    title: "ପ୍ରବାସୀ ଓଡ଼ିଆରେ ଆପଣଙ୍କୁ ସ୍ଵାଗତ",
    subtitle: "ଆପଣଙ୍କର ଦ୍ୱିତୀୟ ଘର",
    join: "ସମୁଦାୟରେ ଯୋଗ ଦିଅନ୍ତୁ",
    skip: "ପରେ",
    whatYouGet: "ଆପଣ କଣ ପାଆନ୍ତି:",
    faqs: [
      {
        question: "ପ୍ରବାସୀ ଓଡ଼ିଆ କ'ଣ?",
        answer:
          "ଏକ ହୃଦୟସ୍ପର୍ଶୀ ସମୁଦାୟ ଯେଉଁଠାରେ ବିଶ୍ୱର ପ୍ରତ୍ୟେକ କୋଣରୁ ଓଡ଼ିଆମାନେ ଏକାଠି ହୁଅନ୍ତି। ଆମେ ଆମର ସଂସ୍କୃତିକୁ ପାଳନ କରୁ, ଆମର କାହାଣୀ ବାଣ୍ଟୁ, ପରସ୍ପରକୁ ସମର୍ଥନ କରୁ, ଏବଂ ଓଡ଼ିଆ ଚେତନାକୁ ଜୀବିତ ରଖୁ — ଯେତେ ଦୂରରେ ଥାଉ ନା କାହିଁକି।",
      },
      {
        question: "କିଏ ଯୋଗ ଦେଇପାରିବ?",
        answer:
          "ଓଡ଼ିଶା ବାହାରେ ରହୁଥିବା ପ୍ରତ୍ୟେକ ଓଡ଼ିଆ ଆତ୍ମା — ସ୍ୱପ୍ନ ଦେଖୁଥିବା ଛାତ୍ର, କ୍ୟାରିୟର ଗଢୁଥିବା ବୃତ୍ତିଗତ, ଜାଦୁ ସୃଷ୍ଟି କରୁଥିବା କଳାକାର, ଭବିଷ୍ୟତ ଗଢୁଥିବା ଉଦ୍ୟୋଗୀ, ଏବଂ ଯେ କେହି ମନରେ ଓଡ଼ିଶାକୁ ଧରିଥାଏ।",
      },
      {
        question: "ଲାଭ କ'ଣ?",
        answer:
          "ଏକ ଉଷ୍ମ ସମୁଦାୟ ଯାହା ପରିବାର ପରି ଅନୁଭବ କରେ, ବଢ଼ିବା ଏବଂ ଫେରାଇ ଦେବାର ସୁଯୋଗ, ଏବଂ ନିଜଠାରୁ ବଡ଼ କିଛିର ଅଂଶ ହେବାର ସୁଯୋଗ।",
      },
    ],
    benefits: [
      "ଦୁନିଆରେ ଯେଉଁଠି ହେଉ ଆପଣଙ୍କ ଓଡ଼ିଆ ପରିବାର ଖୋଜନ୍ତୁ",
      "ଇଭେଣ୍ଟ, ଚାକିରି ଏବଂ ମାର୍ଗଦର୍ଶନ ଆବିଷ୍କାର କରନ୍ତୁ",
      "ଏକାଠି ପର୍ବପର୍ବାଣୀ ଏବଂ ସଂସ୍କୃତି ପାଳନ କରନ୍ତୁ",
      "ସମୁଦାୟରେ ସତ୍ୟାପିତ ଏବଂ ବିଶ୍ୱସ୍ତ ହୁଅନ୍ତୁ",
      "80G ଟିକସ-ମୁକ୍ତ ଦାନ ମାଧ୍ୟମରେ ଫେରାଇ ଦିଅନ୍ତୁ",
      "ଆପଣଙ୍କ ଲୋକଙ୍କ ସହ ଯୋଡ଼ି ହୁଅନ୍ତୁ, ଶିଖନ୍ତୁ ଏବଂ ବଢନ୍ତୁ",
      "ଆପଣଙ୍କ ଯାତ୍ରା ବାଣ୍ଟନ୍ତୁ ଏବଂ ଅନ୍ୟମାନଙ୍କୁ ପ୍ରେରଣା ଦିଅନ୍ତୁ",
      "ବିଶ୍ୱସ୍ତରୀୟ ଓଡ଼ିଆ ଆନ୍ଦୋଳନର ଅଂଶ ହୁଅନ୍ତୁ",
    ],
  },
};

const languageOptions = [
  { code: "en" as const, label: "EN" },
  { code: "hi" as const, label: "हिं" },
  { code: "or" as const, label: "ଓଡ଼" },
];

export default function WelcomePopup({ onClose }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("welcome_popup_seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("welcome_popup_seen", "true");
    onClose?.();
  };

  const handleJoinNow = () => {
    setIsOpen(false);
    sessionStorage.setItem("welcome_popup_seen", "true");
    onClose?.();
    window.location.href = "/join-community";
  };

  const t = translations[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#1B0E19]/55 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Centering wrapper — flex-centers on every breakpoint instead of
              relying on manual top/inset math, which is what let content
              overflow past the viewport before. Padding here guarantees
              breathing room from the screen edge at every size. */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="pointer-events-auto w-full sm:max-w-[560px] md:max-w-[640px] lg:max-w-[680px] max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden rounded-[28px] bg-white/97 backdrop-blur-xl shadow-2xl border border-white/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar — close + language switcher live here, outside the
                  scroll area, so they never scroll away or overlap content */}
              <div className="relative shrink-0 flex items-center justify-end gap-2 px-4 pt-4 pb-1">
                <div className="flex items-center gap-1 bg-[#4A1942]/[0.06] rounded-full p-0.5 border border-[#DDD0BC]/60">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                        language === lang.code
                          ? "bg-[#4A1942] text-white shadow-sm"
                          : "text-[#7A6A5E] hover:text-[#4A1942] hover:bg-[#4A1942]/5"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="p-1.5 rounded-full hover:bg-[#4A1942]/5 transition-all duration-300 hover:rotate-90 cursor-pointer text-[#7A6A5E] hover:text-[#4A1942]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content — min-h-0 is the actual fix: without it,
                  a flex-1 child refuses to shrink below its content height,
                  so it silently overflowed the modal's max-height and the
                  bottom got clipped by overflow-hidden instead of scrolling. */}
              <div className="popup-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 pb-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/logo.png"
                      alt="Prabasi Odia"
                      width={68}
                      height={68}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2A1636]">
                    {t.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6A5E] mt-0.5 italic">
                    {t.subtitle}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#DDD0BC] to-transparent mb-4" />

                {/* FAQs */}
                <div className="space-y-2.5">
                  {t.faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                      className="bg-[#F7F1E3]/70 rounded-xl p-3.5 border border-[#DDD0BC]/50"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#4A1942]/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#4A1942]">
                          {index === 0 ? (
                            <Globe className="w-3.5 h-3.5" />
                          ) : index === 1 ? (
                            <Users className="w-3.5 h-3.5" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#2A1636]">
                            {faq.question}
                          </h3>
                          <p className="text-xs text-[#7A6A5E] mt-1 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4"
                >
                  <p className="text-xs font-semibold text-[#2A1636] mb-2">
                    ❤️ {t.whatYouGet}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {t.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#4A1942]/5 rounded-lg px-2.5 py-1.5"
                      >
                        <CheckCircle className="w-3 h-3 text-[#4A1942] flex-shrink-0" />
                        <span className="text-[10.5px] font-medium text-[#2A1636] leading-tight">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#DDD0BC] to-transparent my-4" />

                {/* Footer buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-col items-center gap-2 pb-1"
                >
                  <button
                    type="button"
                    onClick={handleJoinNow}
                    style={{ background: "linear-gradient(120deg, #4A1942 0%, #C1440E 100%)" }}
                    className="w-full px-6 py-3 rounded-xl text-white font-semibold shadow-md shadow-[#4A1942]/20 hover:shadow-[#4A1942]/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    {t.join}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-[#7A6A5E] hover:text-[#4A1942] transition-colors duration-300 cursor-pointer font-medium"
                  >
                    {t.skip}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Real custom scrollbar — the scrollbar-thin / scrollbar-thumb-*
              utility classes used before require the tailwind-scrollbar
              plugin; without it they're inert and you fall back to the
              browser default, which auto-hides on macOS/most mobile
              browsers and looks like "no scrolling" even when it works. */}
          <style jsx global>{`
            .popup-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .popup-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .popup-scroll::-webkit-scrollbar-thumb {
              background: #ddd0bc;
              border-radius: 9999px;
            }
            .popup-scroll::-webkit-scrollbar-thumb:hover {
              background: #4a1942;
            }
            .popup-scroll {
              scrollbar-width: thin;
              scrollbar-color: #ddd0bc transparent;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}