import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import MagazineTypingTitle from "./MagazineTypingTitle";

export default function ProjectAndMagazineSection() {
  return (
    <section
      aria-label="About the project and magazine"
      className="bg-gradient-to-b from-[#FFF9F5] via-[#FFF3EE] to-[#FFF0EB] px-4 py-4 sm:px-6 md:py-5 lg:px-10 xl:px-12"
    >
      <div className="flex w-full flex-col gap-3 md:flex-row md:justify-between md:gap-4">
        <div className="flex min-w-0 flex-col justify-between gap-2 rounded-xl border border-[#E9D9E5] bg-white p-3 shadow-sm sm:p-4 md:w-[46%] lg:max-w-lg">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-[#6B1E5B]/20 shadow-md sm:h-14 sm:w-14">
              <Image
                src="/avatar5.jpeg"
                alt="FCA(Dr) Manoranjan Mohanty"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B1E5B]">
                Project by
              </p>
              <h2 className="font-serif text-base font-bold text-[#2A1636] sm:text-lg">
                FCA(Dr) Manoranjan Mohanty
              </h2>
              <p className="mt-1 text-xs text-[#6B5E5A]">
                President of <span className="font-semibold text-[#6B1E5B]">Samudayik Vikas Samiti</span>
              </p>
            </div>
          </div>
          <Link
            href="/manoranjan-mohanty"
            className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-[#6B1E5B]/20 bg-[#FFF9F5] px-3 py-1.5 text-xs font-semibold text-[#6B1E5B] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6B1E5B]/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Know more
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>

        <Link
          href="/magazine"
          aria-label="Explore Prabasi Odia magazines"
          className="group flex min-h-32 min-w-0 overflow-hidden rounded-xl border border-[#D9B89B] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A75E37] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3A21] md:w-[46%] lg:max-w-lg"
        >
          <span className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A75E37]">
              Prabasi Odia
            </span>
            <h2 aria-label="Explore magazines">
              <MagazineTypingTitle />
            </h2>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#7C3A21]">
              Browse issues
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
          </span>
          <span className="relative w-[34%] shrink-0 overflow-hidden bg-[#7C3A21]">
            <Image
              src="/homemagz.png"
              alt=""
              fill
              sizes="(max-width: 767px) 34vw, 170px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          </span>
        </Link>
      </div>
    </section>
  );
}
