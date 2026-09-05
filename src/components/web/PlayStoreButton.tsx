import { FaGooglePlay } from "react-icons/fa";

export default function PlayStoreButton() {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.prabasiodia&pli=1"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download the Prabasi Odia app on Google Play (opens in a new tab)"
      className="inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 bg-[#171219] px-4 py-3 text-white shadow-sm transition-colors hover:bg-[#342238] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <FaGooglePlay aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="text-left">
        <span className="block text-[10px] font-medium uppercase tracking-wider leading-tight text-white/75">
          Download on
        </span>
        <span className="block text-base font-semibold leading-tight">
          Google Play
        </span>
      </span>
    </a>
  );
}
