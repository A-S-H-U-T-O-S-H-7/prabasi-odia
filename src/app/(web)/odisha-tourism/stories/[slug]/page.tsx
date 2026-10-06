import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, MapPin } from 'lucide-react';
import { adivasiStories } from '@/components/web/odisha-tourism/experienceData';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return adivasiStories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = adivasiStories.find((entry) => entry.slug === slug);
  if (!story) return { title: 'Story not found | Explore Odisha' };

  return {
    title: `${story.title} | Stories of Odisha | Prabasi Odia`,
    description: story.description,
    openGraph: { title: `${story.title} | Stories of Odisha`, description: story.description },
  };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = adivasiStories.find((entry) => entry.slug === slug);
  if (!story) notFound();
  const related = adivasiStories.filter((entry) => entry.slug !== story.slug).slice(0, 3);

  return (
    <div className="overflow-hidden bg-[#F7F1E7] text-[#263B34]">
      <header className="relative isolate flex min-h-[450px] items-end overflow-hidden bg-[#234439] text-white sm:min-h-[550px] lg:min-h-[620px]">
        {story.image ? (
          <Image src={story.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        ) : (
          <span className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_35%,#A26B4B,transparent_35%),repeating-linear-gradient(90deg,#704636_0px,#704636_25px,#825540_25px,#825540_29px)]" aria-hidden="true" />
        )}
        <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10261F] via-[#10261F]/65 to-[#10261F]/15" aria-hidden="true" />
        <div className="mx-auto w-full max-w-[94rem] px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8 lg:pb-18">
          <Link href="/odisha-tourism#adivasi-odisha" className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/20 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to living stories
          </Link>
          <div className="mt-14 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] sm:mt-20">
            <span className="rounded-full bg-[#EAC596] px-3 py-1.5 text-[#263B34]">{story.theme}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-black/20 px-3 py-1.5 backdrop-blur-sm"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{story.region}</span>
          </div>
          <h1 className="mt-4 max-w-5xl font-serif text-[clamp(2.8rem,9vw,6.5rem)] font-bold leading-[1.02] tracking-[-0.055em]">{story.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-lg sm:leading-8">{story.description}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[94rem] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#718076]">
          <Link href="/odisha-tourism" className="hover:text-[#A55E37] hover:underline">Explore Odisha</Link><span aria-hidden="true">/</span>
          <Link href="/odisha-tourism#adivasi-odisha" className="hover:text-[#A55E37] hover:underline">Living stories</Link><span aria-hidden="true">/</span>
          <span className="font-semibold text-[#263B34]">{story.title}</span>
        </nav>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(270px,360px)] lg:gap-16">
          <article>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A55E37]">01 / The story</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">A closer look</h2>
            <p className="mt-6 max-w-3xl font-serif text-xl leading-8 text-[#3D5549] sm:text-2xl sm:leading-10">{story.description}</p>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#53685C] sm:text-base sm:leading-9">{story.detail}</p>

            <section className="mt-12 sm:mt-16" aria-labelledby="notice-heading">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A55E37]">02 / Look closer</p>
              <h2 id="notice-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">What makes it memorable</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {story.highlights.map((highlight, index) => (
                  <div key={highlight} className="relative min-h-40 overflow-hidden rounded-[1.3rem] border border-[#DCCDB9] bg-[#FFFDF7] p-5 sm:min-h-44">
                    <span className="font-serif text-4xl italic text-[#D9B88E]">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="mt-5 font-serif text-lg font-bold leading-snug sm:text-xl">{highlight}</h3>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="rounded-[1.5rem] border border-[#DDD2C2] bg-[#FFFDF8] p-5 shadow-[0_20px_45px_rgba(35,52,39,0.06)] sm:p-7 lg:sticky lg:top-24" aria-label="Story information">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8EEDC] text-[#326856]"><Compass className="h-5 w-5" aria-hidden="true" /></span><h2 className="font-serif text-2xl font-bold">Good to know</h2></div>
            <dl className="mt-5 divide-y divide-[#E9E1D4] text-sm">
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#6F7A6F]">Focus</dt><dd className="text-right font-semibold">{story.theme}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#6F7A6F]">Region</dt><dd className="max-w-[65%] text-right font-semibold">{story.region}</dd></div>
            </dl>
            <div className="mt-5 rounded-xl bg-[#F3E9D9] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A55E37]">Explore with care</p><p className="mt-2 text-sm leading-6 text-[#59675B]">{story.visitNote}</p></div>
            <Link href="/odisha-tourism#adivasi-odisha" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#A55E37] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A55E37]">See all six stories <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </aside>
        </div>

        <section className="mt-16 border-t border-[#D6C8B5] pt-10 sm:mt-20 sm:pt-12" aria-labelledby="related-heading">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A55E37]">03 / Keep exploring</p><h2 id="related-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">More living stories</h2></div><Link href="/odisha-tourism#adivasi-odisha" className="inline-flex items-center gap-2 text-sm font-bold text-[#A55E37] hover:underline">View the collection <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/odisha-tourism/stories/${item.slug}`} className="group relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-[1.35rem] bg-[#855543] p-5 text-white transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A55E37] sm:min-h-64">
                {item.image && <Image src={item.image} alt="" fill sizes="(max-width: 639px) 100vw, 33vw" className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105" />}
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#10261F]/95 via-[#10261F]/25 to-transparent" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F1C89D]">{item.theme}</span><span className="mt-1 flex items-end justify-between gap-2 font-serif text-xl font-bold sm:text-2xl">{item.title}<ArrowUpRight className="h-5 w-5 shrink-0 text-[#F1C89D]" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
