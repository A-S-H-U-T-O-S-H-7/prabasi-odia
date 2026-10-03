import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cultureStories } from './experienceData';

export default function CultureSection() {
  const [featured, ...moreStories] = cultureStories;

  return (
    <section id="culture" className="scroll-mt-20 bg-[#EFE5D8] px-4 py-14 sm:px-6 lg:px-0 lg:py-18">
      <div className="mx-auto max-w-[90rem] lg:mx-10 2xl:mx-auto">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A45D39]">05 / Living culture</p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#2E2A22] sm:text-4xl lg:text-5xl">
              Our traditions <span className="italic font-normal text-[#AD673F]">move with us.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#6B645B]">Dance, painting and fabric each tell part of Odisha’s story. Look closer at the people and places behind them.</p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <a
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Learn about ${featured.title} on Odisha Tourism (opens in a new tab)`}
            className="group relative isolate flex min-h-[330px] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-[#423128] p-5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] sm:min-h-[430px] sm:p-7"
          >
            <Image src={featured.image} alt="" fill sizes="(max-width: 1023px) 100vw, 55vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
            <span className="relative max-w-md">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#F5CCA0]">A story in movement</span>
              <span className="mt-2 block font-serif text-3xl font-bold sm:text-4xl">{featured.title}</span>
              <span className="mt-2 block text-sm leading-6 text-white/85">{featured.description} {featured.detail}</span>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#F5CCA0]">Discover the story <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
            </span>
          </a>

          <div className="grid gap-4">
            {moreStories.map((story) => (
              <a
                key={story.title}
                href={story.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Learn about ${story.title} on Odisha Tourism (opens in a new tab)`}
                className="group grid min-h-[200px] overflow-hidden rounded-[1.35rem] border border-[#DBC8B6] bg-[#FFF9F2] shadow-lg shadow-[#60412B]/5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] sm:grid-cols-[42%_58%]"
              >
                <span className="relative min-h-44 overflow-hidden bg-[#8C5E42] sm:min-h-0"><Image src={story.image} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 42vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></span>
                <span className="flex flex-col justify-center p-4 sm:p-5">
                  <span className="font-serif text-xl font-bold text-[#2E2A22]">{story.title}</span>
                  <span className="mt-2 text-sm leading-6 text-[#6B645B]">{story.description}</span>
                  <span className="mt-2 text-xs leading-5 text-[#9A6750]">{story.detail}</span>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#6B1E5B]">Explore <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <Link href="/cultural-teams" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#6B1E5B] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
          Meet cultural teams in our community <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
