import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { adivasiStories } from './experienceData';

const tileLayouts = [
  'sm:col-span-2 lg:col-span-7 lg:min-h-[390px]',
  'lg:col-span-5 lg:min-h-[390px]',
  'lg:col-span-4 lg:min-h-[300px]',
  'lg:col-span-4 lg:min-h-[300px]',
  'lg:col-span-4 lg:min-h-[300px]',
  'sm:col-span-2 lg:col-span-12 lg:min-h-[280px]',
];

export default function AdivasiSection() {
  return (
    <section id="adivasi-odisha" className="relative isolate scroll-mt-20 overflow-hidden bg-[#E3C9AA] px-3 py-8 text-[#342820] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="pointer-events-none absolute -right-32 -top-44 -z-10 h-[500px] w-[500px] rounded-full border-[70px] border-[#B89069]/10" aria-hidden="true" />
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#915434] sm:text-xs"><Sparkles className="h-4 w-4" aria-hidden="true" />05 / Communities & craft</p>
            <h2 className="mt-2 max-w-4xl font-serif text-[clamp(2rem,4.5vw,3.8rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
              Many communities. <span className="font-normal italic text-[#A35E3D]">Many living stories.</span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#66564A] sm:text-base sm:leading-8">Across Odisha, art, craft and place carry knowledge shaped by the people who live and work here. Choose a story to look closer.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-8 lg:grid-cols-12">
          {adivasiStories.map((story, index) => (
            <Link
              key={story.slug}
              href={`/odisha-tourism/stories/${story.slug}`}
              aria-label={`Explore ${story.title}`}
              className={`group relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[1.3rem] border border-[#B79778]/45 bg-[#774735] p-5 text-white shadow-[0_20px_45px_rgba(91,58,37,0.15)] transition duration-300 hover:-translate-y-1 hover:border-[#A35E3D] hover:shadow-[0_28px_55px_rgba(91,58,37,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A35E3D] sm:min-h-[300px] sm:rounded-[1.7rem] sm:p-6 lg:p-7 ${tileLayouts[index]}`}
            >
              {story.image ? (
                <Image src={story.image} alt="" fill sizes={index === 5 ? '(max-width: 1023px) 100vw, 90vw' : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 55vw'} className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <span
                  className={`absolute inset-0 -z-20 ${index === 1 ? 'bg-[#8A463B]' : 'bg-[#6B513E]'}`}
                  style={{ backgroundImage: index === 1 ? 'repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,230,195,0.12) 18px 21px), repeating-linear-gradient(0deg, transparent 0 34px, rgba(255,230,195,0.12) 34px 39px)' : 'radial-gradient(circle at 72% 38%, transparent 0 55px, rgba(232,191,132,0.16) 56px 59px, transparent 60px 105px, rgba(232,191,132,0.13) 106px 109px, transparent 110px), linear-gradient(135deg, #73573D, #3E2F27)' }}
                  aria-hidden="true"
                />
              )}
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#261B16]/95 via-[#302019]/35 to-[#302019]/20" aria-hidden="true" />
              <span className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-white/40 bg-black/20 px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] backdrop-blur-sm">{String(index + 1).padStart(2, '0')} / 06</span>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/55 bg-white/15 transition group-hover:bg-[#EEC89C] group-hover:text-[#342820] sm:h-10 sm:w-10"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
              </span>
              <span className={index === 5 ? 'max-w-2xl' : 'max-w-lg'}>
                <span className="block font-serif text-sm italic text-[#F3CAA0] sm:text-base">{story.theme}</span>
                <span className={`mt-1.5 block font-medium leading-[1.15] tracking-[-0.035em] ${index === 0 || index === 5 ? 'text-[clamp(1.65rem,3.2vw,2.7rem)]' : 'text-[clamp(1.5rem,2.25vw,2.1rem)]'}`} style={{ fontFamily: 'var(--font-body)' }}>{story.title}</span>
                <span className="mt-3 block h-px w-10 bg-[#F3CAA0]/75" aria-hidden="true" />
                <span className="mt-2 block max-w-lg text-xs leading-5 text-white/85 sm:text-sm sm:leading-6">{story.description}</span>
                <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#F3CAA0]">Read the story <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span>
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-xs leading-6 text-[#746354]">Images are illustrative. When visiting communities and workshops, follow local guidance and ask before photographing people or their work.</p>
      </div>
    </section>
  );
}
