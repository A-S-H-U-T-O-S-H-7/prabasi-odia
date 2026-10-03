'use client';

import { useState } from 'react';
import { Globe2, House, MapPin } from 'lucide-react';
import type { JoinResidencyStatus } from '@/lib/residency';

type Language = 'en' | 'or' | 'hi';

const translations: Record<Language, {
  welcome: string;
  heading: string;
  description: string;
  choices: Record<JoinResidencyStatus, { title: string; detail: string }>;
}> = {
  en: {
    welcome: 'Welcome to Prabasi Odia',
    heading: 'How would you like to join?',
    description: 'Choose where you currently live. We will show the right form for you.',
    choices: {
      NRI: { title: 'NRI · Odia living abroad', detail: 'I am from Odisha and live outside India.' },
      RI: { title: 'RI · Odia living elsewhere in India', detail: 'I am from Odisha and live in another Indian state.' },
      RO: { title: 'Odia living in Odisha', detail: 'I am from Odisha and live in Odisha.' },
    },
  },
  or: {
    welcome: 'ପ୍ରବାସୀ ଓଡ଼ିଆରେ ସ୍ୱାଗତ',
    heading: 'ଆପଣ କିପରି ଯୋଗ ଦେବାକୁ ଚାହାଁନ୍ତି?',
    description: 'ଆପଣ ବର୍ତ୍ତମାନ କେଉଁଠି ରହୁଛନ୍ତି ବାଛନ୍ତୁ। ଆମେ ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଫର୍ମ ଦେଖାଇବୁ।',
    choices: {
      NRI: { title: 'NRI · ବିଦେଶରେ ରହୁଥିବା ଓଡ଼ିଆ', detail: 'ମୁଁ ଓଡ଼ିଶାର, କିନ୍ତୁ ଭାରତ ବାହାରେ ରହୁଛି।' },
      RI: { title: 'RI · ଅନ୍ୟ ଭାରତୀୟ ରାଜ୍ୟରେ ରହୁଥିବା ଓଡ଼ିଆ', detail: 'ମୁଁ ଓଡ଼ିଶାର, କିନ୍ତୁ ଅନ୍ୟ ଏକ ଭାରତୀୟ ରାଜ୍ୟରେ ରହୁଛି।' },
      RO: { title: 'ଓଡ଼ିଶାରେ ରହୁଥିବା ଓଡ଼ିଆ', detail: 'ମୁଁ ଓଡ଼ିଶାର ଏବଂ ଓଡ଼ିଶାରେ ରହୁଛି।' },
    },
  },
  hi: {
    welcome: 'प्रवासी ओड़िया में आपका स्वागत है',
    heading: 'आप कैसे जुड़ना चाहेंगे?',
    description: 'चुनें कि आप अभी कहाँ रहते हैं। हम आपके लिए सही फ़ॉर्म दिखाएँगे।',
    choices: {
      NRI: { title: 'NRI · विदेश में रहने वाले ओड़िया', detail: 'मैं ओडिशा से हूँ और भारत के बाहर रहता/रहती हूँ।' },
      RI: { title: 'RI · भारत के दूसरे राज्य में रहने वाले ओड़िया', detail: 'मैं ओडिशा से हूँ और भारत के किसी दूसरे राज्य में रहता/रहती हूँ।' },
      RO: { title: 'ओडिशा में रहने वाले ओड़िया', detail: 'मैं ओडिशा से हूँ और ओडिशा में ही रहता/रहती हूँ।' },
    },
  },
};

const choices = [
  {
    value: 'NRI',
    icon: Globe2,
    card: 'border-sky-200 bg-gradient-to-br from-sky-50 to-blue-100/60 hover:border-sky-400 hover:from-sky-100 hover:to-blue-100',
    iconStyle: 'bg-sky-100 text-sky-700',
  },
  {
    value: 'RI',
    icon: MapPin,
    card: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100/60 hover:border-emerald-400 hover:from-emerald-100 hover:to-green-100',
    iconStyle: 'bg-emerald-100 text-emerald-700',
  },
  {
    value: 'RO',
    icon: House,
    card: 'border-violet-200 bg-gradient-to-br from-violet-50 to-purple-100/60 hover:border-violet-400 hover:from-violet-100 hover:to-purple-100',
    iconStyle: 'bg-violet-100 text-violet-700',
  },
] as const;

const languageOptions: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'or', label: 'ଓଡ଼ି' },
];

export default function JoinTypeDialog({ onSelect }: { onSelect: (type: JoinResidencyStatus) => void }) {
  const [language, setLanguage] = useState<Language>('en');
  const content = translations[language];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#211328]/80 p-3 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-type-title"
        translate="no"
        lang={language === 'or' ? 'or' : language}
        className="notranslate my-auto w-full max-w-2xl rounded-2xl border border-white/70 bg-[#FFF9F2] p-5 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A35B30]">{content.welcome}</p>
          <div className="notranslate flex items-center gap-1 rounded-full border border-[#DDD0BC]/60 bg-[#4A1942]/[0.06] p-0.5" translate="no" aria-label="Choose language">
            {languageOptions.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-label={code === 'en' ? 'English' : code === 'hi' ? 'Hindi' : 'Odia'}
                aria-pressed={language === code}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  language === code
                    ? 'bg-[#4A1942] text-white shadow-sm'
                    : 'text-[#7A6A5E] hover:bg-[#4A1942]/5 hover:text-[#4A1942]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <h2 id="join-type-title" className="mt-2 font-serif text-2xl font-bold text-[#2A1636] sm:text-3xl">{content.heading}</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B5E5A]">{content.description}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {choices.map(({ value, icon: Icon, card, iconStyle }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={`group flex min-h-28 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] ${value === 'RO' ? 'sm:col-span-2' : ''} ${card}`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconStyle}`}><Icon size={20} /></span>
              <span>
                <span className="block text-sm font-bold text-[#2A1636]">{content.choices[value].title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#6B5E5A]">{content.choices[value].detail}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
