import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { adivasiStories } from './experienceData';

export default function AdivasiSection() {
  return (
    <section id="adivasi-odisha" className="scroll-mt-20 bg-[#49382E] px-4 py-14 text-white sm:px-6 lg:px-0 lg:py-18">
      <div className="mx-auto max-w-[90rem] lg:mx-10 2xl:mx-auto">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E9BC8D]">04 / Adivasi Odisha</p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Many communities. <span className="italic font-normal text-[#F1C79B]">Many living stories.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/75">Odisha’s Adivasi communities have distinct languages, knowledge, arts and histories. Explore with curiosity, care and respect for the people who keep these traditions alive.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adivasiStories.map((story) => (
            <a
              key={story.title}
              href={story.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Learn about ${story.title} on Odisha Tourism (opens in a new tab)`}
              className="group overflow-hidden rounded-[1.6rem] border border-white/20 bg-[#5B483A] transition-colors hover:border-[#E9BC8D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="relative block aspect-[16/10] overflow-hidden bg-[#776150]">
                <Image src={story.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="block p-5 sm:p-6">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-serif text-xl font-bold">{story.title}</span>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#F1C79B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
                <span className="mt-2 block text-sm font-medium leading-6 text-[#F1C79B]">{story.description}</span>
                <span className="mt-2 block text-sm leading-6 text-white/70">{story.detail}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-xs leading-6 text-white/60">Images are illustrative. The linked official guide is a starting point for learning; travel into communities should follow local guidance and consent.</p>
      </div>
    </section>
  );
}
