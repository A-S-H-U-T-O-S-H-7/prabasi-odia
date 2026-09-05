import Image from "next/image";
import PlayStoreButton from "@/components/web/PlayStoreButton";

export default function AppDownloadBanner() {
  return (
    <section
      aria-labelledby="app-download-heading"
      className="w-full bg-gradient-to-r from-[#2A1636] to-[#6B1E5B] px-4 py-5 sm:px-6 lg:px-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm">
            <Image
              src="/logoicon.png"
              alt="Prabasi Odia app"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h2
              id="app-download-heading"
              className="text-xl font-serif font-bold text-white sm:text-2xl"
            >
              Download our app
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Stay connected with Prabasi Odia, wherever you go.
            </p>
          </div>
        </div>
        <PlayStoreButton />
      </div>
    </section>
  );
}
