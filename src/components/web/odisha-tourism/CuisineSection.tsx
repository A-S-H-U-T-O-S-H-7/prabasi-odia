import Image from 'next/image';
import { ArrowUpRight, UtensilsCrossed } from 'lucide-react';
import { cuisine } from './experienceData';

export default function CuisineSection() {
  return (
    <section id="cuisine" className="scroll-mt-20 bg-[#FFF9F2] px-4 py-14 sm:px-6 lg:px-0 lg:py-18">
      <div className="mx-auto max-w-[90rem] lg:mx-10 2xl:mx-auto">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#A45D39]"><UtensilsCrossed className="h-4 w-4" />03 / Taste of Odisha</p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#2E2A22] sm:text-4xl lg:text-5xl">
              Flavours that <span className="italic font-normal text-[#AD673F]">feel like home.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#6B645B]">Food has a way of remembering for us. Begin with everyday favourites, then follow the flavours into Odisha’s kitchens and markets.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cuisine.map((dish, index) => (
            <a
              key={dish.title}
              href={dish.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read about ${dish.title} on Odisha Tourism (opens in a new tab)`}
              className="group overflow-hidden rounded-[1.6rem] border border-[#E8D9C8] bg-white shadow-lg shadow-[#60412B]/5 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"
            >
              <span className="relative block aspect-[16/10] overflow-hidden bg-[#B8895D]">
                <Image src={dish.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7F4932] backdrop-blur-sm">On the table · 0{index + 1}</span>
              </span>
              <span className="block p-5 sm:p-6">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-serif text-xl font-bold text-[#2E2A22]">{dish.title}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DDBEA8] text-[#A45D39] transition group-hover:bg-[#A45D39] group-hover:text-white" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
                </span>
                <span className="mt-2 block text-sm font-medium text-[#A45D39]">{dish.description}</span>
                <span className="mt-2 block text-sm leading-6 text-[#6B645B]">{dish.detail}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
